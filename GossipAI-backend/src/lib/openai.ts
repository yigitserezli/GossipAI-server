import { env } from "../config/env";
import { AppError } from "../shared/errors/app-error";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CompletionOptions {
  threadId?: string | null;
}

interface CompletionResult {
  content: string;
  promptTokens: number | null;
  completionTokens: number | null;
  threadId: string | null;
}

interface OpenAIRunResponse {
  id: string;
  status: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  last_error?: {
    message?: string;
  } | null;
}

const OPENAI_BASE_URL = "https://api.openai.com/v1";
const OPENAI_ASSISTANTS_BETA = "assistants=v2";
const RUN_POLL_INTERVAL_MS = 700;
const RUN_POLL_MAX_TRIES = 45;

const delay = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const requestOpenAI = async <T>(
  path: string,
  init: RequestInit,
  options?: { assistantsApi?: boolean }
): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${env.OPENAI_API_KEY}`);
  if (options?.assistantsApi) {
    headers.set("OpenAI-Beta", OPENAI_ASSISTANTS_BETA);
  }

  const response = await fetch(`${OPENAI_BASE_URL}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError("OpenAI request failed", 502, {
      status: response.status,
      body: errorText,
      path
    });
  }

  return (await response.json()) as T;
};

const asOpenAIStatusCode = (error: unknown): number | null => {
  if (!(error instanceof AppError) || !error.details || typeof error.details !== "object") {
    return null;
  }

  const details = error.details as { status?: unknown };
  return typeof details.status === "number" ? details.status : null;
};

const latestUserMessage = (messages: ChatMessage[]): ChatMessage | undefined => {
  return [...messages]
    .reverse()
    .find((message) => message.role === "user" && message.content.trim().length > 0);
};

const toAdditionalInstructions = (messages: ChatMessage[]): string | undefined => {
  const instructions = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content.trim())
    .filter((content) => content.length > 0)
    .join("\n\n");

  return instructions.length > 0 ? instructions : undefined;
};

const extractAssistantText = (
  items: Array<{
    type?: string;
    text?: {
      value?: string;
    };
  }> = []
): string => {
  const chunks = items
    .filter((item) => item.type === "text")
    .map((item) => item.text?.value?.trim() ?? "")
    .filter((item) => item.length > 0);

  return chunks.join("\n").trim();
};

const createThreadFromMessages = async (messages: ChatMessage[]): Promise<string> => {
  const threadMessages = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content.trim()
    }))
    .filter((message) => message.content.length > 0);

  if (threadMessages.length === 0) {
    throw new AppError("Cannot create OpenAI thread without messages", 500);
  }

  const thread = await requestOpenAI<{ id?: string }>(
    "/threads",
    {
      method: "POST",
      body: JSON.stringify({
        messages: threadMessages
      })
    },
    { assistantsApi: true }
  );

  if (!thread.id) {
    throw new AppError("OpenAI returned invalid thread response", 502, thread);
  }

  return thread.id;
};

