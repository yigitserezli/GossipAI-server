import { Router } from "express";
import swaggerRouter from "../docs/swagger.routes";
import adminRouter from "../features/admin/admin.routes";
import authRouter from "../features/auth/auth.routes";
import chatkitRouter from "../features/chatkit/chatkit.routes";
import conversationRouter from "../features/conversation/conversation.routes";
import gossipRouter from "../features/gossip/gossip.routes";
import notificationsRouter from "../features/notifications/notifications.routes";
import subscriptionRouter from "../features/subscription/subscription.routes";
import dailyInsightRouter from "../features/daily-insight/daily-insight.routes";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

apiRouter.use(swaggerRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/chatkit", chatkitRouter);
apiRouter.use("/gossips", gossipRouter);
apiRouter.use("/conversations", conversationRouter);
apiRouter.use("/subscription", subscriptionRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/daily-insight", dailyInsightRouter);

export default apiRouter;
