import cron, { type ScheduledTask } from "node-cron";
import { env } from "../../config/env";
import { dailyInsightService } from "./daily-insight.service";

let schedulerTask: ScheduledTask | null = null;

export const startDailyInsightScheduler = () => {
  if (!env.DAILY_INSIGHT_SCHEDULER_ENABLED) {
    console.log("[daily-insight] Scheduler disabled by environment flag.");
    return;
  }

  if (schedulerTask) {
    return;
  }

  schedulerTask = cron.schedule(
    env.DAILY_INSIGHT_SCHEDULER_CRON,
    async () => {
      const startedAt = Date.now();
      try {
        const results = await dailyInsightService.generateAllLanguages();
        console.log("[daily-insight] Generation completed", {
          results,
          durationMs: Date.now() - startedAt,
        });
      } catch (error) {
        console.error("[daily-insight] Generation failed", error);
      }
    },
    {
      name: "daily-insight-generation",
      noOverlap: true,
      timezone: env.DAILY_INSIGHT_SCHEDULER_TIMEZONE,
    }
  );

  schedulerTask.on("execution:missed", (context) => {
    console.warn("[daily-insight] Scheduler missed execution", {
      expectedAt: context.date.toISOString(),
      expectedAtLocal: context.dateLocalIso,
      triggeredAt: context.triggeredAt.toISOString(),
    });
  });

  schedulerTask.on("execution:overlap", (context) => {
    console.warn("[daily-insight] Scheduler overlap prevented", {
      expectedAt: context.date.toISOString(),
      triggeredAt: context.triggeredAt.toISOString(),
    });
  });

  console.log(
    `[daily-insight] Scheduler started with cron "${env.DAILY_INSIGHT_SCHEDULER_CRON}" (tz=${env.DAILY_INSIGHT_SCHEDULER_TIMEZONE}, noOverlap=true).`
  );
};

export const stopDailyInsightScheduler = () => {
  if (!schedulerTask) {
    return;
  }

  schedulerTask.stop();
  schedulerTask.destroy();
  schedulerTask = null;
};
