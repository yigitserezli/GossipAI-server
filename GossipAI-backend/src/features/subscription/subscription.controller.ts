import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error";
import { subscriptionService } from "./subscription.service";

export const listPublicPlans: RequestHandler = async (_req, res) => {
  const plans = subscriptionService.getPublicPlans();
  res.status(200).json({ data: plans });
};

export const getDailyUsage: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401, undefined, "AUTH_REQUIRED");
  }

  const usage = await subscriptionService.getDailyUsage(req.user.id);

  res.status(200).json({ data: usage });
};

export const upgradePlan: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401, undefined, "AUTH_REQUIRED");
  }

  const result = await subscriptionService.upgradePlan(req.user.id, req.body.plan);

  res.status(200).json({ data: result });
};
