import { MemoryMode, MessageRole, type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { createChatCompletion } from "../../lib/openai";
import { AppError } from "../../shared/errors/app-error";
import type {
  CreateConversationInput,
  CreateConversationMessageInput,
  UpdateConversationSettingsInput
} from "./conversation.schema";

interface FactItem {
  key: string;
  value: string;
  confidence: string;
}

interface OpenLoopItem {
  item: string;
  priority?: number;
}

interface ConversationStateDTO {
  rollingSummary: string;
  factsJson: FactItem[];
  openLoopsJson: OpenLoopItem[];
  safetyFlagsJson: Record<string, unknown>;
  lastSummarizedMessageId: string | null;
  updatedAt: string | null;
}

interface ModelPayload {
  assistant_answer: string;
  updated_rolling_summary?: string;
  updated_facts_json?: unknown;
  updated_open_loops_json?: unknown;
}

const LAST_MESSAGES_DEFAULT = 8;
const LAST_CONVERSATIONS_DEFAULT = 20;
const LAST_CONVERSATIONS_MAX = 50;
const FACTS_MAX_ITEMS = 10;
const OPEN_LOOPS_MAX_ITEMS = 3;
const OPENAI_THREAD_ID_KEY = "openai_thread_id";

const DEFAULT_STATE = {
  rollingSummary: "",
  factsJson: [] as FactItem[],
  openLoopsJson: [] as OpenLoopItem[],
  safetyFlagsJson: {} as Record<string, unknown>,
  lastSummarizedMessageId: null as string | null
};

const modelBehaviorPrompt = [
  "You are Gossip AI, a supportive and practical assistant.",
  "Respond in Turkish unless the user explicitly asks another language.",
  "Do not include internal reasoning.",
  "Always return valid JSON only."
].join(" ");

const asInputJson = (value: unknown): Prisma.InputJsonValue => {
  return value as Prisma.InputJsonValue;
};

const toMessageContent = (message: { content: string | null; contentRedacted: string | null }): string => {
  return message.contentRedacted ?? message.content ?? "";
};

const normalizeFacts = (value: unknown): FactItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: FactItem[] = [];

  value.forEach((item) => {
    if (result.length >= FACTS_MAX_ITEMS || !item || typeof item !== "object") {
      return;
    }

    const candidate = item as Record<string, unknown>;
    const key = typeof candidate.key === "string" ? candidate.key.trim() : "";
    const factValue = typeof candidate.value === "string" ? candidate.value.trim() : "";
    const confidence = typeof candidate.confidence === "string" ? candidate.confidence.trim() : "low";

    if (!key || !factValue) {
      return;
    }

    result.push({
      key,
      value: factValue,
      confidence: confidence || "low"
    });
  });

  return result;
};

const normalizeOpenLoops = (value: unknown): OpenLoopItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: OpenLoopItem[] = [];

  value.forEach((item) => {
    if (result.length >= OPEN_LOOPS_MAX_ITEMS || !item || typeof item !== "object") {
      return;
    }

    const candidate = item as Record<string, unknown>;
    const loopItem = typeof candidate.item === "string" ? candidate.item.trim() : "";

    if (!loopItem) {
      return;
    }

    const priority = typeof candidate.priority === "number" ? candidate.priority : undefined;

    if (priority === undefined) {
      result.push({ item: loopItem });
      return;
    }

    result.push({ item: loopItem, priority });
  });

  return result;
};

const normalizeSafetyFlags = (value: Prisma.JsonValue | null): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
};

const getOpenAIThreadId = (safetyFlags: Record<string, unknown>): string | null => {
  const candidate = safetyFlags[OPENAI_THREAD_ID_KEY];
  if (typeof candidate !== "string") {
    return null;
  }

  const normalized = candidate.trim();
  return normalized.length > 0 ? normalized : null;
};

