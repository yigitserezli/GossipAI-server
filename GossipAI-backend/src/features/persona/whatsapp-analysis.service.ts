import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";
import { aiConsentService } from "../auth/ai-consent.service";
import { runStructuredPersonaAgent } from "./persona-agent.client";
import { chunkWhatsAppMessages, type WhatsAppRecords } from "./whatsapp-records";
import { whatsappImportRepository, type ImportJob } from "./whatsapp-import.repository";
import { WHATSAPP_ANALYSIS_TASK, readWhatsAppEvidence, whatsappChunkOutputSchema, assertKnownSources, type WhatsAppEvidence } from "./whatsapp-analysis.contract";

export const whatsappAnalysisInference = { run: runStructuredPersonaAgent };
export async function analyzeWhatsAppRecords(job: ImportJob, parsed: WhatsAppRecords) {
  if (!env.OPENAI_PERSONA_AGENT_ID) throw new AppError("Persona agent is not configured.", 503, undefined, "PERSONA_AGENT_NOT_CONFIGURED", true);
  if (!job.userParticipant || !job.personaParticipant || job.userParticipant === job.personaParticipant ||
      !parsed.participants.includes(job.userParticipant) || !parsed.participants.includes(job.personaParticipant)) {
    throw new AppError("Select the WhatsApp participants first.", 422, undefined, "WHATSAPP_PARTICIPANTS_REQUIRED", true);
  }
  const messages = parsed.messages.map((message) => ({ ...message, id: `${job.id}:${message.id}` }));
  const chunks = chunkWhatsAppMessages(messages);
  const previous = readWhatsAppEvidence(job.evidenceJson);
  const evidence: WhatsAppEvidence = previous?.contentHash === parsed.contentHash && previous.participants.user === job.userParticipant && previous.participants.persona === job.personaParticipant && previous.coverage.chunkCount === chunks.length ? previous : {
    importId: job.id, contentHash: parsed.contentHash, sourceType: "whatsapp_export",
    participants: { user: job.userParticipant, persona: job.personaParticipant },
    coverage: { messageCount: messages.length, chunkCount: chunks.length, analyzedChunkCount: 0,
      firstTimestampLabel: messages[0]!.timestampLabel, lastTimestampLabel: messages.at(-1)!.timestampLabel, chronology: "export_order_dates_uninterpreted" },
    chunks: [],
  };
  await whatsappImportRepository.checkpoint(job, { totalChunks: chunks.length });
  for (const [index, chunk] of chunks.entries()) {
    if (evidence.chunks.some((item) => item.index === index)) continue;
    await aiConsentService.requireActive(job.persona.userId);
    const analysis = await whatsappAnalysisInference.run({
      type: { task: WHATSAPP_ANALYSIS_TASK, stage: "extract", version: 1 },
      requestedLanguage: job.language,
      source: { importId: job.id, contentHash: parsed.contentHash, chunkIndex: index, chunkCount: chunks.length,
        messageCount: messages.length, systemMessageCount: parsed.systemMessageCount,
        chronology: "export_order_dates_uninterpreted", participants: evidence.participants },
      messages: chunk.map(({ sender, ...message }) => ({ ...message, speaker: sender === job.userParticipant ? "user" : "persona" })),
    }, { apiKey: env.OPENAI_API_KEY, agentId: env.OPENAI_PERSONA_AGENT_ID }, whatsappChunkOutputSchema);
    try { assertKnownSources(analysis, new Set(chunk.map((message) => message.id))); }
    catch { throw new AppError("WhatsApp analysis contains invalid evidence references.", 502, undefined, "WHATSAPP_IMPORT_ANALYSIS_INVALID", true); }
    evidence.chunks.push({ index, messageIds: chunk.map((message) => message.id), analysis });
    evidence.coverage.analyzedChunkCount = evidence.chunks.length;
    await aiConsentService.requireActive(job.persona.userId);
    await whatsappImportRepository.checkpoint(job, { evidenceJson: evidence, processedChunks: evidence.chunks.length, messageCount: messages.length });
  }
  return evidence;
}
