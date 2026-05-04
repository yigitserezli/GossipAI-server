import "dotenv/config";
import app from "./app";
import { env } from "./config/env";
import { startNotificationScheduler, stopNotificationScheduler } from "./features/notifications/notifications.scheduler";
import { startDailyInsightScheduler, stopDailyInsightScheduler } from "./features/daily-insight/daily-insight.scheduler";
import { startSubscriptionExpiryScheduler, stopSubscriptionExpiryScheduler } from "./features/subscription/subscription.scheduler";
import { installOpenAIHttpLogger } from "./lib/openai-http-logger";
import { prisma } from "./lib/prisma";

installOpenAIHttpLogger();

const isDatabaseConnectionError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "P1001" ||
    (typeof maybeError.message === "string" && maybeError.message.includes("Can't reach database server"))
  );
};

const bootstrap = async () => {
  await prisma.$connect();
  startNotificationScheduler();
  startDailyInsightScheduler();
  startSubscriptionExpiryScheduler();

  app.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`);
  });
};

const shutdown = async () => {
  stopNotificationScheduler();
  stopDailyInsightScheduler();
  stopSubscriptionExpiryScheduler();
  await prisma.$disconnect();
};

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});

void bootstrap().catch((error: unknown) => {
  console.error("Failed to start server", error);

  if (isDatabaseConnectionError(error)) {
    const dbHost = new URL(env.DATABASE_URL).host;
    console.error(
      `[DB Hint] Connection failed to ${dbHost}. If this is a remote DB, check IP whitelist/firewall rules for your current public IP.`
    );
  }

  process.exit(1);
});
