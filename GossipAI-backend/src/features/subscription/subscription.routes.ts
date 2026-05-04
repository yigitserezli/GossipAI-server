import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate-body";
import {
  getDailyUsage,
  handleRevenueCatWebhook,
  listPublicPlans,
  syncRevenueCatPurchase,
  upgradePlan,
} from "./subscription.controller";
import { syncRevenueCatSchema, upgradePlanSchema } from "./subscription.schema";

const subscriptionRouter = Router();

subscriptionRouter.get("/plans", listPublicPlans);

// RevenueCat server-to-server webhook — no auth middleware, verified via secret header
subscriptionRouter.post("/revenuecat/webhook", handleRevenueCatWebhook);

subscriptionRouter.use(authenticate);
subscriptionRouter.get("/usage", getDailyUsage);
subscriptionRouter.post("/upgrade", validateBody(upgradePlanSchema), upgradePlan);
subscriptionRouter.post(
  "/revenuecat/sync",
  validateBody(syncRevenueCatSchema),
  syncRevenueCatPurchase
);

export default subscriptionRouter;
