import assert from "node:assert/strict";
import test, { mock, type TestContext } from "node:test";
import { parseWhatsAppRecords, chunkWhatsAppMessages } from "./whatsapp-records";
import { assertKnownSources, readWhatsAppEvidence, whatsappDeepOutputSchema, WHATSAPP_ANALYSIS_TASK } from "./whatsapp-analysis.contract";
import { ensureTestEnv } from "../../test/test-env";
ensureTestEnv();
process.env.OPENAI_PERSONA_AGENT_ID = "agent_test";
const transcript = '[01.10.2026, 10:00:00] Ali: Yarın görüşelim mi?\n[01.10.2026, 10:01:00] Deniz: Yarın müsait değilim.\nGelecek hafta konuşalım.';
const output = { summary: "Plan henüz net değil.", confidence: 30, communicationStyle: "Açık bir zaman sınırı belirtilmiş.", greenFlags: [], redFlags: [], relationshipNarrative: "Konuşmada bir buluşma önerisi ve zaman sınırı var.", personaMemory: { relationshipType: { value: "unclear", explanation: "İlişki türü açık değil.", sourceRefs: [] }, intimacy: null, currentTopics: [], facts: [{ statement: "Persona yarın müsait olmadığını söyledi.", subject: "persona", sourceRefs: ["import:m2"] }], openQuestions: [], adviceContext: "Belirtilen zaman sınırını gözet." } };
const job = { id: "import", personaId: "persona", persona: { userId: "owner" }, originalFilename: "chat.txt", contentType: "text/plain", byteSize: Buffer.byteLength(transcript), storageObjectKey: "private/key", language: "tr", status: "processing", attempts: 1, messageCount: 2, errorCode: null, createdAt: new Date(), updatedAt: new Date(), endedAt: null, contentHash: parseWhatsAppRecords(transcript).contentHash, participantsJson: ["Ali", "Deniz"], userParticipant: "Ali", personaParticipant: "Deniz", evidenceJson: null, analysisJson: null, processedChunks: 0, totalChunks: 0, workerToken: "worker" };
const stub = (t: TestContext, target: any, key: string, implementation: (...args: any[]) => any) => {
  const original = target[key]; const fn = mock.fn(implementation); target[key] = fn;
  t.after(() => { target[key] = original; }); return fn;
};

