import type { Request, RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error";
import { sendSummaryEmail } from "../../lib/email";
import { prisma } from "../../lib/prisma";
import { conversationService } from "../conversation/conversation.service";
import { chatkitService } from "./chatkit.service";

const requireConversationId = (value: string | string[] | undefined): string => {
  const conversationId = Array.isArray(value) ? value[0] : value;

  if (!conversationId) {
    throw new AppError("Conversation id is required", 400);
  }

  return conversationId;
};

const resolveConversationId = (req: Pick<Request, "params" | "query">): string => {
  return requireConversationId(
    req.params.id ??
      req.query.conversationId ??
      req.query.id ??
      req.query.threadId ??
      req.query.historyId
  );
};

export const createChatKitSession: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const session = await chatkitService.createSession(req.user.id);

  res.status(201).json({ data: session });
};

export const sendChatKitMessage: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const result = await chatkitService.sendMessage(req.user.id, req.body);

  res.status(201).json({ data: result });
};

export const listChatKitConversations: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const conversations = await conversationService.list(req.user.id, limitRaw);

  // Keep multiple keys for mobile-client compatibility during transition.
  res.status(200).json({ data: conversations, conversations, history: conversations });
};

export const emailChatKitSummary: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const { conversationId } = req.body as { conversationId: string };

  // Fetch user name from DB (req.user only carries id + email)
  const dbUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true, email: true } });
  if (!dbUser) throw new AppError("User not found", 404);

  // Fetch conversation with messages
  const conversation = await conversationService.get(req.user.id, conversationId);

  // Find the last AI message in this conversation
  const messages: Array<{ role: string; content: string; createdAt: Date | string }> =
    (conversation as { messages?: Array<{ role: string; content: string; createdAt: Date | string }> }).messages ?? [];

  const lastAiMessage = [...messages].reverse().find((m) => m.role === "assistant");

  if (!lastAiMessage) {
    throw new AppError("No AI response found in this conversation to summarize.", 422, undefined, "NO_AI_MESSAGE");
  }

  const title =
    (conversation as { title?: string }).title ??
    `Summary · ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const createdAt =
    (lastAiMessage.createdAt instanceof Date
      ? lastAiMessage.createdAt
      : new Date(lastAiMessage.createdAt)
    ).toISOString();

  await sendSummaryEmail(
    dbUser.email,
    dbUser.name,
    title,
    lastAiMessage.content,
    createdAt
  );

  res.status(200).json({ message: "Summary sent to your email." });
};

export const getChatKitConversation: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const conversationId = resolveConversationId(req);
  const lastMessagesRaw = typeof req.query.lastMessages === "string" ? Number(req.query.lastMessages) : undefined;
  const conversation = await conversationService.get(req.user.id, conversationId, lastMessagesRaw);

  // Keep multiple keys for mobile-client compatibility during transition.
  res.status(200).json({ data: conversation, conversation, history: conversation });
};
