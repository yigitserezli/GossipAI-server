import { MemoryMode, MessageRole, type Prisma } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { conversationService } from "../conversation/conversation.service";
import {
  T3_HELP_ME_REPLY_INSTRUCTIONS,
  T3_HELP_ME_RESOLVE_INSTRUCTIONS,
  T3_SITUATION_ANALYSIS_INSTRUCTIONS,
  T3_SUMMARIZE_INSTRUCTIONS,
} from "./chatkit.agent-instructions";
import type { ChatkitMessageInput } from "./chatkit.schema";

interface ChatKitSessionResponse {
  id?: string;
  client_secret?: string;
  expires_at?: number;
  thread_id?: string;
  thread?: {
    id?: string;
  };
}

interface CreateSessionResult {
  sessionId: string | null;
  clientSecret: string;
  expiresAt: string | null;
  threadId: string | null;
}

interface AgentResult {
  content: string;
  promptTokens: number | null;
  completionTokens: number | null;
}

type AgentRole = "user" | "assistant" | "system";

interface AgentInputItem {
  role: AgentRole;
  content: Array<
    | { type: "input_text"; text: string }
    | { type: "input_image"; image_url: string }
    | { type: "input_image"; file_id: string }
  >;
}

interface RunnerUsage {
  inputTokens?: number;
  outputTokens?: number;
  input_tokens?: number;
  output_tokens?: number;
}

interface RunnerResultItem {
  rawItem?: unknown;
}

interface RunnerResult {
  finalOutput?: unknown;
  newItems?: RunnerResultItem[];
  usage?: RunnerUsage;
}

interface AgentsSdk {
  Agent: new (options: Record<string, unknown>) => unknown;
  Runner: new (options?: Record<string, unknown>) => {
    run: (agent: unknown, items: AgentInputItem[]) => Promise<RunnerResult>;
  };
  webSearchTool: (options: Record<string, unknown>) => unknown;
  withTrace: <T>(traceName: string, run: () => Promise<T>) => Promise<T>;
}

const OPENAI_CHATKIT_BETA = "chatkit_beta=v1";
const AGENTS_SDK_MODULE_NAME = "@openai/agents";
const MAX_AGENT_HISTORY_MESSAGES = 24;

type AgentMode = "HELP_ME_REPLY" | "HELP_ME_RESOLVE" | "SITUATION_ANALYSIS" | "SUMMARIZE";

const AGENT_CONFIGS: Record<AgentMode, { name: string; instructions: string; reasoningEffort: string }> = {
  HELP_ME_REPLY: {
    name: "T3_HELP_ME_REPLY",
    instructions: T3_HELP_ME_REPLY_INSTRUCTIONS,
    reasoningEffort: "high",
  },
  HELP_ME_RESOLVE: {
    name: "T3_HELP_ME_RESOLVE",
    instructions: T3_HELP_ME_RESOLVE_INSTRUCTIONS,
    reasoningEffort: "high",
  },
  SITUATION_ANALYSIS: {
    name: "T3_SITUATION_ANALYSIS",
    instructions: T3_SITUATION_ANALYSIS_INSTRUCTIONS,
    reasoningEffort: "high",
  },
  SUMMARIZE: {
    name: "T3_SUMMARIZE",
    instructions: T3_SUMMARIZE_INSTRUCTIONS,
    reasoningEffort: "medium",
  },
};

let agentsSdkPromise: Promise<AgentsSdk> | null = null;
const agentCache = new Map<AgentMode, Promise<{ sdk: AgentsSdk; agent: unknown }>>();

const supportsReasoningEffort = (model: string): boolean => {
  const normalized = model.trim().toLowerCase();
  return normalized.startsWith("o") || normalized.startsWith("gpt-5");
};

const toSingleLine = (value: string): string => {
  return value.replace(/\s+/g, " ").trim();
};

