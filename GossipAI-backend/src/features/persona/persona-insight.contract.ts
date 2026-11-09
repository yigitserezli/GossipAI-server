import { z } from "zod";

/**
 * The persisted API contract used by Home, Persona Detail and Relationship
 * Analysis.  Keep this deliberately compact: every value is shown on a small
 * mobile surface and must be grounded in the supplied evidence.
 */
export const personaInsightOutputSchema = z.object({
  // Home > Relationship Pulse. One or two short, evidence-aware sentences.
  summary: z.string().trim().min(1).max(420),
  // Confidence in the available evidence, never a chemistry/compatibility score.
  confidence: z.number().int().min(0).max(100),
  // Persona Detail > Communication style. Null when the evidence is too thin.
  communicationStyle: z.string().trim().min(1).max(320).nullable(),
  // Persona Detail > Signals. Observations, not facts about intent or personality.
  greenFlags: z.array(z.string().trim().min(1).max(180)).max(5),
  redFlags: z.array(z.string().trim().min(1).max(180)).max(5),
  // Persona Detail and Relationship Analysis. A careful, actionable paragraph.
  relationshipNarrative: z.string().trim().min(1).max(2_000),
}).strict();

export type PersonaInsightOutput = z.infer<typeof personaInsightOutputSchema>;

export type PersonaInsightAgentPayload = {
  type: Record<string, never> | { task: string; stage?: string };
  event: "persona.created" | "persona.insights.refresh";
  requestedLanguage: string;
  persona: {
    name: string;
    relationshipType: string;
    whoIsThis: string | null;
    thoughtsFeelings: string | null;
    goals: string | null;
    currentSituation: string | null;
    communicationStyleNotes: string | null;
  };
  evidence: {
    characterAnalysis: unknown | null;
    whatsappSummaries: string[];
    optedInConversationMemory: unknown[];
    selectedConversation: {
      id: string;
      messages: Array<{ role: string; content: string }>;
    } | null;
  };
  responseContract: {
    summary: string;
    confidence: string;
    communicationStyle: string;
    greenFlags: string;
    redFlags: string;
    relationshipNarrative: string;
  };
};

const compactNullable = (value: string | null | undefined): string | null => {
  const compacted = value?.replace(/\s+/g, " ").trim();
  return compacted || null;
};

export const buildPersonaInsightAgentPayload = (input: {
  language: string;
  isInitialAssessment?: boolean;
  persona: {
    name: string;
    relationshipType: string;
    whoIsThis: string | null;
    thoughtsFeelings: string | null;
    goals: string | null;
    currentSituation: string | null;
    communicationStyle: string | null;
  };
  characterAnalysis: unknown | null;
  whatsappSummaries: Array<string | null>;
  optedInConversationMemory: unknown[];
  selectedConversation: {
    id: string;
    messages: Array<{ role: string; content: string | null }>;
  } | null;
}): PersonaInsightAgentPayload => {
  const selectedConversation = input.selectedConversation
    ? {
        id: input.selectedConversation.id,
        messages: input.selectedConversation.messages.flatMap((message) => {
          const content = compactNullable(message.content);
          return content ? [{ role: message.role, content }] : [];
        }),
      }
    : null;

  const hasImportedOrChatEvidence =
    input.whatsappSummaries.some((summary) => Boolean(compactNullable(summary))) ||
    input.optedInConversationMemory.length > 0 ||
    Boolean(selectedConversation?.messages.length);

  const isRefresh = hasImportedOrChatEvidence || input.isInitialAssessment === false;
  return {
    type: isRefresh ? { task: "refresh persona analysis" } : {},
    event: isRefresh ? "persona.insights.refresh" : "persona.created",
    requestedLanguage: input.language,
    persona: {
      name: input.persona.name,
      relationshipType: input.persona.relationshipType,
      whoIsThis: compactNullable(input.persona.whoIsThis),
      thoughtsFeelings: compactNullable(input.persona.thoughtsFeelings),
      goals: compactNullable(input.persona.goals),
      currentSituation: compactNullable(input.persona.currentSituation),
      communicationStyleNotes: compactNullable(input.persona.communicationStyle),
    },
    evidence: {
      characterAnalysis: input.characterAnalysis,
      whatsappSummaries: input.whatsappSummaries.flatMap((summary) => {
        const compacted = compactNullable(summary);
        return compacted ? [compacted] : [];
      }),
      optedInConversationMemory: input.optedInConversationMemory,
      selectedConversation,
    },
    responseContract: {
      summary:
        "Home > Relationship Pulse: 1-2 concise, evidence-aware sentences; maximum 420 characters.",
      confidence:
        "Integer 0-100 representing confidence in the evidence supplied, not attraction, chemistry, compatibility, or a probability of an outcome.",
      communicationStyle:
        "Persona Detail > Communication style: a concise observed or self-reported communication pattern; null if the evidence is insufficient.",
      greenFlags:
        "Persona Detail > Positive signals: 0-5 cautious observations grounded in the evidence; do not infer intent.",
      redFlags:
        "Persona Detail > Caution signals: 0-5 cautious observations or unanswered risks; never diagnose, label abuse, or state an assumption as fact.",
      relationshipNarrative:
        "Persona Detail and Relationship Analysis: one actionable, careful paragraph. Say what is known, what remains uncertain, and the lowest-pressure useful next step; maximum 2000 characters.",
    },
  };
};
