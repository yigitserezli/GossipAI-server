import cron, { type ScheduledTask } from "node-cron";
import { subscriptionService } from "./subscription.service";

let schedulerTask: ScheduledTask | null = null;

/**
 * Runs daily at 01:00 UTC and downgrades any premium users whose
 * premiumExpiresAt is in the past.
 *
 * This is a safety net for cases where RevenueCat's EXPIRATION webhook was
 * missed or delayed.
 */
export const startSubscriptionExpiryScheduler = () => {
  if (schedulerTask) {
    return;
  }

  schedulerTask = cron.schedule(
    "0 1 * * *",
    async () => {
      const startedAt = Date.now();
      try {
        const count = await subscriptionService.expireOverduePremiums();
        if (count > 0) {
          console.log("[subscription-expiry] Downgraded expired premium users", {
            count,
            durationMs: Date.now() - startedAt,
          });
        }
      } catch (error) {
        console.error("[subscription-expiry] Failed to expire overdue premiums", error);
      }
    },
    {
      name: "subscription-expiry",
      noOverlap: true,
      timezone: "UTC",
    }
  );

  console.log("[subscription-expiry] Scheduler started (daily at 01:00 UTC)");
};

export const stopSubscriptionExpiryScheduler = () => {
  schedulerTask?.stop();
  schedulerTask = null;
};