const parseModelPayload = (rawContent: string): ModelPayload => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new AppError("Model output is not valid JSON", 502, { rawContent });
  }

  if (!parsed || typeof parsed !== "object") {
    throw new AppError("Model output has invalid shape", 502);
  }

  const payload = parsed as Record<string, unknown>;
  const assistantAnswer = typeof payload.assistant_answer === "string" ? payload.assistant_answer.trim() : "";

  if (!assistantAnswer) {
    throw new AppError("Model output missing assistant_answer", 502, payload);
  }

  return {
    assistant_answer: assistantAnswer,
    updated_rolling_summary:
      typeof payload.updated_rolling_summary === "string" ? payload.updated_rolling_summary.trim() : undefined,
    updated_facts_json: payload.updated_facts_json,
    updated_open_loops_json: payload.updated_open_loops_json
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

const toStateDTO = (state: {
  rollingSummary: string;
  factsJson: Prisma.JsonValue | null;
  openLoopsJson: Prisma.JsonValue | null;
  safetyFlagsJson: Prisma.JsonValue | null;
  lastSummarizedMessageId: string | null;
  updatedAt: Date;
} | null): ConversationStateDTO => {
  if (!state) {
    return {
      ...DEFAULT_STATE,
      updatedAt: null
    };
  }

  return {
    rollingSummary: state.rollingSummary,
    factsJson: normalizeFacts(state.factsJson),
    openLoopsJson: normalizeOpenLoops(state.openLoopsJson),
    safetyFlagsJson: normalizeSafetyFlags(state.safetyFlagsJson),
    lastSummarizedMessageId: state.lastSummarizedMessageId,
    updatedAt: state.updatedAt.toISOString()
  };
};

export const conversationService = {
  async list(userId: string, limit = LAST_CONVERSATIONS_DEFAULT) {
    const take = Number.isFinite(limit)
      ? Math.min(Math.max(Math.trunc(limit), 1), LAST_CONVERSATIONS_MAX)
      : LAST_CONVERSATIONS_DEFAULT;

    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        status: {
          not: "deleted"
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take,
      include: {
        state: true,
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        },
        _count: {
          select: {
            messages: true
          }
        }
      }
    });

    return conversations.map((conversation) => {
      const latestMessage = conversation.messages[0];

      return {
        id: conversation.id,
        title: conversation.title,
        mode: conversation.mode,
        style: conversation.style ?? null,
        relation: conversation.relation ?? null,
        status: conversation.status,
        memoryMode: conversation.memoryMode,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
        messageCount: conversation._count.messages,
        lastMessage: latestMessage
          ? {
              id: latestMessage.id,
              role: latestMessage.role,
              content: toMessageContent(latestMessage),
              createdAt: latestMessage.createdAt.toISOString()
            }
          : null,
        state: toStateDTO(conversation.state)
      };
    });
  },

  async create(userId: string, input: CreateConversationInput) {
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: input.title ?? null,
        mode: input.mode ?? "HELP_ME_REPLY",
        style: input.style ?? null,
        relation: input.relation ?? null,
        memoryMode: input.memoryMode,
        state: {
          create: {
            rollingSummary: DEFAULT_STATE.rollingSummary,
            factsJson: asInputJson(DEFAULT_STATE.factsJson),
            openLoopsJson: asInputJson(DEFAULT_STATE.openLoopsJson),
            safetyFlagsJson: asInputJson(DEFAULT_STATE.safetyFlagsJson),
            lastSummarizedMessageId: DEFAULT_STATE.lastSummarizedMessageId
          }
        }
      }
    });

    return {
      id: conversation.id,
      title: conversation.title,
      mode: conversation.mode,
      style: conversation.style ?? null,
      relation: conversation.relation ?? null,
      status: conversation.status,
      memoryMode: conversation.memoryMode,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      state: {
        ...DEFAULT_STATE,
        updatedAt: null
      }
    };
  },

  async get(userId: string, conversationId: string, lastMessages = LAST_MESSAGES_DEFAULT) {
    const take = Number.isFinite(lastMessages)
      ? Math.min(Math.max(Math.trunc(lastMessages), 1), 20)
      : LAST_MESSAGES_DEFAULT;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
        status: {
          not: "deleted"
        }
      },
      include: {
        state: true,
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take
        }
      }
    });

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    return {
      id: conversation.id,
      title: conversation.title,
      mode: conversation.mode,
      style: conversation.style ?? null,
      relation: conversation.relation ?? null,
      status: conversation.status,
      memoryMode: conversation.memoryMode,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      state: toStateDTO(conversation.state),
      messages: conversation.messages.reverse().map((message) => ({
        id: message.id,
        role: message.role,
        content: toMessageContent(message),
        createdAt: message.createdAt.toISOString()
      }))
    };
  },

  async updateSettings(userId: string, conversationId: string, input: UpdateConversationSettingsInput) {
    await ensureConversationForUser(conversationId, userId);

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        memoryMode: input.memoryMode
      },
      include: {
        state: true
      }
    });

    return {
      id: updatedConversation.id,
      memoryMode: updatedConversation.memoryMode,
      updatedAt: updatedConversation.updatedAt.toISOString(),
      state: toStateDTO(updatedConversation.state)
    };
  },

  async delete(userId: string, conversationId: string) {
    await ensureConversationForUser(conversationId, userId);

    await prisma.conversation.delete({
      where: {
        id: conversationId
      }
    });
  },

  async addMessageAndRespond(userId: string, conversationId: string, input: CreateConversationMessageInput) {
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
      take: LAST_MESSAGES_DEFAULT
    });

    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.user,
        content: input.content,
        contentRedacted: input.content
      }
    });

    const userMessageCount = await prisma.message.count({
      where: {
        conversationId,
        role: MessageRole.user
      }
    });

    const shouldUpdateSummary =
      conversation.memoryMode !== MemoryMode.off &&
      (userMessageCount === 1 || userMessageCount % 3 === 0);

    const currentState = toStateDTO(conversation.state);

    const memoryItems =
      conversation.memoryMode === MemoryMode.summary_plus_memory
        ? await prisma.memoryItem.findMany({
            where: {
              userId,
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
            },
            orderBy: {
              createdAt: "desc"
            },
            take: 5,
            select: {
              type: true,
              content: true
            }
          })
        : [];

    const contextSections: string[] = [];

    if (conversation.memoryMode !== MemoryMode.off) {
      contextSections.push(
        "Conversation state:",
        `rolling_summary: ${currentState.rollingSummary || "(empty)"}`,
        `facts_json: ${JSON.stringify(currentState.factsJson)}`,
        `open_loops_json: ${JSON.stringify(currentState.openLoopsJson)}`
      );
    }

    if (memoryItems.length > 0) {
      contextSections.push(`memory_items: ${JSON.stringify(memoryItems)}`);
    }

    if (shouldUpdateSummary) {
      contextSections.push(
        "Return JSON fields: assistant_answer, updated_rolling_summary, optional updated_facts_json, optional updated_open_loops_json.",
        "Keep rolling summary concise, PII-minimal, max 250 words.",
        "facts_json max 10 items, open_loops_json max 3 items."
      );
    } else {
      contextSections.push(
        "Return JSON fields: assistant_answer.",
        "Do not include updated_rolling_summary unless major new context was introduced."
      );
    }

    const completion = await createChatCompletion([
      {
        role: "system",
        content: modelBehaviorPrompt
      },
      {
        role: "system",
        content: contextSections.join("\n")
      },
      ...priorMessages
        .reverse()
        .map((message) => ({
          role: message.role as "system" | "user" | "assistant",
          content: toMessageContent(message)
        }))
        .filter((message) => message.content.length > 0),
      {
        role: "user",
        content: input.content
      }
    ], {
      threadId: getOpenAIThreadId(currentState.safetyFlagsJson)
    });

    const modelPayload = parseModelPayload(completion.content);

    const nextSummary =
      shouldUpdateSummary && modelPayload.updated_rolling_summary !== undefined
        ? modelPayload.updated_rolling_summary
        : currentState.rollingSummary;

    const nextFacts =
      shouldUpdateSummary && modelPayload.updated_facts_json !== undefined
        ? normalizeFacts(modelPayload.updated_facts_json)
        : currentState.factsJson;

    const nextOpenLoops =
      shouldUpdateSummary && modelPayload.updated_open_loops_json !== undefined
        ? normalizeOpenLoops(modelPayload.updated_open_loops_json)
        : currentState.openLoopsJson;

    const nextSafetyFlags =
      completion.threadId && completion.threadId.length > 0
        ? {
            ...currentState.safetyFlagsJson,
            [OPENAI_THREAD_ID_KEY]: completion.threadId
          }
        : currentState.safetyFlagsJson;

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.assistant,
        content: modelPayload.assistant_answer,
        contentRedacted: modelPayload.assistant_answer,
        tokensIn: completion.promptTokens,
        tokensOut: completion.completionTokens
      }
    });

    const savedState = await prisma.conversationState.upsert({
      where: {
        conversationId
      },
      create: {
        conversationId,
        rollingSummary: nextSummary,
        factsJson: asInputJson(nextFacts),
        openLoopsJson: asInputJson(nextOpenLoops),
        safetyFlagsJson: asInputJson(nextSafetyFlags),
        lastSummarizedMessageId: shouldUpdateSummary ? userMessage.id : currentState.lastSummarizedMessageId
      },
      update: {
        rollingSummary: nextSummary,
        factsJson: asInputJson(nextFacts),
        openLoopsJson: asInputJson(nextOpenLoops),
        safetyFlagsJson: asInputJson(nextSafetyFlags),
        lastSummarizedMessageId: shouldUpdateSummary ? userMessage.id : currentState.lastSummarizedMessageId
      }
    });

    return {
      assistant: {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: modelPayload.assistant_answer,
        createdAt: assistantMessage.createdAt.toISOString(),
        tokensIn: assistantMessage.tokensIn,
        tokensOut: assistantMessage.tokensOut
      },
      state: toStateDTO(savedState),
      summaryUpdated: shouldUpdateSummary
    };
  }
};
