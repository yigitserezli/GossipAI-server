import { randomUUID } from "node:crypto";
import unzipper from "unzipper";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { aiConsentService } from "../auth/ai-consent.service";
import { sendPushToToken } from "../../lib/firebase-admin";
import { r2PrivateObjectService } from "./r2-avatar.service";
import { personaInsightService } from "./persona-insight.service";
import { whatsappImportRepository, MAX_IMPORT_ATTEMPTS, type ImportJob } from "./whatsapp-import.repository";
import { parseWhatsAppRecords } from "./whatsapp-records";
import { analyzeWhatsAppRecords } from "./whatsapp-analysis.service";

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_EXTRACTED_BYTES = 20 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["text/plain", "application/zip", "application/x-zip-compressed"]);
const fileExtension = (filename: string) => filename.trim().toLowerCase().split(".").at(-1) ?? "";

const validateFile = (filename: string, contentType: string, byteSize: number) => {
  const ext = fileExtension(filename);
  if ((ext !== "txt" && ext !== "zip") || !ACCEPTED_TYPES.has(contentType) || byteSize <= 0 || byteSize > MAX_UPLOAD_BYTES) {
    throw new AppError("Only a WhatsApp TXT export or a media-free ZIP containing one TXT file can be uploaded.", 400, undefined, "INVALID_WHATSAPP_IMPORT", true);
  }
  if (ext === "txt" && contentType !== "text/plain") {
    throw new AppError("TXT exports must use text/plain.", 400, undefined, "INVALID_WHATSAPP_IMPORT", true);
  }
};

const parseZip = async (buffer: Buffer): Promise<string> => {
  const directory = await unzipper.Open.buffer(buffer);
  const files = directory.files.filter((entry) => entry.type === "File");
  if (files.length !== 1 || !files[0]!.path.toLowerCase().endsWith(".txt") || files[0]!.path.includes("..")) {
    throw new AppError("The ZIP must contain exactly one TXT export and no media.", 400, undefined, "INVALID_WHATSAPP_IMPORT", true);
  }
  const entry = files[0]!;
  if (entry.uncompressedSize > MAX_EXTRACTED_BYTES || entry.uncompressedSize > MAX_UPLOAD_BYTES * 8) {
    throw new AppError("The extracted chat is too large.", 400, undefined, "WHATSAPP_IMPORT_TOO_LARGE", true);
  }
  const text = (await entry.buffer()).toString("utf8");
  if (Buffer.byteLength(text, "utf8") > MAX_EXTRACTED_BYTES) throw new AppError("The extracted chat is too large.", 400, undefined, "WHATSAPP_IMPORT_TOO_LARGE", true);
  return text;
};

const extractText = async (record: { storageObjectKey: string | null; originalFilename: string; byteSize: number | null }): Promise<string> => {
  if (!record.storageObjectKey) throw new AppError("Import file is missing.", 422, undefined, "IMPORT_FILE_MISSING", true);
  const { body } = await r2PrivateObjectService.read(record.storageObjectKey);
  if (body.length === 0 || body.length > MAX_UPLOAD_BYTES) throw new AppError("The upload is too large.", 400, undefined, "WHATSAPP_IMPORT_TOO_LARGE", true);
  if (record.byteSize !== null && body.length !== record.byteSize) throw new AppError("Upload size does not match.", 422, undefined, "INVALID_WHATSAPP_IMPORT", true);
  const isZip = fileExtension(record.originalFilename) === "zip";
  if (isZip) return parseZip(body);
  const text = body.toString("utf8");
  if (text.includes("\u0000")) throw new AppError("The export must be UTF-8 text.", 400, undefined, "INVALID_WHATSAPP_IMPORT", true);
  return text;
};

const notifyImportComplete = async (userId: string, personaId: string) => {
  const devices = await prisma.pushDevice.findMany({ where: { userId, notificationsEnabled: true }, select: { token: true, deviceLanguage: true } });
  await Promise.all(devices.map((device) => {
    const turkish = device.deviceLanguage === "tr";
    return sendPushToToken({ token: device.token, title: turkish ? "Persona analizi hazır" : "Persona analysis is ready", body: turkish ? "WhatsApp konuşmasından gelen ilişki yorumu güncellendi." : "Your relationship commentary was updated from the WhatsApp chat.", data: { deepLink: `gossipai://persona/${personaId}`, personaId } }).catch(() => undefined);
  }));
};


