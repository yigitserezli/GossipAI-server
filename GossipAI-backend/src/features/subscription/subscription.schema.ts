import { z } from "zod";

export const upgradePlanSchema = z.object({
  plan: z.enum(["basic", "premium"]),
});

export type UpgradePlanInput = z.infer<typeof upgradePlanSchema>;

export const syncRevenueCatSchema = z.object({
  /** The RevenueCat app user ID — must match the backend user ID. */
  appUserId: z.string().min(1),
  /** The entitlement identifier configured in the RevenueCat dashboard. */
  premiumEntitlementId: z.string().min(1),
});

export type SyncRevenueCatInput = z.infer<typeof syncRevenueCatSchema>;

