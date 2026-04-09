import { SubscriptionPlan } from "@prisma/client";

export const PLAN_DAILY_LIMITS: Record<SubscriptionPlan, number> = {
  basic: 5,
  premium: 100,
};

export const PLAN_PRICING_USD: Record<SubscriptionPlan, number> = {
  basic: 0,
  premium: 9.99,
};