test("WhatsApp parser supports iOS/Android, multiline messages, bidi marks and real message counts", () => {
  const parsed = parseWhatsAppRecords('\u200e[01.10.2026, 09:00:00] Messages are encrypted\n' + transcript);
  assert.equal(parsed.messages.length, 2); assert.equal(parsed.systemMessageCount, 1);
  assert.deepEqual(parsed.participants, ["Ali", "Deniz"]);
  assert.match(parsed.messages[1].content, /\nGelecek hafta/);
  const android = parseWhatsAppRecords('10/1/26, 9:00 AM - A: Hi\n10/1/26, 9:01 AM - B: Hello');
  assert.equal(android.messages[0].timestampLabel, '10/1/26, 9:00 AM');
  assert.throws(() => parseWhatsAppRecords('A: Hi\nB: Hello'), /format/);
  assert.throws(() => parseWhatsAppRecords(transcript + '\n[01.10.2026, 11:00:00] Third: Hi'), /one-to-one/);
});
test("all messages survive chunking beyond the previous 30-chunk cutoff; oversized messages fail explicitly", () => {
  const messages = Array.from({ length: 70 }, (_, i) => ({ id: `m${i}`, sender: i % 2 ? 'Deniz' : 'Ali', timestampLabel: '01/10/26 10:00', content: 'x'.repeat(10_000) }));
  const chunks = chunkWhatsAppMessages(messages);
  assert.equal(chunks.length, 70); assert.deepEqual(chunks.flat(), messages);
  assert.throws(() => chunkWhatsAppMessages([{ ...messages[0], content: 'x'.repeat(20_000) }]), /exceeds/);
});
test("deep output requires memory and valid source IDs; partial or duplicated coverage is rejected", () => {
  assert.ok(whatsappDeepOutputSchema.safeParse(output).success);
  const { personaMemory: _, ...legacy } = output;
  assert.equal(whatsappDeepOutputSchema.safeParse(legacy).success, false);
  assert.throws(() => assertKnownSources(output, new Set(['import:m1'])), /not supplied/);
  assert.equal(readWhatsAppEvidence({}), null);
});
test("extraction honors confirmed speakers, explicit type and resume checkpoints", async (t) => {
  const { aiConsentService } = await import('../auth/ai-consent.service');
  const { whatsappImportRepository } = await import('./whatsapp-import.repository');
  const { analyzeWhatsAppRecords, whatsappAnalysisInference } = await import('./whatsapp-analysis.service');
  stub(t, aiConsentService, 'requireActive', async () => undefined);
  const checkpoint = stub(t, whatsappImportRepository, 'checkpoint', async () => undefined);
  const inference = stub(t, whatsappAnalysisInference, 'run', async (payload: any) => {
    assert.deepEqual(payload.type, { task: WHATSAPP_ANALYSIS_TASK, stage: 'extract', version: 1 });
    assert.equal(payload.messages[0].speaker, 'user'); assert.equal(payload.messages[1].speaker, 'persona');
    assert.equal(payload.requestedLanguage, 'tr');
    return { summary: output.summary, observations: output.personaMemory.facts, uncertainties: [] };
  });
  const evidence = await analyzeWhatsAppRecords(job, parseWhatsAppRecords(transcript));
  assert.equal(evidence.coverage.analyzedChunkCount, 1); assert.equal(checkpoint.mock.calls.length, 2);
  assert.ok(readWhatsAppEvidence(evidence));
  assert.equal(readWhatsAppEvidence({ ...evidence, chunks: [...evidence.chunks, ...evidence.chunks] }), null);
  await analyzeWhatsAppRecords({ ...job, evidenceJson: evidence }, parseWhatsAppRecords(transcript));
  assert.equal(inference.mock.calls.length, 1, 'resume must not repay/reanalyze completed chunks');
  await assert.rejects(analyzeWhatsAppRecords({ ...job, userParticipant: null }, parseWhatsAppRecords(transcript)), /participants/);
  inference.mock.mockImplementation(async () => ({ summary: 'Bad', observations: [{ ...output.personaMemory.facts[0], sourceRefs: ['invented'] }], uncertainties: [] }));
  await assert.rejects(analyzeWhatsAppRecords(job, parseWhatsAppRecords(transcript)), /invalid evidence/);
});
test("worker never completes or deletes raw evidence when synthesis is invalid; success commits before cleanup", async (t) => {
  const { aiConsentService } = await import('../auth/ai-consent.service');
  const { whatsappImportRepository } = await import('./whatsapp-import.repository');
  const { whatsappAnalysisInference } = await import('./whatsapp-analysis.service');
  const { personaInsightService } = await import('./persona-insight.service');
  const { personaWhatsAppImportService } = await import('./persona-whatsapp-import.service');
  const { r2PrivateObjectService } = await import('./r2-avatar.service');
  const { AppError } = await import('../../shared/errors/app-error');
  const { prisma } = await import('../../lib/prisma');
  stub(t, aiConsentService, 'requireActive', async () => undefined);
  stub(t, whatsappImportRepository, 'claim', async () => job);
  stub(t, whatsappImportRepository, 'checkpoint', async () => undefined);
  const fail = stub(t, whatsappImportRepository, 'fail', async () => undefined);
  stub(t, r2PrivateObjectService, 'read', async () => ({ body: Buffer.from(transcript) }));
  stub(t, whatsappAnalysisInference, 'run', async () => ({ summary: output.summary, observations: output.personaMemory.facts, uncertainties: [] }));
  const refresh = stub(t, personaInsightService, 'refresh', async () => { throw new AppError('Invalid', 502, undefined, 'PERSONA_INSIGHT_INVALID'); });
  let committed = false;
  const remove = stub(t, r2PrivateObjectService, 'delete', async () => { assert.equal(committed, true); });
  stub(t, whatsappImportRepository, 'clearRaw', async () => undefined);
  stub(t, prisma.pushDevice, 'findMany', async () => []);
  assert.equal((await personaWhatsAppImportService.processNext())?.status, 'failed');
  assert.equal(remove.mock.calls.length, 0); assert.equal(fail.mock.calls[0].arguments[2], true);
  refresh.mock.mockImplementation(async (...args: any[]) => { assert.deepEqual(args[4], { id: job.id, workerToken: job.workerToken }); committed = true; return output; });
  assert.equal((await personaWhatsAppImportService.processNext())?.status, 'completed'); assert.equal(remove.mock.calls.length, 1);
});
test("participant confirmation rejects swapped/unknown ownership data before queuing", async (t) => {
  const { aiConsentService } = await import('../auth/ai-consent.service');
  const { whatsappImportRepository } = await import('./whatsapp-import.repository');
  const { personaWhatsAppImportService } = await import('./persona-whatsapp-import.service');
  stub(t, aiConsentService, 'requireActive', async () => undefined);
  stub(t, whatsappImportRepository, 'getOwned', async (user: string, persona: string, id: string) => { assert.deepEqual([user, persona, id], ['owner', 'persona', 'import']); return { ...job, status: 'awaiting_participants' }; });
  const confirm = stub(t, whatsappImportRepository, 'confirm', async () => undefined);
  await assert.rejects(personaWhatsAppImportService.confirmParticipants('owner', 'persona', 'import', { userParticipant: 'Ali', personaParticipant: 'Ali' }), /two senders/);
  await assert.rejects(personaWhatsAppImportService.confirmParticipants('owner', 'persona', 'import', { userParticipant: 'Unknown', personaParticipant: 'Deniz' }), /two senders/);
  assert.equal(confirm.mock.calls.length, 0);
  await personaWhatsAppImportService.confirmParticipants('owner', 'persona', 'import', { userParticipant: 'Deniz', personaParticipant: 'Ali' });
  assert.equal(confirm.mock.calls[0].arguments[1], 'Deniz', 'never infer identity from filename or persona name');
});

