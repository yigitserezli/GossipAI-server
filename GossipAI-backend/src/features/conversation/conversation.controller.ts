import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error";
import { conversationService } from "./conversation.service";

const requireUserId = (requestUserId: string | undefined): string => {
  if (!requestUserId) {
    throw new AppError("Unauthorized", 401);
  }

  return requestUserId;
};

const requireConversationId = (value: string | string[] | undefined): string => {
  const conversationId = Array.isArray(value) ? value[0] : value;

  if (!conversationId) {
    throw new AppError("Conversation id is required", 400);
  }

  return conversationId;
};

export const createConversation: RequestHandler = async (req, res) => {
  const userId = requireUserId(req.user?.id);
  const conversation = await conversationService.create(userId, req.body);

  res.status(201).json({ data: conversation });
};

export const listConversations: RequestHandler = async (req, res) => {
  const userId = requireUserId(req.user?.id);
  const limitRaw = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const conversations = await conversationService.list(userId, limitRaw);

  // Keep multiple keys for frontend compatibility.
  res.status(200).json({ data: conversations, conversations, history: conversations });
};

export const getConversation: RequestHandler = async (req, res) => {
  const userId = requireUserId(req.user?.id);
  const conversationId = requireConversationId(req.params.id);
  const lastMessagesRaw = typeof req.query.lastMessages === "string" ? Number(req.query.lastMessages) : undefined;
  const conversation = await conversationService.get(userId, conversationId, lastMessagesRaw);

  // Keep multiple keys for frontend compatibility.
  res.status(200).json({ data: conversation, conversation, history: conversation });
};

export const addConversationMessage: RequestHandler = async (req, res) => {
  const userId = requireUserId(req.user?.id);
  const conversationId = requireConversationId(req.params.id);
  const result = await conversationService.addMessageAndRespond(userId, conversationId, req.body);

  res.status(201).json({ data: result });
};

export const updateConversationSettings: RequestHandler = async (req, res) => {
  const userId = requireUserId(req.user?.id);
  const conversationId = requireConversationId(req.params.id);
  const updatedConversation = await conversationService.updateSettings(userId, conversationId, req.body);

  res.status(200).json({ data: updatedConversation });
};

export const deleteConversation: RequestHandler = async (req, res) => {
  const userId = requireUserId(req.user?.id);
  const conversationId = requireConversationId(req.params.id);
  await conversationService.delete(userId, conversationId);

  res.status(204).send();
};
