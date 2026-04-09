import { MemoryMode } from "@prisma/client";
import { z } from "zod";

export const chatkitModeSchema = z.enum([
  "HELP_ME_REPLY",
  "SITUATION_ANALYSIS",
  "HELP_ME_RESOLVE",
  "SUMMARIZE"
]);

export const chatkitStyleSchema = z.enum(["FLIRTY", "SERIOUS", "CONFUSED"]);
export const chatkitGenderSchema = z.enum(["female", "male", "nonbinary", "unspecified"]);
export const chatkitRelationSchema = z.enum([
  "dating",
  "friend",
  "family",
  "coworker",
  "boss",
  "client",
  "other"
]);

export const chatkitMessageSchema = z.object({
  content: z.string().trim().min(1).max(100_000),
  conversationId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).max(120).optional(),
  memoryMode: z.nativeEnum(MemoryMode).optional(),
  mode: chatkitModeSchema.default("HELP_ME_REPLY"),
  style: chatkitStyleSchema.optional(),
  userGender: chatkitGenderSchema.optional(),
  targetGender: chatkitGenderSchema.optional(),
  relation: chatkitRelationSchema.optional(),
  goal: z.string().trim().min(1).max(500).optional(),
  toneLimits: z.string().trim().min(1).max(500).optional(),
  context: z.string().trim().min(1).max(4000).optional(),
  chatLog: z.string().trim().min(1).max(12000).optional(),
  imageBase64: z.string().max(20_000_000).optional()
});

export type ChatkitMessageInput = z.infer<typeof chatkitMessageSchema>;

export const emailSummarySchema = z.object({
  conversationId: z.string().trim().min(1),
});

export type EmailSummaryInput = z.infer<typeof emailSummarySchema>;
