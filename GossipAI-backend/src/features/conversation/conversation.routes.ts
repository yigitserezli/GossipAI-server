import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate-body";
import {
  addConversationMessage,
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  updateConversationSettings
} from "./conversation.controller";
import {
  createConversationMessageSchema,
  createConversationSchema,
  updateConversationSettingsSchema
} from "./conversation.schema";

const conversationRouter = Router();

conversationRouter.use(authenticate);

conversationRouter.get("/", listConversations);
conversationRouter.post("/", validateBody(createConversationSchema), createConversation);
conversationRouter.get("/:id", getConversation);
conversationRouter.post("/:id/messages", validateBody(createConversationMessageSchema), addConversationMessage);
conversationRouter.patch("/:id/settings", validateBody(updateConversationSettingsSchema), updateConversationSettings);
conversationRouter.delete("/:id", deleteConversation);

export default conversationRouter;