const appendMessageToThread = async (threadId: string, content: string): Promise<void> => {
  await requestOpenAI(
    `/threads/${threadId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        role: "user",
        content
      })
    },
    { assistantsApi: true }
  );
};

const createRun = async (threadId: string, additionalInstructions?: string): Promise<OpenAIRunResponse> => {
  if (!env.OPENAI_ASSISTANT_ID) {
    throw new AppError("OPENAI_ASSISTANT_ID is missing", 500);
  }

  const run = await requestOpenAI<OpenAIRunResponse>(
    `/threads/${threadId}/runs`,
    {
      method: "POST",
      body: JSON.stringify({
        assistant_id: env.OPENAI_ASSISTANT_ID,
        response_format: { type: "json_object" },
        ...(additionalInstructions ? { additional_instructions: additionalInstructions } : {})
      })
    },
    { assistantsApi: true }
  );

  if (!run.id) {
    throw new AppError("OpenAI returned invalid run response", 502, run);
  }

  return run;
};

const waitForRunCompletion = async (threadId: string, runId: string): Promise<OpenAIRunResponse> => {
  let run = await requestOpenAI<OpenAIRunResponse>(
    `/threads/${threadId}/runs/${runId}`,
    {
      method: "GET"
    },
    { assistantsApi: true }
  );

  for (let i = 0; i < RUN_POLL_MAX_TRIES; i += 1) {
    if (run.status === "completed") {
      return run;
    }

    if (run.status === "failed" || run.status === "cancelled" || run.status === "expired" || run.status === "incomplete") {
      throw new AppError("OpenAI assistant run failed", 502, {
        status: run.status,
        error: run.last_error?.message ?? null
      });
    }

    await delay(RUN_POLL_INTERVAL_MS);

    run = await requestOpenAI<OpenAIRunResponse>(
      `/threads/${threadId}/runs/${runId}`,
      {
        method: "GET"
      },
      { assistantsApi: true }
    );
  }

  throw new AppError("Timed out waiting for OpenAI assistant run", 504, {
    threadId,
    runId
  });
};

const getAssistantRunMessage = async (threadId: string, runId: string): Promise<string> => {
  const listResponse = await requestOpenAI<{
    data?: Array<{
      role?: string;
      run_id?: string | null;
      content?: Array<{
        type?: string;
        text?: {
          value?: string;
        };
      }>;
    }>;
  }>(
    `/threads/${threadId}/messages?order=desc&limit=20`,
    {
      method: "GET"
    },
    { assistantsApi: true }
  );

  const targetMessage =
    listResponse.data?.find((message) => message.role === "assistant" && message.run_id === runId) ??
    listResponse.data?.find((message) => message.role === "assistant");

  const content = extractAssistantText(targetMessage?.content);

  if (!content) {
    throw new AppError("OpenAI returned empty assistant content", 502, {
      threadId,
      runId
    });
  }

  return content;
};

const createCompletionWithAssistant = async (
  messages: ChatMessage[],
  options?: CompletionOptions
): Promise<CompletionResult> => {
  const additionalInstructions = toAdditionalInstructions(messages);
  const newestUserMessage = latestUserMessage(messages);

  if (!newestUserMessage) {
    throw new AppError("User message is required", 400);
  }

  let threadId = options?.threadId ?? null;

  if (threadId) {
    try {
      await appendMessageToThread(threadId, newestUserMessage.content);
    } catch (error) {
      // Existing thread may be deleted externally; recreate from local message history.
      if (asOpenAIStatusCode(error) !== 404) {
        throw error;
      }
      threadId = null;
    }
  }

  if (!threadId) {
    threadId = await createThreadFromMessages(messages);
  }

  const run = await createRun(threadId, additionalInstructions);
  const completedRun = await waitForRunCompletion(threadId, run.id);
  const content = await getAssistantRunMessage(threadId, run.id);

  return {
    content,
    promptTokens: completedRun.usage?.prompt_tokens ?? null,
    completionTokens: completedRun.usage?.completion_tokens ?? null,
    threadId
  };
};

const createCompletionWithModel = async (messages: ChatMessage[]): Promise<CompletionResult> => {
  const data = await requestOpenAI<{
    choices?: Array<{ message?: { content?: string | null } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
    };
  }>(
    "/chat/completions",
    {
      method: "POST",
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages
      })
    }
  );

  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new AppError("OpenAI returned empty content", 502);
  }

  return {
    content,
    promptTokens: data.usage?.prompt_tokens ?? null,
    completionTokens: data.usage?.completion_tokens ?? null,
    threadId: null
  };
};

export const createChatCompletion = async (
  messages: ChatMessage[],
  options?: CompletionOptions
): Promise<CompletionResult> => {
  if (env.OPENAI_ASSISTANT_ID) {
    return createCompletionWithAssistant(messages, options);
  }

  return createCompletionWithModel(messages);
};
