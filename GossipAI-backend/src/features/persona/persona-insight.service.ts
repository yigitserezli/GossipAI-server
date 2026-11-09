import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { aiConsentService } from "../auth/ai-consent.service";
import { buildPersonaInsightAgentPayload } from "./persona-insight.contract";
import { runPersonaAgent, runStructuredPersonaAgent } from "./persona-agent.client";
import { personaMemoryService } from "./persona-memory.service";

import { WHATSAPP_ANALYSIS_TASK, readWhatsAppEvidence, whatsappDeepOutputSchema, whatsappMemorySchema, assertKnownSources } from "./whatsapp-analysis.contract";
import { personaInsightRepository } from "./persona-insight.repository";

export const personaInsightInference = { run: runPersonaAgent, runDeep: runStructuredPersonaAgent };

export const personaInsightService = {
  async refresh(userId: string, personaId: string, requestedConversationId?: string, language = "en", importJob?: { id: string; workerToken: string }) {
    const snapshotAt = new Date();
    await aiConsentService.requireActive(userId);
    const persona = await prisma.persona.findFirst({ where: { id: personaId, userId }, include: { insight: { select: { personaId: true } } } });
    if (!persona) throw new AppError("Persona not found.", 404, undefined, "PERSONA_NOT_FOUND", true);

    const conversation = requestedConversationId
      ? await prisma.conversation.findFirst({
          where: { id: requestedConversationId, userId, personaId, personaInsightsEnabled: true, status: { not: "deleted" } },
          select: { id: true, messages: { orderBy: { createdAt: "desc" }, take: 12, select: { role: true, content: true } } },
        })
      : null;
    if (requestedConversationId && !conversation) {
      throw new AppError("Conversation not found for this persona.", 404, undefined, "PERSONA_CONVERSATION_NOT_FOUND", true);
    }

    const messages = [...(conversation?.messages ?? [])].reverse();
    const latestMessage = messages.at(-1)?.content?.trim().slice(0, 500) ?? null;
    const [imports, optedConversationStates, characterAnalysis] = await Promise.all([
      prisma.personaWhatsAppImport.findMany({ where: { personaId, OR: [{ status: "completed" }, ...(importJob ? [{ id: importJob.id, status: "processing", workerToken: importJob.workerToken }] : [])] }, orderBy: { createdAt: "desc" }, select: { id: true, derivedSummary: true, evidenceJson: true } }),
      personaMemoryService.list(userId, personaId),
      prisma.personaCharacterAnalysis.findUnique({ where: { personaId }, select: { status: true, primaryTypeId: true, secondaryTraitsJson: true } }),
    ]);
    const payload = buildPersonaInsightAgentPayload({
      language,
      isInitialAssessment: !persona.insight,
      persona,
      characterAnalysis: characterAnalysis?.status === "complete" ? characterAnalysis : null,
      whatsappSummaries: imports.map((item) => item.derivedSummary),
      optedInConversationMemory: optedConversationStates,
      selectedConversation: conversation
        ? { id: conversation.id, messages: messages.map((message) => ({ role: message.role, content: message.content })) }
        : null,
    });
    if (!env.OPENAI_PERSONA_AGENT_ID) {
      throw new AppError("Persona agent is not configured.", 503, undefined, "PERSONA_AGENT_NOT_CONFIGURED", true);
    }
    const records = imports.flatMap((item) => {
      const evidence = readWhatsAppEvidence(item.evidenceJson);
      if (item.evidenceJson && (!evidence || evidence.coverage.analyzedChunkCount !== evidence.coverage.chunkCount)) {
        throw new AppError("WhatsApp evidence is incomplete.", 422, undefined, "WHATSAPP_EVIDENCE_INCOMPLETE", true);
      }
      return evidence && evidence.coverage.analyzedChunkCount === evidence.coverage.chunkCount ? [evidence] : [];
    });
    if (importJob && !records.some((record) => record.importId === importJob.id)) {
      throw new AppError("WhatsApp evidence is incomplete.", 422, undefined, "WHATSAPP_EVIDENCE_INCOMPLETE", true);
    }
    const config = { apiKey: env.OPENAI_API_KEY, agentId: env.OPENAI_PERSONA_AGENT_ID };
    const output = records.length
      ? await personaInsightInference.runDeep({
          ...payload,
          event: "persona.insights.refresh",
          responseContract: { ...payload.responseContract, personaMemory: "Return the required evidence-backed relationshipType, intimacy, currentTopics, facts, openQuestions and adviceContext. All sourceRefs must refer to supplied WhatsApp message IDs; never swap user/persona roles." },
          type: { task: WHATSAPP_ANALYSIS_TASK, stage: "synthesize", version: 1 },
          evidence: { ...payload.evidence,
            // Do not present old analysis of the same import as independent evidence.
            whatsappSummaries: imports.filter((item) => !records.some((record) => record.importId === item.id)).map((item) => item.derivedSummary).filter(Boolean),
            whatsappRecords: records,
          },
        }, config, whatsappDeepOutputSchema)
      : await personaInsightInference.run(payload, config);
    if ("personaMemory" in output) {
      try {
        const memory = whatsappMemorySchema.parse(output.personaMemory);
        assertKnownSources(memory, new Set(records.flatMap((record) => record.chunks.flatMap((chunk) => chunk.analysis.observations.flatMap((observation) => observation.sourceRefs)))));
        if (memory.relationshipType.value !== "unclear" && !memory.relationshipType.sourceRefs.length) throw new Error("Missing evidence");
      } catch { throw new AppError("WhatsApp analysis contains invalid evidence references.", 502, undefined, "WHATSAPP_IMPORT_ANALYSIS_INVALID", true); }
    }
    await aiConsentService.requireActive(userId);
    const insight = await personaInsightRepository.save({ userId, personaId, language, snapshotAt, output,
      latestMessage, conversationId: conversation?.id ?? null, sourceImportIds: imports.map((item) => item.id), importJob });

    return {
      personaMemory: insight.personaMemoryJson,
      summary: insight.summary,
      confidence: insight.confidence,
      communicationStyle: insight.communicationStyle,
      greenFlags: Array.isArray(insight.greenFlagsJson) ? insight.greenFlagsJson : [],
      redFlags: Array.isArray(insight.redFlagsJson) ? insight.redFlagsJson : [],
      lastMessageExcerpt: insight.lastMessageExcerpt,
      lastAnalyzedConversationId: insight.lastAnalyzedConversationId,
      relationshipNarrative: insight.relationshipNarrative,
      narrativeLanguage: insight.narrativeLanguage,
      narrativeUpdatedAt: insight.narrativeUpdatedAt?.toISOString() ?? null,
      updatedAt: insight.updatedAt.toISOString(),
    };
  },
};
