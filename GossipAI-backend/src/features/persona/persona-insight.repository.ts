import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import type { PersonaInsightOutput } from "./persona-insight.contract";
import type { WhatsAppDeepOutput } from "./whatsapp-analysis.contract";

export interface InsightCommit {
  userId: string; personaId: string; language: string; snapshotAt: Date;
  output: PersonaInsightOutput | WhatsAppDeepOutput;
  latestMessage: string | null; conversationId: string | null; sourceImportIds: string[];
  importJob?: { id: string; workerToken: string };
}
export const personaInsightRepository = {
  async save(input: InsightCommit) {
    const { output, personaId } = input;
    return prisma.$transaction(async (tx) => {
      // A slow older analysis must not overwrite a more recent evidence snapshot.
      const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "personas" WHERE "id" = ${personaId} AND "userId" = ${input.userId} FOR UPDATE`;
      if (!locked.length) throw new AppError("Persona not found.", 404);
      const currentImports = await tx.personaWhatsAppImport.findMany({ where: { personaId, status: "completed" }, select: { id: true } });
      if (currentImports.some((item) => !input.sourceImportIds.includes(item.id))) {
        // Another import committed after this inference read its evidence. Retry
        // the merge, even when its inference started earlier than this one.
        throw new AppError("Newer persona evidence is available.", 409, undefined, "PERSONA_INSIGHT_STALE", true);
      }
      if (input.importJob) {
        const completed = await tx.personaWhatsAppImport.updateMany({
          where: { id: input.importJob.id, personaId, status: "processing", workerToken: input.importJob.workerToken },
          data: { status: "completed", analysisJson: output as unknown as Prisma.InputJsonValue, derivedSummary: output.relationshipNarrative, endedAt: new Date(), errorCode: null, workerToken: null, leaseUntil: null },
        });
        if (!completed.count) throw new AppError("Import attempt expired.", 409, undefined, "WHATSAPP_IMPORT_LEASE_LOST", true);
      }
      const existing = await tx.personaInsight.findUnique({ where: { personaId } });
      if (existing?.evidenceSnapshotAt && existing.evidenceSnapshotAt > input.snapshotAt) {
        // An import must retry its final merge if a newer snapshot excluded it.
        if (input.importJob) throw new AppError("Newer persona evidence is available.", 409, undefined, "PERSONA_INSIGHT_STALE", true);
        return existing;
      }
      const data = {
        summary: output.summary, confidence: output.confidence, communicationStyle: output.communicationStyle,
        greenFlagsJson: output.greenFlags, redFlagsJson: output.redFlags,
        relationshipNarrative: output.relationshipNarrative, narrativeLanguage: input.language,
        narrativeUpdatedAt: new Date(), evidenceSnapshotAt: input.snapshotAt,
        lastMessageExcerpt: input.latestMessage, lastAnalyzedConversationId: input.conversationId,
        ...("personaMemory" in output ? { personaMemoryJson: output.personaMemory as Prisma.InputJsonValue } : {}),
      };
      return tx.personaInsight.upsert({ where: { personaId }, create: { personaId, ...data }, update: data });
    });
  },
};
