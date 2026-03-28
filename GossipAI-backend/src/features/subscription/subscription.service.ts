import { SubscriptionPlan } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { PLAN_DAILY_LIMITS, PLAN_PRICING_USD } from "./subscription.constants";

function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export const subscriptionService = {
  getPublicPlans() {
    return [
      {
        plan: SubscriptionPlan.free,
        displayName: "Basic",
        priceUsd: PLAN_PRICING_USD.free,
        billingInterval: "month" as const,
        dailyPromptLimit: PLAN_DAILY_LIMITS.free,
      },
      {
        plan: SubscriptionPlan.premium,
        displayName: "Premium",
        priceUsd: PLAN_PRICING_USD.premium,
        billingInterval: "month" as const,
        dailyPromptLimit: PLAN_DAILY_LIMITS.premium,
      },
    ];
  },

  async getUserPlan(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      throw new AppError("User not found", 404, undefined, "USER_NOT_FOUND");
    }

    return user.plan;
  },

  async getDailyUsage(userId: string): Promise<{ count: number; limit: number; remaining: number; plan: SubscriptionPlan }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      throw new AppError("User not found", 404, undefined, "USER_NOT_FOUND");
    }

    const today = todayUTC();
    const limit = PLAN_DAILY_LIMITS[user.plan];

    const usage = await prisma.dailyUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    const count = usage?.count ?? 0;

    return {
      count,
      limit,
      remaining: Math.max(0, limit - count),
      plan: user.plan,
    };
  },

  async incrementUsage(userId: string): Promise<void> {
    const today = todayUTC();

    await prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, count: 1 },
      update: { count: { increment: 1 } },
    });
  },

  async checkAndIncrementUsage(userId: string): Promise<{ count: number; limit: number; remaining: number }> {
    const { count, limit, plan } = await this.getDailyUsage(userId);

    if (count >= limit) {
      throw new AppError(
        `Gunluk ${limit} prompt limitine ulastiniz. ${plan === "free" ? "Premium plana yukselerek limiti 100'e cikarabilirsiniz." : "Yarin tekrar deneyebilirsiniz."}`,
        429,
        { dailyLimit: limit, used: count, plan },
        "DAILY_LIMIT_EXCEEDED",
        true,
      );
    }

    await this.incrementUsage(userId);

    return {
      count: count + 1,
      limit,
      remaining: Math.max(0, limit - count - 1),
    };
  },

  async upgradePlan(userId: string, plan: SubscriptionPlan) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { plan },
      select: { id: true, plan: true },
    });

    return user;
  },
};
