import assert from "node:assert/strict";
import test from "node:test";
import { buildPersonaInsightAgentPayload, personaInsightOutputSchema } from "./persona-insight.contract";

test("initial persona payload contains only the creation context and declares persona.created", () => {
  const payload = buildPersonaInsightAgentPayload({
    language: "tr",
    persona: {
      name: "Deniz",
      relationshipType: "crush",
      whoIsThis: "Aynı arkadaş grubundan biri",
      thoughtsFeelings: "Merak ediyorum",
      goals: "Tanımak",
      currentSituation: "Ara sıra yazışıyoruz",
      communicationStyle: null,
    },
    characterAnalysis: null,
    whatsappSummaries: [],
    optedInConversationMemory: [],
    selectedConversation: null,
  });

  assert.equal(payload.event, "persona.created");
  assert.deepEqual(payload.type, {});
  assert.equal(payload.persona.name, "Deniz");
  assert.equal(payload.evidence.selectedConversation, null);
  assert.match(payload.responseContract.confidence, /not attraction/i);
});

test("conversation evidence changes the event to a refresh and preserves only non-empty messages", () => {
  const payload = buildPersonaInsightAgentPayload({
    language: "en",
    persona: {
      name: "Alex",
      relationshipType: "friend",
      whoIsThis: null,
      thoughtsFeelings: null,
      goals: null,
      currentSituation: null,
      communicationStyle: null,
    },
    characterAnalysis: null,
    whatsappSummaries: ["  "],
    optedInConversationMemory: [],
    selectedConversation: {
      id: "conversation-1",
      messages: [
        { role: "user", content: "  They replied quickly. " },
        { role: "assistant", content: null },
      ],
    },
  });

  assert.equal(payload.event, "persona.insights.refresh");
  assert.deepEqual(payload.type, { task: "refresh persona analysis" });
  assert.deepEqual(payload.evidence.selectedConversation?.messages, [
    { role: "user", content: "They replied quickly." },
  ]);
});

test("insight output keeps mobile copy bounded and allows an unknown communication style", () => {
  const result = personaInsightOutputSchema.safeParse({
    summary: "A careful first read.",
    confidence: 24,
    communicationStyle: null,
    greenFlags: [],
    redFlags: ["There is no direct evidence of their intent yet."],
    relationshipNarrative: "Use a light, reciprocal next step and wait for more direct evidence before drawing a conclusion.",
  });

  assert.equal(result.success, true);
});
