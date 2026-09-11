import { Agent, Runner } from "@openai/agents";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { aiConsentService } from "../auth/ai-consent.service";

const insightOutputSchema = z.object({
  summary: z.string().trim().min(1).max(1_200),
  confidence: z.number().int().min(0).max(100),
  communicationStyle: z.string().trim().max(800).nullable().optional(),
  greenFlags: z.array(z.string().trim().min(1).max(280)).max(5).default([]),
  redFlags: z.array(z.string().trim().min(1).max(280)).max(5).default([]),
  relationshipNarrative: z.string().trim().min(1).max(4_000),
});

const parseJson = (value: unknown) => {
  const text = typeof value === "string" ? value.trim() : "";
  const normalized = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  return insightOutputSchema.parse(JSON.parse(normalized));
};

const compact = (value: string | null | undefined) => value?.replace(/\s+/g, " ").trim() || "Not provided";

const insightLanguageNames: Record<string, string> = {
  tr: "Turkish", en: "English", de: "German", fr: "French", it: "Italian", es: "Spanish", "es-419": "Latin American Spanish", pt: "Portuguese", ru: "Russian", uk: "Ukrainian", zh: "Simplified Chinese", ja: "Japanese", ko: "Korean",
};

export const personaInsightService = {
  async refresh(userId: string, personaId: string, requestedConversationId?: string, language = "en") {
    await aiConsentService.requireActive(userId);
    const persona = await prisma.persona.findFirst({ where: { id: personaId, userId } });
    if (!persona) throw new AppError("Persona not found.", 404, undefined, "PERSONA_NOT_FOUND", true);

    const conversation = requestedConversationId
      ? await prisma.conversation.findFirst({
          where: { id: requestedConversationId, userId, personaId },
      select: { id: true, state: { select: { rollingSummary: true, factsJson: true, openLoopsJson: true } }, messages: { orderBy: { createdAt: "desc" }, take: 12, select: { role: true, content: true } } },
        })
      : await prisma.conversation.findFirst({
          where: { userId, personaId },
          orderBy: { updatedAt: "desc" },
      select: { id: true, state: { select: { rollingSummary: true, factsJson: true, openLoopsJson: true } }, messages: { orderBy: { createdAt: "desc" }, take: 12, select: { role: true, content: true } } },
        });
    if (requestedConversationId && !conversation) {
      throw new AppError("Conversation not found for this persona.", 404, undefined, "PERSONA_CONVERSATION_NOT_FOUND", true);
    }

    const messages = [...(conversation?.messages ?? [])].reverse();
    const latestMessage = messages.at(-1)?.content?.trim().slice(0, 500) ?? null;
    const [imports, optedConversationStates, characterAnalysis] = await Promise.all([
      prisma.personaWhatsAppImport.findMany({ where: { personaId, status: "completed" }, orderBy: { createdAt: "desc" }, take: 8, select: { derivedSummary: true } }),
      prisma.conversation.findMany({ where: { userId, personaId, personaInsightsEnabled: true, status: { not: "deleted" } }, orderBy: { updatedAt: "desc" }, take: 8, select: { state: { select: { rollingSummary: true, factsJson: true, openLoopsJson: true } } } }),
      prisma.personaCharacterAnalysis.findUnique({ where: { personaId }, select: { status: true, primaryTypeId: true, secondaryTraitsJson: true } }),
    ]);
    const prompt = [
      "Create relationship insights from only the supplied user context and conversation excerpts.",
      "Do not present assumptions as facts. Avoid diagnosis, certainty, or safety claims.",
      "Return JSON only with summary, confidence (0-100), communicationStyle, greenFlags, redFlags, relationshipNarrative.",
      "relationshipNarrative must be one careful, actionable paragraph grounded in the supplied sources; mention uncertainty where evidence is sparse.",
      `Write every human-readable JSON string in ${insightLanguageNames[language] ?? insightLanguageNames.en}.`,
      `PERSONA NAME: ${persona.name}`,
      `RELATIONSHIP: ${persona.relationshipType}`,
      `WHO THEY ARE: ${compact(persona.whoIsThis)}`,
      `USER FEELINGS: ${compact(persona.thoughtsFeelings)}`,
      `USER GOAL: ${compact(persona.goals)}`,
      `CURRENT SITUATION: ${compact(persona.currentSituation)}`,
      `COMMUNICATION STYLE NOTES: ${compact(persona.communicationStyle)}`,
      `CHARACTER ANALYSIS (deterministic, not a diagnosis): ${characterAnalysis ? JSON.stringify(characterAnalysis) : "Not available"}`,
      "WHATSAPP-DERIVED SUMMARIES:",
      imports.length ? imports.map((item, index) => `IMPORT ${index + 1}: ${compact(item.derivedSummary)}`).join("\n") : "No WhatsApp import.",
      "OPTED-IN PERSONA CHAT MEMORY:",
      optedConversationStates.length ? optedConversationStates.map((item, index) => `CHAT ${index + 1}: ${JSON.stringify(item.state)}`).join("\n") : "No opted-in chat memory.",
      "CONVERSATION EXCERPTS:",
      messages.length
        ? messages.map((message) => `${message.role}: ${compact(message.content)}`).join("\n")
        : "No persona chat messages yet.",
    ].join("\n");

    const agent = new Agent({
      name: "PERSONA_INSIGHTS",
      model: env.OPENAI_AGENT_MODEL,
      instructions: "You are a cautious relationship-context summarizer. Follow the requested JSON schema exactly.",
    });
    const runner = new Runner({ tracingDisabled: true, traceIncludeSensitiveData: false });
    const result = await runner.run(agent, [{ role: "user", content: prompt }]);
    let output;
    try {
      output = parseJson(result.finalOutput);
    } catch {
      throw new AppError("Persona insight generation returned an invalid result.", 502, undefined, "PERSONA_INSIGHT_INVALID", true);
    }

    const insight = await prisma.personaInsight.upsert({
      where: { personaId },
      create: {
        personaId,
        summary: output.summary,
        confidence: output.confidence,
        communicationStyle: output.communicationStyle ?? null,
        greenFlagsJson: output.greenFlags,
        redFlagsJson: output.redFlags,
        lastMessageExcerpt: latestMessage,
        lastAnalyzedConversationId: conversation?.id ?? null,
        relationshipNarrative: output.relationshipNarrative,
        narrativeLanguage: language,
        narrativeUpdatedAt: new Date(),
      },
      update: {
        summary: output.summary,
        confidence: output.confidence,
        communicationStyle: output.communicationStyle ?? null,
        greenFlagsJson: output.greenFlags,
        redFlagsJson: output.redFlags,
        lastMessageExcerpt: latestMessage,
        lastAnalyzedConversationId: conversation?.id ?? null,
        relationshipNarrative: output.relationshipNarrative,
        narrativeLanguage: language,
        narrativeUpdatedAt: new Date(),
      },
    });

    return {
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
