import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { enforceDailyLimit } from "../../shared/middlewares/enforce-daily-limit";
import { validateBody } from "../../shared/middlewares/validate-body";
import {
  createChatKitSession,
  emailChatKitSummary,
  getChatKitConversation,
  listChatKitConversations,
  sendChatKitMessage
} from "./chatkit.controller";
import { chatkitMessageSchema, emailSummarySchema } from "./chatkit.schema";

const chatkitRouter = Router();

chatkitRouter.use(authenticate);
chatkitRouter.get("/conversations", listChatKitConversations);
chatkitRouter.get("/conversations/:id", getChatKitConversation);
chatkitRouter.get("/history", listChatKitConversations);
chatkitRouter.get("/history/:id", getChatKitConversation);
chatkitRouter.get("/threads", listChatKitConversations);
chatkitRouter.get("/threads/:id", getChatKitConversation);
chatkitRouter.post("/sessions", createChatKitSession);
chatkitRouter.post("/messages", validateBody(chatkitMessageSchema), enforceDailyLimit, sendChatKitMessage);
chatkitRouter.post("/email-summary", validateBody(emailSummarySchema), emailChatKitSummary);

export default chatkitRouter;
