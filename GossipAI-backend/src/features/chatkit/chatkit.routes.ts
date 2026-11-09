import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { enforceDailyLimit } from "../../shared/middlewares/enforce-daily-limit";
import { validateBody } from "../../shared/middlewares/validate-body";
import {
  createChatKitSession,
  emailChatKitSummary,
  getChatKitConversation,
  listChatKitConversations,
  sendChatKitMessage,
  updateChatKitPersonaInsights,
  listChatKitMessages
} from "./chatkit.controller";
import { chatkitMessageSchema, emailSummarySchema, updatePersonaInsightsSchema } from "./chatkit.schema";
import { chatkitService } from "./chatkit.service";
import { z } from "zod";

const chatkitRouter = Router();

chatkitRouter.use(authenticate);
chatkitRouter.get("/conversations/:id/replies/:requestId", async (req, res) => {
  const requestId = z.string().uuid().parse(req.params.requestId);
  res.json({ data: await chatkitService.replyState(req.user!.id, String(req.params.id), requestId) });
});
chatkitRouter.get("/conversations", listChatKitConversations);
chatkitRouter.get("/conversations/:id/messages", listChatKitMessages);
chatkitRouter.get("/conversations/:id", getChatKitConversation);
chatkitRouter.get("/history", listChatKitConversations);
chatkitRouter.get("/history/:id", getChatKitConversation);
chatkitRouter.get("/threads", listChatKitConversations);
chatkitRouter.get("/threads/:id", getChatKitConversation);
chatkitRouter.patch("/conversations/:id/persona-insights", validateBody(updatePersonaInsightsSchema), updateChatKitPersonaInsights);
chatkitRouter.post("/sessions", createChatKitSession);
chatkitRouter.post("/messages", validateBody(chatkitMessageSchema), (req, res, next) => {
  // Addressable turns reserve quota atomically with their message record.
  if (req.body.requestId) return next();
  return enforceDailyLimit(req, res, next);
}, sendChatKitMessage);
chatkitRouter.post("/email-summary", validateBody(emailSummarySchema), emailChatKitSummary);

export default chatkitRouter;
