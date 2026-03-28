import { MemoryMode } from "@prisma/client";
import { z } from "zod";

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  mode: z.string().default("HELP_ME_REPLY"),
  style: z.string().optional(),
  relation: z.string().optional(),
  memoryMode: z.nativeEnum(MemoryMode).default(MemoryMode.summary_only)
});

export const createConversationMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000)
});

export const updateConversationSettingsSchema = z.object({
  memoryMode: z.nativeEnum(MemoryMode)
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type CreateConversationMessageInput = z.infer<typeof createConversationMessageSchema>;
export type UpdateConversationSettingsInput = z.infer<typeof updateConversationSettingsSchema>;