test("synthesis uses WhatsApp task, maps home/detail fields and persists memory only after validation", async (t) => {
  const { prisma } = await import('../../lib/prisma');
  const { aiConsentService } = await import('../auth/ai-consent.service');
  const { personaMemoryService } = await import('./persona-memory.service');
  const { personaInsightService, personaInsightInference } = await import('./persona-insight.service');
  const { personaInsightRepository } = await import('./persona-insight.repository');
  const evidence = { importId: job.id, contentHash: job.contentHash, sourceType: 'whatsapp_export', participants: { user: 'Ali', persona: 'Deniz' }, coverage: { messageCount: 2, chunkCount: 1, analyzedChunkCount: 1, firstTimestampLabel: '01.10.2026', lastTimestampLabel: '01.10.2026', chronology: 'export_order_dates_uninterpreted' }, chunks: [{ index: 0, messageIds: ['import:m1', 'import:m2'], analysis: { summary: output.summary, observations: output.personaMemory.facts, uncertainties: [] } }] };
  stub(t, aiConsentService, 'requireActive', async () => undefined);
  stub(t, prisma.persona, 'findFirst', async () => ({ name: 'Deniz', relationshipType: 'friend' }));
  stub(t, prisma.personaWhatsAppImport, 'findMany', async (args: any) => { assert.equal(args.where.OR[1].workerToken, 'worker'); return [{ id: 'import', derivedSummary: null, evidenceJson: evidence }]; });
  stub(t, prisma.personaCharacterAnalysis, 'findUnique', async () => null);
  stub(t, personaMemoryService, 'list', async () => []);
  const inference = stub(t, personaInsightInference, 'runDeep', async (payload: any) => {
    assert.equal(payload.type.task, WHATSAPP_ANALYSIS_TASK); assert.equal(payload.type.stage, 'synthesize');
    assert.equal(payload.event, 'persona.insights.refresh');
    assert.deepEqual(payload.evidence.whatsappRecords, [evidence]);
    assert.deepEqual(payload.evidence.whatsappSummaries, []);
    return output;
  });
  const save = stub(t, personaInsightRepository, 'save', async (input: any) => ({ ...input.output, personaMemoryJson: input.output.personaMemory, greenFlagsJson: input.output.greenFlags, redFlagsJson: input.output.redFlags, updatedAt: new Date() }));
  const result = await personaInsightService.refresh('owner', 'persona', undefined, 'tr', { id: 'import', workerToken: 'worker' });
  assert.equal(result.summary, output.summary); assert.equal(result.relationshipNarrative, output.relationshipNarrative);
  assert.deepEqual(result.personaMemory, output.personaMemory);
  inference.mock.mockImplementation(async () => ({ ...output, personaMemory: { ...output.personaMemory, facts: [{ ...output.personaMemory.facts[0], sourceRefs: ['import:m1'] }] } }));
  await assert.rejects(personaInsightService.refresh('owner', 'persona', undefined, 'tr', { id: 'import', workerToken: 'worker' }), /invalid evidence/);
  assert.equal(save.mock.calls.length, 1, 'uncited/invented facts must not replace trusted state');
});
test("insight commit fences expired workers and stale evidence inside one transaction", async (t) => {
  const { prisma } = await import('../../lib/prisma');
  const { personaInsightRepository } = await import('./persona-insight.repository');
  const input = { userId: 'owner', personaId: 'persona', language: 'tr', snapshotAt: new Date('2026-10-01'), output: whatsappDeepOutputSchema.parse(output), latestMessage: null, conversationId: null, sourceImportIds: ['import'], importJob: { id: 'import', workerToken: 'worker' } };
  let leaseValid = false; let newer = false; let concurrent = false; let persisted = 0;
  const tx = { $queryRaw: async () => [{ id: 'persona' }], personaWhatsAppImport: { findMany: async () => concurrent ? [{ id: 'concurrent-import' }] : [], updateMany: async (args: any) => { assert.equal(args.where.workerToken, 'worker'); assert.equal(args.data.status, 'completed'); return { count: leaseValid ? 1 : 0 }; } }, personaInsight: { findUnique: async () => newer ? { evidenceSnapshotAt: new Date('2026-10-02') } : null, upsert: async (args: any) => { persisted++; assert.deepEqual(args.create.personaMemoryJson, output.personaMemory); return args.create; } } };
  stub(t, prisma, '$transaction', async (callback: any) => callback(tx));
  await assert.rejects(personaInsightRepository.save(input), /expired/); assert.equal(persisted, 0);
  leaseValid = true; newer = true;
  await assert.rejects(personaInsightRepository.save(input), /Newer/); assert.equal(persisted, 0);
  newer = false; concurrent = true;
  await assert.rejects(personaInsightRepository.save(input), /Newer/); assert.equal(persisted, 0);
  concurrent = false; await personaInsightRepository.save(input); assert.equal(persisted, 1);
});
test("future chat advice includes owned WhatsApp relationship, topics, facts and source attribution", async () => {
  const { buildAgentInputText } = await import('../chatkit/chatkit.service');
  const { chatkitMessageSchema } = await import('../chatkit/chatkit.schema');
  const prompt = buildAgentInputText(chatkitMessageSchema.parse({ content: 'Ne yapayım?', experience: 'conversation' }), 'tr', null, null, [], { sourceType: 'derived_whatsapp_analysis', updatedAt: null, ...whatsappDeepOutputSchema.parse(output).personaMemory });
  assert.match(prompt, /PERSONA_WHATSAPP_EVIDENCE_MEMORY/);
  assert.ok(prompt.includes(output.personaMemory.adviceContext)); assert.match(prompt, /import:m2/);
  assert.match(prompt, /user-confirmed speaker identities/);
});