const truncateWithEllipsis = (value: string, maxChars: number): string => {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, Math.max(1, maxChars - 1)).trimEnd()}...`;
};

const buildTurnSummary = (userContent: string, assistantContent: string): string => {
  const userPart = truncateWithEllipsis(toSingleLine(userContent), 220);
  const assistantPart = truncateWithEllipsis(toSingleLine(assistantContent), 220);
  return `Kullanici: ${userPart} | Asistan: ${assistantPart}`;
};

const mergeRollingSummary = (previousSummary: string, turnSummary: string): string => {
  const lines = previousSummary
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  lines.push(`- ${turnSummary}`);

  const maxLines = 12;
  const latestLines = lines.slice(-maxLines);
  return latestLines.join("\n");
};

const asInputJson = (value: unknown): Prisma.InputJsonValue => {
  return value as Prisma.InputJsonValue;
};

const normalizeSafetyFlags = (value: Prisma.JsonValue | null): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

const toNullableTokenCount = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(Math.trunc(value), 0);
};

const buildAgentInputText = (input: ChatkitMessageInput): string => {
  const lines = [`MODE: ${input.mode}`];

  if (input.style) {
    lines.push(`STYLE: ${input.style}`);
  }
  if (input.userGender) {
    lines.push(`USER_GENDER: ${input.userGender}`);
  }
  if (input.targetGender) {
    lines.push(`TARGET_GENDER: ${input.targetGender}`);
  }
  if (input.relation) {
    lines.push(`RELATION: ${input.relation}`);
  }
  if (input.goal) {
    lines.push(`GOAL: ${input.goal}`);
  }
  if (input.toneLimits) {
    lines.push(`TONE_LIMITS: ${input.toneLimits}`);
  }

  lines.push("", "USER_MESSAGE:", input.content);

  if (input.context) {
    lines.push("", "ADDITIONAL_CONTEXT:", input.context);
  }
  if (input.chatLog) {
    lines.push("", "CHAT_LOG:", input.chatLog);
  }

  return lines.join("\n");
};

const toAgentInputItem = (message: {
  role: MessageRole;
  content: string | null;
  contentRedacted: string | null;
  imageFileId?: string | null;
}): AgentInputItem | null => {
  const text = (message.contentRedacted ?? message.content ?? "").trim();
  const hasImage = message.role === MessageRole.user && !!message.imageFileId;

  if (!text && !hasImage) {
    return null;
  }

  const normalizedText =
    message.role === MessageRole.user
      ? text
      : message.role === MessageRole.assistant
        ? `PREVIOUS_ASSISTANT_REPLY: ${text}`
        : `PREVIOUS_SYSTEM_MESSAGE: ${text}`;

  const content: AgentInputItem["content"] = [];

  if (normalizedText) {
    content.push({ type: "input_text", text: normalizedText });
  }

  if (hasImage && message.imageFileId) {
    content.push({
      type: "input_image",
      file_id: message.imageFileId
    } as { type: "input_image"; file_id: string });
  }

  return {
    // Keep history in user-role inputs to avoid role-compatibility issues across agent runtimes.
    role: "user",
    content
  };
};

const normalizeAgentOutputText = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  if ("text" in value) {
    const text = (value as { text?: unknown }).text;
    if (typeof text === "string") {
      return text.trim();
    }
  }

  if ("content" in value) {
    const content = (value as { content?: unknown }).content;
    if (Array.isArray(content)) {
      const chunks = content
        .map((item) => {
          if (!item || typeof item !== "object") {
            return "";
          }

          if ("text" in item) {
            const maybeText = (item as { text?: unknown }).text;
            if (typeof maybeText === "string") {
              return maybeText.trim();
            }
            if (maybeText && typeof maybeText === "object") {
              const nested = (maybeText as { value?: unknown }).value;
              if (typeof nested === "string") {
                return nested.trim();
              }
            }
          }

          return "";
        })
        .filter((chunk) => chunk.length > 0);

      return chunks.join("\n").trim();
    }
  }

  return "";
};

const extractRunnerOutputText = (result: RunnerResult): string => {
  const fromFinalOutput = normalizeAgentOutputText(result.finalOutput);
  if (fromFinalOutput) {
    return fromFinalOutput;
  }

  if (Array.isArray(result.newItems)) {
    const reversedItems = [...result.newItems].reverse();
    for (const item of reversedItems) {
      const text = normalizeAgentOutputText(item.rawItem);
      if (text) {
        return text;
      }
    }
  }

  return "";
};

const loadAgentsSdk = async (): Promise<AgentsSdk> => {
  if (!agentsSdkPromise) {
    agentsSdkPromise = (async () => {
      try {
        const moduleName = AGENTS_SDK_MODULE_NAME;
        const sdk = (await import(moduleName)) as unknown as Partial<AgentsSdk>;

        if (
          typeof sdk.Agent !== "function" ||
          typeof sdk.Runner !== "function" ||
          typeof sdk.webSearchTool !== "function" ||
          typeof sdk.withTrace !== "function"
        ) {
          throw new Error("Invalid @openai/agents exports");
        }

        return sdk as AgentsSdk;
      } catch (error) {
        throw new AppError(
          "Agents SDK is not available. Install `@openai/agents` and redeploy.",
          500,
          {
            cause: error instanceof Error ? error.message : String(error)
          }
        );
      }
    })();
  }

  return agentsSdkPromise;
};

const getAgentForMode = async (mode: AgentMode): Promise<{ sdk: AgentsSdk; agent: unknown }> => {
  const cached = agentCache.get(mode);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const sdk = await loadAgentsSdk();
    const config = AGENT_CONFIGS[mode];

    const tools: unknown[] = [];
    if (mode !== "SUMMARIZE") {
      tools.push(
        sdk.webSearchTool({
          searchContextSize: "medium",
          userLocation: { type: "approximate" },
        })
      );
    }

    const agent = new sdk.Agent({
      name: config.name,
      instructions: config.instructions,
      model: env.OPENAI_AGENT_MODEL,
      tools,
      modelSettings: {
        ...(supportsReasoningEffort(env.OPENAI_AGENT_MODEL)
          ? { reasoning: { effort: config.reasoningEffort } }
          : {}),
        store: true,
      },
    });

    return { sdk, agent };
  })();

  agentCache.set(mode, promise);
  return promise;
};

const resolveAgentMode = (input: ChatkitMessageInput): AgentMode => {
  const mode = input.mode as string;
  if (mode in AGENT_CONFIGS) {
    return mode as AgentMode;
  }
  return "HELP_ME_REPLY";
};

const uploadImageToOpenAI = async (imageBase64: string): Promise<string> => {
  const buffer = Buffer.from(imageBase64, "base64");
  const boundary = `----FormBoundary${Date.now()}`;

  const headerPart = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="purpose"\r\n\r\nvision\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="image.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`,
    "utf8"
  );
  const footerPart = Buffer.from(`\r\n--${boundary}--\r\n`, "utf8");
  const body = Buffer.concat([headerPart, buffer, footerPart]);

  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(body.length),
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError("Failed to upload image to OpenAI", 502, { status: response.status, body: errorText });
  }

  const data = (await response.json()) as { id: string };
  return data.id;
};

