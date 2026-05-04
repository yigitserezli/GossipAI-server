import type { RequestHandler } from "express";
import { AppError } from "../../shared/errors/app-error";
import { getRevenueCatPremiumStatus } from "./revenuecat-client";
import { handleRevenueCatWebhook } from "./revenuecat-webhook";
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

/**
 * POST /api/subscription/revenuecat/sync
 *
 * Called by the mobile app immediately after a successful in-app purchase or
 * restore. Verifies the purchase with the RevenueCat REST API and activates /
 * deactivates premium accordingly.
 *
 * If the RC API key is not configured the endpoint falls back to trusting the
 * client (same behaviour as before this integration).
 */
export const syncRevenueCatPurchase: RequestHandler = async (req, res) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401, undefined, "AUTH_REQUIRED");
  }

  const { appUserId, premiumEntitlementId } = req.body as {
    appUserId: string;
    premiumEntitlementId: string;
  };

  // Security: the appUserId sent by the client must match the authenticated user.
  if (appUserId !== req.user.id) {
    throw new AppError("Forbidden: appUserId mismatch", 403, undefined, "FORBIDDEN");
  }

  const status = await getRevenueCatPremiumStatus(appUserId, premiumEntitlementId);

  if (status === null) {
    // RC API key not configured; fall back to trusting the client and setting
    // a 30-day premium window.
    await subscriptionService.activatePremium(req.user.id);
    res.status(200).json({ data: { plan: "premium", source: "fallback" } });
    return;
  }

  if (status.isActive) {
    await subscriptionService.activatePremium(req.user.id, status.expiresAt);
    res.status(200).json({
      data: {
        plan: "premium",
        premiumExpiresAt: status.expiresAt,
        source: "revenuecat",
      },
    });
  } else {
    await subscriptionService.deactivatePremium(req.user.id);
    res.status(200).json({ data: { plan: "basic", source: "revenuecat" } });
  }
};

export { handleRevenueCatWebhook };
