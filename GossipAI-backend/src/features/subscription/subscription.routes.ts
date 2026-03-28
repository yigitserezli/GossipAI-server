import { Router } from "express";
import { authenticate } from "../../shared/middlewares/authenticate";
import { validateBody } from "../../shared/middlewares/validate-body";
import { getDailyUsage, listPublicPlans, upgradePlan } from "./subscription.controller";
import { upgradePlanSchema } from "./subscription.schema";

const subscriptionRouter = Router();

subscriptionRouter.get("/plans", listPublicPlans);
subscriptionRouter.use(authenticate);
subscriptionRouter.get("/usage", getDailyUsage);
subscriptionRouter.post("/upgrade", validateBody(upgradePlanSchema), upgradePlan);

export default subscriptionRouter;
