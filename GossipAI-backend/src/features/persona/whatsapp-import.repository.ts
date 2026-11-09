import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";

export const MAX_IMPORT_ATTEMPTS = 3;
export const importJson = (value: unknown) => value as Prisma.InputJsonValue;
export interface ImportJob {
  id: string; personaId: string; originalFilename: string; contentType: string;
  storageObjectKey: string | null; byteSize: number | null; language: string;
  status: string; attempts: number; messageCount: number | null; errorCode: string | null;
  createdAt: Date; updatedAt: Date; endedAt: Date | null; contentHash: string | null;
  participantsJson: unknown; userParticipant: string | null; personaParticipant: string | null;
  evidenceJson: unknown; analysisJson: unknown; processedChunks: number; totalChunks: number;
  workerToken: string | null; persona: { userId: string };
}
const includeOwner = { persona: { select: { userId: true } } } as const;
export const whatsappImportRepository = {
  async requirePersona(userId: string, personaId: string) {
    if (!await prisma.persona.findFirst({ where: { id: personaId, userId }, select: { id: true } })) {
      throw new AppError("Persona not found.", 404, undefined, "PERSONA_NOT_FOUND", true);
    }
  },
  async list(userId: string, personaId: string): Promise<ImportJob[]> {
    await this.requirePersona(userId, personaId);
    return prisma.personaWhatsAppImport.findMany({ where: { personaId }, orderBy: { createdAt: "desc" }, include: includeOwner });
  },
  async getOwned(userId: string, personaId: string, id: string): Promise<ImportJob> {
    const record = await prisma.personaWhatsAppImport.findFirst({ where: { id, personaId, persona: { userId } }, include: includeOwner });
    if (!record) throw new AppError("Import not found.", 404, undefined, "WHATSAPP_IMPORT_NOT_FOUND", true);
    return record;
  },
  async create(input: { id: string; personaId: string; originalFilename: string; contentType: string; storageObjectKey: string; byteSize: number; language: string; contentHash: string; participants: string[]; messageCount: number }): Promise<ImportJob> {
    const { participants, ...data } = input;
    // The unique hash prevents the same export being treated as independent evidence.
    return prisma.personaWhatsAppImport.upsert({
      where: { personaId_contentHash: { personaId: input.personaId, contentHash: input.contentHash } },
      create: { ...data, participantsJson: participants, status: "awaiting_participants" },
      update: {}, include: includeOwner,
    });
  },
  async confirm(record: ImportJob, userParticipant: string, personaParticipant: string) {
    const result = await prisma.personaWhatsAppImport.updateMany({
      where: { id: record.id, status: "awaiting_participants" },
      data: { userParticipant, personaParticipant, status: "queued", nextAttemptAt: new Date(), errorCode: null },
    });
    if (!result.count) throw new AppError("Import is already being processed.", 409);
  },
  async retry(record: ImportJob) {
    await prisma.personaWhatsAppImport.updateMany({ where: { id: record.id, status: "failed" }, data: {
      status: record.userParticipant && record.personaParticipant ? "queued" : "awaiting_participants",
      attempts: 0, errorCode: null, endedAt: null, nextAttemptAt: new Date(), workerToken: null, leaseUntil: null,
    } });
  },
  async claim(): Promise<ImportJob | null> {
    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`UPDATE "persona_whatsapp_imports" SET "status" = 'failed', "errorCode" = 'WHATSAPP_IMPORT_ATTEMPTS_EXHAUSTED', "endedAt" = NOW(), "updatedAt" = NOW(), "workerToken" = NULL, "leaseUntil" = NULL
        WHERE "status" = 'processing' AND "attempts" >= ${MAX_IMPORT_ATTEMPTS} AND COALESCE("leaseUntil", "startedAt" + INTERVAL '15 minutes') < NOW()`;
      const rows = await tx.$queryRaw<Array<{ id: string }>>`SELECT "id" FROM "persona_whatsapp_imports"
        WHERE ("status" = 'queued' OR ("status" = 'processing' AND COALESCE("leaseUntil", "startedAt" + INTERVAL '15 minutes') < NOW()))
          AND "nextAttemptAt" <= NOW() AND "attempts" < ${MAX_IMPORT_ATTEMPTS}
        ORDER BY "createdAt" ASC FOR UPDATE SKIP LOCKED LIMIT 1`;
      if (!rows[0]) return null;
      return tx.personaWhatsAppImport.update({ where: { id: rows[0].id }, data: {
        status: "processing", attempts: { increment: 1 }, startedAt: new Date(), errorCode: null,
        workerToken: randomUUID(), leaseUntil: new Date(Date.now() + 5 * 60_000),
      }, include: includeOwner });
    });
  },
  async checkpoint(job: ImportJob, data: { evidenceJson?: unknown; processedChunks?: number; totalChunks?: number; participantsJson?: string[]; byteSize?: number; messageCount?: number; status?: string; attempts?: number }) {
    const { evidenceJson, ...fields } = data;
    const result = await prisma.personaWhatsAppImport.updateMany({ where: { id: job.id, workerToken: job.workerToken, status: "processing" }, data: {
      ...fields, ...(evidenceJson ? { evidenceJson: importJson(evidenceJson) } : {}),
      leaseUntil: new Date(Date.now() + 5 * 60_000),
    } });
    if (!result.count) throw new AppError("Import attempt expired.", 409, undefined, "WHATSAPP_IMPORT_LEASE_LOST", true);
  },
  async fail(job: ImportJob, code: string, terminal: boolean) {
    await prisma.personaWhatsAppImport.updateMany({ where: { id: job.id, workerToken: job.workerToken, status: "processing" }, data: {
      status: terminal ? "failed" : "queued", errorCode: code, workerToken: null, leaseUntil: null,
      endedAt: terminal ? new Date() : null, nextAttemptAt: new Date(Date.now() + 60_000 * 2 ** job.attempts),
    } });
  },
  async pendingCleanup(): Promise<ImportJob[]> {
    return prisma.personaWhatsAppImport.findMany({ where: { status: "completed", storageObjectKey: { not: null } },
      orderBy: { updatedAt: "asc" }, take: 10, include: includeOwner });
  },
  async clearRaw(id: string) {
    await prisma.personaWhatsAppImport.update({ where: { id }, data: { storageObjectKey: null, rawDeletedAt: new Date() } });
  },
};
