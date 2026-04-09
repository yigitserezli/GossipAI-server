import cron, { type ScheduledTask } from "node-cron";
import { dailyInsightService } from "./daily-insight.service";

let schedulerTask: ScheduledTask | null = null;

// Run daily at 00:05 UTC to generate insights for all supported languages
const DAILY_INSIGHT_CRON = "5 0 * * *";

export const startDailyInsightScheduler = () => {
  if (schedulerTask) {
    return;
  }

  schedulerTask = cron.schedule(DAILY_INSIGHT_CRON, async () => {
    try {
      const results = await dailyInsightService.generateAllLanguages();
      console.log("[daily-insight] Generation completed", results);
    } catch (error) {
      console.error("[daily-insight] Generation failed", error);
    }
  });

  console.log(`[daily-insight] Scheduler started with cron "${DAILY_INSIGHT_CRON}".`);
};

export const stopDailyInsightScheduler = () => {
  if (!schedulerTask) {
    return;
  }

  schedulerTask.stop();
  schedulerTask.destroy();
  schedulerTask = null;
};
