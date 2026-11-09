import assert from "node:assert/strict";
import test, { mock, type TestContext } from "node:test";
import { ensureTestEnv } from "../../test/test-env";
ensureTestEnv();
process.env.OPENAI_PERSONA_AGENT_ID = "agent_test";

const stub = (t: TestContext, target: any, key: string, implementation: (...args: any[]) => any) => {
  const original = target[key];
  const fn = mock.fn(implementation);
  target[key] = fn;
  t.after(() => { target[key] = original; });
  return fn;
};

test("persona refresh uses durable permitted memory, no implicit latest chat, and maps all UI fields", async (t) => {
  const { prisma } = await import("../../lib/prisma");
  const { aiConsentService } = await import("../auth/ai-consent.service");
  const { personaInsightService, personaInsightInference } = await import("./persona-insight.service");
  const { personaMemoryService } = await import("./persona-memory.service");
  t.after(() => mock.restoreAll());
  const persona = { name: "Deniz", relationshipType: "crush", whoIsThis: "Arkadaş grubundan", thoughtsFeelings: "Benden hoşlandığını düşünüyorum.", goals: "Tanımak", currentSituation: null, communicationStyle: null };
  const output = { summary: "İlk değerlendirme", confidence: 15, communicationStyle: null, greenFlags: [], redFlags: [], relationshipNarrative: "Daha fazla gözlem gerekli." };
  stub(t, prisma.persona, "findFirst", async () => persona);
  const consent = mock.method(aiConsentService, "requireActive", async () => undefined);
  stub(t, prisma.personaWhatsAppImport, "findMany", async () => []);
  stub(t, prisma.personaCharacterAnalysis, "findUnique", async () => ({ status: "in_progress", primaryTypeId: "unfinished" }));
  const savedMemory = [{ sourceConversationId: "old-chat", sourceType: "derived_conversation_memory", updatedAt: new Date().toISOString(), rollingSummary: "Kullanıcı Deniz'in romantik ilişki istemediğini aktardı.", factsJson: [], openLoopsJson: [] }];
  mock.method(personaMemoryService, "list", async () => savedMemory);
  const conversation = stub(t, prisma.conversation, "findFirst", async (args: any) => {
    assert.equal(args.where.personaInsightsEnabled, true);
    assert.deepEqual(args.where.status, { not: "deleted" });
    assert.equal(args.where.userId, "owner");
    return { id: "current-chat", messages: [{ role: "user", content: "Son haber" }] };
  });
  const inference = mock.method(personaInsightInference, "run", async (payload: any) => {
    assert.deepEqual(payload.evidence.optedInConversationMemory, savedMemory);
    assert.equal(payload.evidence.characterAnalysis, null);
    assert.equal(payload.persona.thoughtsFeelings, persona.thoughtsFeelings);
    return output;
  });
  const { personaInsightRepository } = await import("./persona-insight.repository");
  const save = stub(t, personaInsightRepository, "save", async (args: any) => ({ ...args.output,
    greenFlagsJson: args.output.greenFlags, redFlagsJson: args.output.redFlags,
    narrativeLanguage: args.language, narrativeUpdatedAt: new Date(), updatedAt: new Date(),
    lastMessageExcerpt: args.latestMessage, lastAnalyzedConversationId: args.conversationId,
  }));
  const result = await personaInsightService.refresh("owner", "persona", undefined, "tr");
  assert.equal(conversation.mock.calls.length, 0);
  assert.equal(inference.mock.calls[0].arguments[0].evidence.selectedConversation, null);
  for (const key of Object.keys(output)) assert.deepEqual((result as any)[key], (output as any)[key]);
  assert.equal(result.narrativeLanguage, "tr");
  assert.equal(result.lastAnalyzedConversationId, null);
  assert.equal(consent.mock.calls.length, 2);
  const selected = await personaInsightService.refresh("owner", "persona", "current-chat", "tr");
  assert.equal(selected.lastAnalyzedConversationId, "current-chat");
  assert.equal(selected.lastMessageExcerpt, "Son haber");
  inference.mock.mockImplementation(async () => { throw new Error("Invalid remote result"); });
  await assert.rejects(personaInsightService.refresh("owner", "persona", undefined, "tr"), /Invalid remote/);
  assert.equal(save.mock.calls.length, 2, "failure must preserve existing insight");
});

test("persona memory is owner/persona scoped, permissioned, excludes current chat and skips empty state", async (t) => {
  const { prisma } = await import("../../lib/prisma");
  const { personaMemoryService } = await import("./persona-memory.service");
  t.after(() => mock.restoreAll());
  const state = { rollingSummary: "Prior boundary", factsJson: [], openLoopsJson: [], updatedAt: new Date() };
  stub(t, prisma.conversation, "findMany", async (args: any) => {
    assert.deepEqual(args.where, { userId: "owner", personaId: "persona", personaInsightsEnabled: true, status: { not: "deleted" }, id: { not: "current" } });
    return [{ id: "old", state }, { id: "empty", state: null }];
  });
  const result = await personaMemoryService.list("owner", "persona", "current");
  assert.equal(result.length, 1);
  assert.equal(result[0].sourceConversationId, "old");
  assert.equal(result[0].rollingSummary, "Prior boundary");
});

test("chat prompt carries current chat memory and attributed conclusions from other persona chats", async () => {
  const { buildAgentInputText } = await import("../chatkit/chatkit.service");
  const { chatkitMessageSchema } = await import("../chatkit/chatkit.schema");
  const input = chatkitMessageSchema.parse({ content: "Bugün ne yapmalıyım?", experience: "conversation", language: "tr" });
  const persona = { id: "persona", name: "Deniz", relationshipType: "friend", whoIsThis: null, thoughtsFeelings: null, goals: null, currentSituation: null, communicationStyle: null };
  const currentMemory = { rollingSummary: "Bu sohbetin önceki mesajında yarın buluşacağımızı söyledim.", factsJson: [], openLoopsJson: [] };
  const priorMemory = [{ sourceConversationId: "earlier", sourceType: "derived_conversation_memory", updatedAt: new Date().toISOString(), rollingSummary: "Önceki sohbette kullanıcının bildirdiği önemli sınır.", factsJson: [], openLoopsJson: [] }];
  const prompt = buildAgentInputText(input, "tr", persona, currentMemory, priorMemory);
  assert.ok(prompt.includes(currentMemory.rollingSummary));
  assert.ok(prompt.includes(priorMemory[0].rollingSummary));
  assert.ok(prompt.includes('"sourceConversationId":"earlier"'));
  assert.ok(prompt.includes(input.content));
  assert.match(prompt, /Derived prior reports, not new observations/);
});
