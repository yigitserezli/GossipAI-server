import { z } from "zod";

const optionalTrimmedString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  },
  z.string().optional()
);

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "") return undefined;
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  return value;
}, z.boolean());

const schedulerEnabledByDefault = process.env.NODE_ENV === "production";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4321),
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  OPENAI_AGENT_MODEL: z.string().min(1).default("gpt-4o-mini"),
  OPENAI_ASSISTANT_ID: optionalTrimmedString,
  OPENAI_WORKFLOW_ID: optionalTrimmedString,
  OPENAI_WORKFLOW_VERSION: optionalTrimmedString,
  OPENAI_WORKFLOW_NAME: optionalTrimmedString,
  ADMIN_PASSCODE: z.string().regex(/^\d{6}$/).default("180704"),
  DEVELOPER_EMAILS: optionalTrimmedString,
  FIREBASE_PROJECT_ID: optionalTrimmedString,
  FIREBASE_CLIENT_EMAIL: optionalTrimmedString,
  FIREBASE_PRIVATE_KEY: optionalTrimmedString,
  NOTIFICATION_SCHEDULER_ENABLED: booleanFromEnv.default(schedulerEnabledByDefault),
  NOTIFICATION_SCHEDULER_CRON: z.string().default("0 9,21 * * *"),
  NOTIFICATION_SCHEDULER_TIMEZONE: z.string().default("UTC"),
  DAILY_INSIGHT_SCHEDULER_ENABLED: booleanFromEnv.default(schedulerEnabledByDefault),
  DAILY_INSIGHT_SCHEDULER_CRON: z.string().default("5 0 * * *"),
  DAILY_INSIGHT_SCHEDULER_TIMEZONE: z.string().default("UTC"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
  REVENUECAT_WEBHOOK_SECRET: optionalTrimmedString,
  REVENUECAT_API_KEY: optionalTrimmedString,
});

export const env = envSchema.parse(process.env);
