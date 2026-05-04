import { SubscriptionPlan } from "@prisma/client";

export const PLAN_DAILY_LIMITS: Record<SubscriptionPlan, number> = {
  basic: 5,
  premium: 100,
};

export const PLAN_PRICING_USD: Record<SubscriptionPlan, number> = {
  basic: 0,
  premium: 9.99,
};

/** Default subscription period in days (used when RevenueCat doesn't provide an exact expiry). */
export const PREMIUM_SUBSCRIPTION_DAYS = 30;
