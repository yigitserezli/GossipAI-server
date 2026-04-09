import "dotenv/config";
import app from "./app";
import { env } from "./config/env";
import { startNotificationScheduler, stopNotificationScheduler } from "./features/notifications/notifications.scheduler";
import { startDailyInsightScheduler, stopDailyInsightScheduler } from "./features/daily-insight/daily-insight.scheduler";
import { installOpenAIHttpLogger } from "./lib/openai-http-logger";
import { prisma } from "./lib/prisma";

installOpenAIHttpLogger();

const bootstrap = async () => {
  await prisma.$connect();
  startNotificationScheduler();
  startDailyInsightScheduler();

  app.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`);
  });
};

const shutdown = async () => {
  stopNotificationScheduler();
  stopDailyInsightScheduler();
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
  process.exit(1);
});
