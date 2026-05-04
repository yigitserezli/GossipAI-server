import { NotificationCampaignStatus, NotificationDeliveryStatus, NotificationScenario, PushDevicePlatform, SubscriptionPlan } from "@prisma/client";
import { z } from "zod";

const supportedLanguages = [
  "tr",
  "en",
  "de",
  "fr",
  "it",
  "es",
  "ru",
  "zh",
  "ja",
  "ko",
  "uk",
  "pt",
  "es-419"
] as const;

export const registerDeviceSchema = z.object({
  token: z.string().min(20),
  platform: z.nativeEnum(PushDevicePlatform),
  appVersion: z.string().trim().min(1).max(32).optional(),
  deviceLanguage: z.enum(supportedLanguages).optional(),
  notificationsEnabled: z.boolean().optional()
});

export const activityPingSchema = z.object({
  deviceToken: z.string().min(20).optional()
});

export const createCampaignSchema = z.object({
  scenario: z.nativeEnum(NotificationScenario),
  status: z.nativeEnum(NotificationCampaignStatus).optional(),
  titleByLanguage: z.record(z.enum(supportedLanguages), z.string().trim().min(1).max(120)),
  bodyByLanguage: z.record(z.enum(supportedLanguages), z.string().trim().min(1).max(500)),
  deepLink: z.string().trim().min(1).max(255).optional(),
  targetPlan: z.nativeEnum(SubscriptionPlan).optional(),
  scheduledAt: z.coerce.date().optional()
});

export const listCampaignsQuerySchema = z.object({
  scenario: z.nativeEnum(NotificationScenario).optional(),
  status: z.nativeEnum(NotificationCampaignStatus).optional(),
  targetPlan: z.nativeEnum(SubscriptionPlan).optional(),
});

export const listCampaignDeliveriesQuerySchema = z.object({
  status: z.nativeEnum(NotificationDeliveryStatus).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export const autoTranslateSchema = z.object({
  titleEn: z.string().trim().min(3).max(120),
  bodyEn: z.string().trim().min(5).max(500),
  titleTr: z.string().trim().max(120).optional(),
  bodyTr: z.string().trim().max(500).optional(),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
export type ActivityPingInput = z.infer<typeof activityPingSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type ListCampaignsQueryInput = z.infer<typeof listCampaignsQuerySchema>;
export type ListCampaignDeliveriesQueryInput = z.infer<typeof listCampaignDeliveriesQuerySchema>;
export type AutoTranslateInput = z.infer<typeof autoTranslateSchema>;