const runRosieAgent = async (prompt: string, history: AgentInputItem[], mode: AgentMode, imageFileId?: string): Promise<AgentResult> => {
  if (!env.OPENAI_WORKFLOW_ID) {
    throw new AppError("OPENAI_WORKFLOW_ID is not configured", 500);
  }

  console.log("[runRosieAgent] ▶ Starting agent call", {
    mode,
    historyLength: history.length,
    hasImage: !!imageFileId,
    imageFileId: imageFileId ?? null,
    promptPreview: prompt.slice(0, 200)
  });

  const { sdk, agent } = await getAgentForMode(mode);

  const userContentItems: AgentInputItem["content"] = [
    { type: "input_text", text: prompt }
  ];

  if (imageFileId) {
    console.log("[runRosieAgent] Attaching image file_id:", imageFileId);
    userContentItems.push({
      type: "input_image",
      file_id: imageFileId
    } as { type: "input_image"; file_id: string });
  }

  const conversationHistory: AgentInputItem[] = [
    ...history,
    {
      role: "user",
      content: userContentItems
    }
  ];

  let result: RunnerResult;

  try {
    result = await sdk.withTrace(env.OPENAI_WORKFLOW_NAME ?? "Tier3_Rosie", async () => {
      const runner = new sdk.Runner({
        traceMetadata: {
          __trace_source__: "agent-builder",
          workflow_id: env.OPENAI_WORKFLOW_ID
        }
      });

      return runner.run(agent, conversationHistory);
    });
  } catch (error) {
    console.error("[runRosieAgent] OpenAI agent execution failed", {
      mode,
      hasImage: !!imageFileId,
      imageFileId: imageFileId ?? null,
      historyLength: history.length,
      error: error instanceof Error
        ? { message: error.message, name: error.name, stack: error.stack, ...(error as any) }
        : String(error)
    });
    throw new AppError("OpenAI agent execution failed", 502, {
      cause: error instanceof Error ? error.message : String(error)
    });
  }

  const content = extractRunnerOutputText(result);

  console.log("[runRosieAgent] ◀ Agent response received", {
    mode,
    hasContent: !!content,
    contentLength: content.length,
    contentPreview: content.slice(0, 300),
    promptTokens: result.usage?.inputTokens ?? result.usage?.input_tokens ?? null,
    completionTokens: result.usage?.outputTokens ?? result.usage?.output_tokens ?? null
  });

  if (!content) {
    throw new AppError("OpenAI agent returned empty response", 502, result);
  }

  return {
    content,
    promptTokens: toNullableTokenCount(result.usage?.inputTokens ?? result.usage?.input_tokens),
    completionTokens: toNullableTokenCount(result.usage?.outputTokens ?? result.usage?.output_tokens)
  };
};

