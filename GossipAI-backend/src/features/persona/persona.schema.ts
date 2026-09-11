import { z } from "zod";

export const personaRelationshipSchema = z.enum([
  "crush",
  "ex",
  "partner",
  "friend",
  "coworker",
  "other",
]);

export const personaThemeSchema = z.enum(["violet", "rose", "ocean", "emerald", "amber"]);

const optionalText = (max: number) => z.string().trim().max(max).optional();

const avatarFields = {
  avatarEmoji: z.string().trim().min(1).max(16).optional(),
  // Avatar URLs are generated server-side from the owned R2 object key.
  avatarUrl: z.string().url().max(2_000).optional(),
  avatarObjectKey: z.string().trim().min(1).max(1_024).optional(),
  removeAvatar: z.boolean().optional(),
};

export const createPersonaSchema = z.object({
  name: z.string().trim().min(1).max(80),
  relationshipType: personaRelationshipSchema,
  themeKey: personaThemeSchema.default("violet"),
  whoIsThis: optionalText(2_000),
  thoughtsFeelings: optionalText(2_000),
  goals: optionalText(2_000),
  currentSituation: optionalText(2_000),
  communicationStyle: optionalText(1_000),
  ...avatarFields,
});

export const updatePersonaSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    relationshipType: personaRelationshipSchema.optional(),
    themeKey: personaThemeSchema.optional(),
    whoIsThis: optionalText(2_000).nullable(),
    thoughtsFeelings: optionalText(2_000).nullable(),
    goals: optionalText(2_000).nullable(),
    currentSituation: optionalText(2_000).nullable(),
    communicationStyle: optionalText(1_000).nullable(),
    ...avatarFields,
  })
  .refine((value) => Object.keys(value).length > 0, "At least one persona field is required.");

export const refreshPersonaInsightsSchema = z.object({
  conversationId: z.string().uuid().optional(),
  language: z.enum(["tr", "en", "de", "fr", "it", "es", "ru", "zh", "ja", "ko", "uk", "pt", "es-419"]).default("en"),
});

export const createPersonaAvatarUploadUrlSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png"]),
});

export const createWhatsAppImportUploadUrlSchema = z.object({
  filename: z.string().trim().min(5).max(255),
  contentType: z.enum(["text/plain", "application/zip", "application/x-zip-compressed"]),
  byteSize: z.number().int().positive().max(12 * 1024 * 1024),
});

export const createWhatsAppImportSchema = createWhatsAppImportUploadUrlSchema.extend({
  importId: z.string().uuid(),
  objectKey: z.string().trim().min(1).max(1_024),
});

export const characterAnalysisAnswerSchema = z.object({
  score: z.union([z.literal(0), z.literal(25), z.literal(50), z.literal(75), z.literal(100), z.null()]),
});

export type CreatePersonaInput = z.infer<typeof createPersonaSchema>;
export type UpdatePersonaInput = z.infer<typeof updatePersonaSchema>;
export type RefreshPersonaInsightsInput = z.infer<typeof refreshPersonaInsightsSchema>;
export type CharacterAnalysisAnswerInput = z.infer<typeof characterAnalysisAnswerSchema>;