const releaseRaw = async (record: ImportJob) => {
  await r2PrivateObjectService.delete(record.storageObjectKey);
  await whatsappImportRepository.clearRaw(record.id);
};
export const personaWhatsAppImportService = {
  async createUploadUrl(userId: string, personaId: string, input: { filename: string; contentType: string; byteSize: number }) {
    await whatsappImportRepository.requirePersona(userId, personaId);
    await aiConsentService.requireActive(userId);
    validateFile(input.filename, input.contentType, input.byteSize);
    const importId = randomUUID();
    const objectKey = `persona-whatsapp-imports/${userId}/${personaId}/${importId}.${fileExtension(input.filename)}`;
    return { importId, objectKey, contentType: input.contentType, ...await r2PrivateObjectService.createUploadUrl(objectKey, input.contentType) };
  },
  async create(userId: string, personaId: string, input: { importId: string; objectKey: string; filename: string; contentType: string; byteSize: number; language?: string }) {
    await whatsappImportRepository.requirePersona(userId, personaId);
    await aiConsentService.requireActive(userId);
    validateFile(input.filename, input.contentType, input.byteSize);
    const expectedKey = `persona-whatsapp-imports/${userId}/${personaId}/${input.importId}.${fileExtension(input.filename)}`;
    if (input.objectKey !== expectedKey) throw new AppError("Import file does not belong to this persona.", 403, undefined, "INVALID_WHATSAPP_IMPORT", true);
    const parsed = parseWhatsAppRecords(await extractText({ storageObjectKey: input.objectKey, originalFilename: input.filename, byteSize: input.byteSize }));
    const record = await whatsappImportRepository.create({ id: input.importId, personaId, originalFilename: input.filename.slice(0, 255), contentType: input.contentType, storageObjectKey: input.objectKey, byteSize: input.byteSize, language: input.language ?? "en", contentHash: parsed.contentHash, participants: parsed.participants, messageCount: parsed.messages.length });
    if (record.id !== input.importId) await r2PrivateObjectService.delete(input.objectKey).catch(() => undefined);
    return this.toResponse(record);
  },
  async confirmParticipants(userId: string, personaId: string, id: string, input: { userParticipant: string; personaParticipant: string }) {
    const record = await whatsappImportRepository.getOwned(userId, personaId, id);
    await aiConsentService.requireActive(userId);
    const participants = Array.isArray(record.participantsJson) ? record.participantsJson : [];
    if (participants.length !== 2 || input.userParticipant === input.personaParticipant || !participants.includes(input.userParticipant) || !participants.includes(input.personaParticipant)) {
      throw new AppError("Select the two senders from this export.", 422, undefined, "WHATSAPP_PARTICIPANTS_REQUIRED", true);
    }
    await whatsappImportRepository.confirm(record, input.userParticipant, input.personaParticipant);
    return this.toResponse(await whatsappImportRepository.getOwned(userId, personaId, id));
  },
  async retry(userId: string, personaId: string, id: string) {
    const record = await whatsappImportRepository.getOwned(userId, personaId, id);
    await aiConsentService.requireActive(userId);
    if (record.status !== "failed" || !record.storageObjectKey) throw new AppError("This import cannot be retried.", 409);
    await whatsappImportRepository.retry(record);
    return this.toResponse(await whatsappImportRepository.getOwned(userId, personaId, id));
  },
  async list(userId: string, personaId: string) {
    return (await whatsappImportRepository.list(userId, personaId)).map((record) => this.toResponse(record));
  },
  toResponse(record: ImportJob) {
    return { id: record.id, filename: record.originalFilename, byteSize: record.byteSize, status: record.status, attempts: record.attempts,
      messageCount: record.messageCount, errorCode: record.errorCode, participants: Array.isArray(record.participantsJson) ? record.participantsJson : [],
      userParticipant: record.userParticipant, personaParticipant: record.personaParticipant, processedChunks: record.processedChunks, totalChunks: record.totalChunks,
      canRetry: record.status === "failed" && !!record.storageObjectKey,
      createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString(), completedAt: record.status === "completed" ? record.endedAt?.toISOString() ?? null : null };
  },
  async cleanupCompleted() {
    for (const record of await whatsappImportRepository.pendingCleanup()) {
      await releaseRaw(record).catch(() => undefined);
    }
  },
  async processNext() {
    const claimed = await whatsappImportRepository.claim();
    if (!claimed) return null;
    try {
      await aiConsentService.requireActive(claimed.persona.userId);
      const parsed = parseWhatsAppRecords(await extractText(claimed));
      // Old queued imports must also wait for explicit sender confirmation.
      if (!claimed.userParticipant || !claimed.personaParticipant) {
        await whatsappImportRepository.checkpoint(claimed, { participantsJson: parsed.participants, messageCount: parsed.messages.length, status: "awaiting_participants", attempts: 0 });
        return { id: claimed.id, status: "awaiting_participants" };
      }
      if (claimed.contentHash && claimed.contentHash !== parsed.contentHash) throw new AppError("The uploaded file changed.", 422, undefined, "WHATSAPP_IMPORT_CONTENT_CHANGED", true);
      await analyzeWhatsAppRecords(claimed, parsed);
      await personaInsightService.refresh(claimed.persona.userId, claimed.personaId, undefined, claimed.language, { id: claimed.id, workerToken: claimed.workerToken! });
    } catch (error) {
      const code = error instanceof AppError ? error.code : "WHATSAPP_IMPORT_PROCESSING_FAILED";
      const terminal = claimed.attempts >= MAX_IMPORT_ATTEMPTS || (error instanceof AppError &&
        (error.statusCode === 400 || error.statusCode === 403 || error.statusCode === 422 || ["PERSONA_INSIGHT_INVALID", "WHATSAPP_IMPORT_ANALYSIS_INVALID"].includes(code)));
      await whatsappImportRepository.fail(claimed, code, terminal);
      return { id: claimed.id, status: terminal ? "failed" : "queued" };
    }
    // Completion and all persona fields have committed together. Cleanup/push failure cannot undo success.
    await releaseRaw(claimed).catch(() => undefined);
    await notifyImportComplete(claimed.persona.userId, claimed.personaId).catch(() => undefined);
    return { id: claimed.id, status: "completed" };
  },
};
