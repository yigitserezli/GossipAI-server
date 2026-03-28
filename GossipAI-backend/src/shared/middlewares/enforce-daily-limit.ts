import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error";
import { subscriptionService } from "../../features/subscription/subscription.service";
import { env } from "../../config/env";

const isDeveloperEmail = (email: string): boolean => {
  if (!env.DEVELOPER_EMAILS) return false;
  return env.DEVELOPER_EMAILS.split(",").map((e) => e.trim().toLowerCase()).includes(email.toLowerCase());
};

export const enforceDailyLimit: RequestHandler = async (req, _res, next) => {
  if (!req.user?.id) {
    return next(new AppError("Authentication required.", 401, undefined, "AUTH_REQUIRED"));
  }

  if (isDeveloperEmail(req.user.email)) {
    return next();
  }

  try {
    const usage = await subscriptionService.checkAndIncrementUsage(req.user.id);
    req.dailyUsage = usage;
    return next();
  } catch (error) {
    return next(error);
  }
};