const ensureConversationForUser = async (conversationId: string, userId: string) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
      status: {
        not: "deleted"
      }
    },
    include: {
      state: true
    }
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  return conversation;
};

export const chatkitService = {
  async createSession(userId: string): Promise<CreateSessionResult> {
    if (!env.OPENAI_WORKFLOW_ID) {
      throw new AppError("OPENAI_WORKFLOW_ID is not configured", 500);
    }

    const response = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "OpenAI-Beta": OPENAI_CHATKIT_BETA
      },
      body: JSON.stringify({
        user: userId,
        workflow: {
          id: env.OPENAI_WORKFLOW_ID,
          ...(env.OPENAI_WORKFLOW_VERSION ? { version: env.OPENAI_WORKFLOW_VERSION } : {})
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError("OpenAI ChatKit session request failed", 502, {
        status: response.status,
        body: errorText
      });
    }

    const data = (await response.json()) as ChatKitSessionResponse;

    if (!data.client_secret || data.client_secret.trim().length === 0) {
      throw new AppError("OpenAI ChatKit session response missing client_secret", 502, data);
    }

    const threadId = data.thread_id ?? data.thread?.id ?? null;

    return {
      sessionId: data.id ?? null,
      clientSecret: data.client_secret,
      expiresAt: typeof data.expires_at === "number" ? new Date(data.expires_at * 1000).toISOString() : null,
      threadId
    };
  },

  async sendMessage(userId: string, input: ChatkitMessageInput) {
    console.log("[sendMessage] ▶ Incoming request", {
      userId,
      conversationId: input.conversationId ?? "(new)",
      mode: input.mode,
      style: input.style ?? null,
      relation: input.relation ?? null,
      userGender: input.userGender ?? null,
      hasImage: !!input.imageBase64,
      imageSizeBytes: input.imageBase64 ? Buffer.byteLength(input.imageBase64, "utf8") : 0,
      contentLength: input.content.length,
      contentPreview: input.content.slice(0, 150)
    });
    try {
      let conversationId = input.conversationId;

      if (!conversationId) {
        const createdConversation = await conversationService.create(userId, {
          title: input.title,
          mode: resolveAgentMode(input),
          style: input.style ?? undefined,
          relation: input.relation ?? undefined,
          memoryMode: input.memoryMode ?? MemoryMode.summary_only
        });
        conversationId = createdConversation.id;
      }

      const conversation = await ensureConversationForUser(conversationId, userId);

      if (conversation.status !== "active") {
        throw new AppError("Conversation is not active", 409);
      }

      const priorMessages = await prisma.message.findMany({
        where: {
          conversationId
        },
        orderBy: {
          createdAt: "desc"
        },
        take: MAX_AGENT_HISTORY_MESSAGES
      });

      const historyItems = priorMessages
        .reverse()
        .map(toAgentInputItem)
        .filter((item): item is AgentInputItem => item !== null);

      const currentSafetyFlags = normalizeSafetyFlags(conversation.state?.safetyFlagsJson ?? null);

      // Upload image before saving to DB so we can persist the file_id
      let imageFileId: string | undefined;
      if (input.imageBase64) {
        imageFileId = await uploadImageToOpenAI(input.imageBase64);
        console.log("[sendMessage] Image uploaded, file_id:", imageFileId);
      }

      const userMessage = await prisma.message.create({
        data: {
          conversationId,
          role: MessageRole.user,
          content: input.content,
          contentRedacted: input.content,
          ...(imageFileId ? { imageFileId } : {})
        }
      });

      const agentResult = await runRosieAgent(buildAgentInputText(input), historyItems, resolveAgentMode(input), imageFileId);

      const assistantMessage = await prisma.message.create({
        data: {
          conversationId,
          role: MessageRole.assistant,
          content: agentResult.content,
          contentRedacted: agentResult.content,
          tokensIn: agentResult.promptTokens,
          tokensOut: agentResult.completionTokens
        }
      });

      const nextRollingSummary = mergeRollingSummary(
        conversation.state?.rollingSummary ?? "",
        buildTurnSummary(input.content, agentResult.content)
      );

      await prisma.conversationState.upsert({
        where: {
          conversationId
        },
        create: {
          conversationId,
          rollingSummary: nextRollingSummary,
          factsJson: asInputJson(conversation.state?.factsJson ?? []),
          openLoopsJson: asInputJson(conversation.state?.openLoopsJson ?? []),
          safetyFlagsJson: asInputJson(currentSafetyFlags),
          lastSummarizedMessageId: userMessage.id
        },
        update: {
          rollingSummary: nextRollingSummary,
          safetyFlagsJson: asInputJson(currentSafetyFlags),
          lastSummarizedMessageId: userMessage.id
        }
      });

      const conversationSnapshot = await conversationService.get(userId, conversationId, 1);

      return {
        conversationId,
        assistant: {
          id: assistantMessage.id,
          role: assistantMessage.role,
          content: agentResult.content,
          createdAt: assistantMessage.createdAt.toISOString(),
          tokensIn: assistantMessage.tokensIn,
          tokensOut: assistantMessage.tokensOut
        },
        state: conversationSnapshot.state,
        summaryUpdated: true
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("[sendMessage] Unexpected error", {
        userId,
        conversationId: input.conversationId,
        mode: input.mode,
        hasImage: !!input.imageBase64,
        error: error instanceof Error
          ? { message: error.message, name: error.name, stack: error.stack }
          : String(error)
      });
      throw new AppError("ChatKit message processing failed", 500, {
        cause: error instanceof Error ? error.message : String(error)
      });
    }
  }
};
