import { z } from "zod";
import { personaInsightOutputSchema } from "./persona-insight.contract";

export const WHATSAPP_ANALYSIS_TASK = "make your deep analysis with whatsapp records" as const;
const sourceRefs = z.array(z.string().min(1).max(140)).min(1).max(12);
const observation = z.object({
  statement: z.string().trim().min(1).max(600),
  subject: z.enum(["user", "persona", "interaction"]),
  sourceRefs,
}).strict();
export const whatsappChunkOutputSchema = z.object({
  summary: z.string().trim().min(1).max(4_000),
  observations: z.array(observation).max(30),
  uncertainties: z.array(z.string().trim().min(1).max(400)).max(10),
}).strict();
const supportedFinding = z.object({ description: z.string().trim().min(1).max(800), sourceRefs }).strict();
export const whatsappMemorySchema = z.object({
  relationshipType: z.object({
    value: z.enum(["crush", "ex", "partner", "friend", "coworker", "family", "other", "unclear"]),
    explanation: z.string().trim().min(1).max(600),
    sourceRefs: z.array(z.string().min(1).max(140)).max(12),
  }).strict(),
  intimacy: supportedFinding.nullable(),
  currentTopics: z.array(supportedFinding).max(10),
  facts: z.array(observation).max(30),
  openQuestions: z.array(z.string().trim().min(1).max(400)).max(10),
  adviceContext: z.string().trim().min(1).max(3_000),
}).strict();
export const whatsappDeepOutputSchema = personaInsightOutputSchema.extend({ personaMemory: whatsappMemorySchema }).strict();
export type WhatsAppDeepOutput = z.infer<typeof whatsappDeepOutputSchema>;
export type WhatsAppChunkOutput = z.infer<typeof whatsappChunkOutputSchema>;
export interface WhatsAppEvidence {
  importId: string;
  contentHash: string | null;
  sourceType: "whatsapp_export";
  participants: { user: string; persona: string };
  coverage: { messageCount: number; chunkCount: number; analyzedChunkCount: number; firstTimestampLabel: string; lastTimestampLabel: string; chronology: "export_order_dates_uninterpreted" };
  chunks: Array<{ index: number; messageIds: string[]; analysis: WhatsAppChunkOutput }>;
}

export function assertKnownSources(value: unknown, validRefs: Set<string>): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) { value.forEach((item) => assertKnownSources(item, validRefs)); return; }
  for (const [key, nested] of Object.entries(value)) {
    if (key === "sourceRefs" && Array.isArray(nested) && nested.some((ref) => typeof ref !== "string" || !validRefs.has(ref))) {
      throw new Error("Analysis referred to a message that was not supplied.");
    }
    assertKnownSources(nested, validRefs);
  }
}

export function readWhatsAppEvidence(value: unknown): WhatsAppEvidence | null {
  const schema = z.object({
    importId: z.string(), contentHash: z.string().nullable(), sourceType: z.literal("whatsapp_export"),
    participants: z.object({ user: z.string().min(1), persona: z.string().min(1) }),
    coverage: z.object({ messageCount: z.number().int().positive(), chunkCount: z.number().int().positive(), analyzedChunkCount: z.number().int().nonnegative(), firstTimestampLabel: z.string(), lastTimestampLabel: z.string(), chronology: z.literal("export_order_dates_uninterpreted") }),
    chunks: z.array(z.object({ index: z.number().int().nonnegative(), messageIds: z.array(z.string()), analysis: whatsappChunkOutputSchema })),
  });
  const result = schema.safeParse(value);
  if (!result.success) return null;
  const evidence = result.data;
  const indexes = evidence.chunks.map((chunk) => chunk.index);
  const ids = evidence.chunks.flatMap((chunk) => chunk.messageIds);
  if (evidence.participants.user === evidence.participants.persona ||
      new Set(indexes).size !== indexes.length || new Set(ids).size !== ids.length ||
      evidence.coverage.analyzedChunkCount !== indexes.length ||
      indexes.some((index) => index >= evidence.coverage.chunkCount) ||
      (indexes.length === evidence.coverage.chunkCount && ids.length !== evidence.coverage.messageCount)) return null;
  try { evidence.chunks.forEach((chunk) => assertKnownSources(chunk.analysis, new Set(chunk.messageIds))); }
  catch { return null; }
  return evidence;
}
