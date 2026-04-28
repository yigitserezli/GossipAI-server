import cron, { type ScheduledTask } from "node-cron";
import { env } from "../../config/env";
import { notificationsService } from "./notifications.service";

let schedulerTask: ScheduledTask | null = null;

const summarizeTick = (result: Awaited<ReturnType<typeof notificationsService.runAutomationTick>>) => {
  const inactivitySent = result.inactivity.reduce((sum, item) => sum + item.sent, 0);
  const inactivityFailed = result.inactivity.reduce((sum, item) => sum + item.failed, 0);
  const scheduledSent = result.scheduled.reduce((sum, item) => sum + item.sent, 0);
  const scheduledFailed = result.scheduled.reduce((sum, item) => sum + item.failed, 0);

  return {
    inactivitySent,
    inactivityFailed,
    weeklyFreeUpsellSent: result.weeklyFreeUpsell.sent,
    weeklyFreeUpsellFailed: result.weeklyFreeUpsell.failed,
    scheduledSent,
    scheduledFailed,
  };
};

export const startNotificationScheduler = () => {
  if (!env.NOTIFICATION_SCHEDULER_ENABLED) {
    console.log("[notifications] Scheduler disabled by environment flag.");
    return;
  }

  if (schedulerTask) {
    return;
  }

  schedulerTask = cron.schedule(
    env.NOTIFICATION_SCHEDULER_CRON,
    async () => {
      const startedAt = Date.now();
      try {
        const result = await notificationsService.runAutomationTick();
        console.log("[notifications] Automation tick completed", {
          ...summarizeTick(result),
          durationMs: Date.now() - startedAt,
        });
      } catch (error) {
        console.error("[notifications] Automation tick failed", error);
      }
    },
    {
      name: "notifications-automation",
      noOverlap: true,
      timezone: env.NOTIFICATION_SCHEDULER_TIMEZONE,
    }
  );

  schedulerTask.on("execution:missed", (context) => {
    console.warn("[notifications] Scheduler missed execution", {
      expectedAt: context.date.toISOString(),
      expectedAtLocal: context.dateLocalIso,
      triggeredAt: context.triggeredAt.toISOString(),
    });
  });

  schedulerTask.on("execution:overlap", (context) => {
    console.warn("[notifications] Scheduler overlap prevented", {
      expectedAt: context.date.toISOString(),
      triggeredAt: context.triggeredAt.toISOString(),
    });
  });

  console.log(
    `[notifications] Scheduler started with cron "${env.NOTIFICATION_SCHEDULER_CRON}" (tz=${env.NOTIFICATION_SCHEDULER_TIMEZONE}, noOverlap=true).`
  );
};

export const stopNotificationScheduler = () => {
  if (!schedulerTask) {
    return;
  }

  schedulerTask.stop();
  schedulerTask.destroy();
  schedulerTask = null;
};
