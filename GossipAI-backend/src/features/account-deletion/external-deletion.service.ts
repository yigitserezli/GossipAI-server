import { prisma } from "../../lib/prisma";
import { deleteRevenueCatCustomer } from "../subscription/revenuecat-client";

const MAX_TASKS_PER_RUN = 25;

const toErrorMessage = (error: unknown) =>
  (error instanceof Error ? error.message : String(error)).slice(0, 1000);

export const externalDeletionService = {
  async processRevenueCatTask(externalUserId: string): Promise<void> {
    const task = await prisma.externalDeletionTask.findUnique({
      where: {
        provider_externalUserId: {
          provider: "revenuecat",
          externalUserId
        }
      }
    });

    if (!task) return;

    try {
      await deleteRevenueCatCustomer(task.externalUserId);
      await prisma.externalDeletionTask.delete({ where: { id: task.id } });
    } catch (error) {
      await prisma.externalDeletionTask.update({
        where: { id: task.id },
        data: {
          attempts: { increment: 1 },
          lastError: toErrorMessage(error)
        }
      });
      throw error;
    }
  },

  async processPendingTasks(): Promise<number> {
    const tasks = await prisma.externalDeletionTask.findMany({
      take: MAX_TASKS_PER_RUN,
      orderBy: { createdAt: "asc" }
    });

    let completed = 0;
    for (const task of tasks) {
      try {
        if (task.provider === "revenuecat") {
          await this.processRevenueCatTask(task.externalUserId);
          completed += 1;
        }
      } catch (error) {
        console.error("[account-deletion] External erasure retry failed", {
          taskId: task.id,
          provider: task.provider,
          error: toErrorMessage(error)
        });
      }
    }
    return completed;
  }
};
