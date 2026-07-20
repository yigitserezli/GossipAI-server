import cron, { type ScheduledTask } from "node-cron";
import { env } from "../../config/env";
import { externalDeletionService } from "./external-deletion.service";

let schedulerTask: ScheduledTask | null = null;

export const startExternalDeletionScheduler = () => {
  if (schedulerTask || !env.EXTERNAL_DELETION_SCHEDULER_ENABLED) return;

  schedulerTask = cron.schedule(
    env.EXTERNAL_DELETION_SCHEDULER_CRON,
    async () => {
      try {
        const completed = await externalDeletionService.processPendingTasks();
        if (completed > 0) console.log("[account-deletion] External erasure tasks completed", { completed });
      } catch (error) {
        console.error("[account-deletion] External erasure scheduler failed", error);
      }
    },
    {
      name: "external-deletion",
      noOverlap: true,
      timezone: env.EXTERNAL_DELETION_SCHEDULER_TIMEZONE
    }
  );
};

export const stopExternalDeletionScheduler = () => {
  schedulerTask?.stop();
  schedulerTask = null;
};
