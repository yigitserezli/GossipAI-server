import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { ensureTestEnv } from "../../test/test-env";
import { replyMessageIds, replyStatus, CHAT_REPLY_COPY, replyNotificationCopy } from "./chat-reply.domain";
import { chatkitMessageSchema } from "./chatkit.schema";

ensureTestEnv();
const requestId = "11111111-1111-4111-8111-111111111111";

test("reply IDs are stable and scoped to their owner, not message contents", () => {
  assert.deepEqual(replyMessageIds("alice", requestId), replyMessageIds("alice", requestId));
  assert.notDeepEqual(replyMessageIds("alice", requestId), replyMessageIds("bob", requestId));
  assert.notEqual(replyMessageIds("alice", requestId).user, replyMessageIds("alice", requestId).assistant);
});
test("reply lifecycle does not leave stale processing turns spinning forever", () => {
  assert.equal(replyStatus("processing", new Date(0), 16 * 60_000), "interrupted");
  assert.equal(replyStatus("processing", new Date(0), 60_000), "processing");
  assert.equal(replyStatus("completed", new Date(0), 16 * 60_000), "completed");
});
test("notification copy covers 13 languages with a safe fallback and no private reply text", () => {
  assert.equal(Object.keys(CHAT_REPLY_COPY).length, 13);
  for (const copy of Object.values(CHAT_REPLY_COPY)) { assert.equal(copy.length, 2); assert.ok(copy.every(Boolean)); }
  assert.deepEqual(replyNotificationCopy("unknown"), CHAT_REPLY_COPY.en);
  assert.notDeepEqual(replyNotificationCopy("de"), CHAT_REPLY_COPY.tr);
});
test("unified chat accepts an app language and validates the idempotency ID", () => {
  const parsed = chatkitMessageSchema.parse({ content: "Hello", requestId, experience: "conversation", language: "de" });
  assert.equal(parsed.experience, "conversation");
  assert.equal(parsed.language, "de");
  assert.equal(chatkitMessageSchema.safeParse({ content: "Hello", requestId: "../abc" }).success, false);
});

test("persistent reply lifecycle survives leaving, deduplicates retry, rejects another owner and commits memory", async (t) => {
  const { prisma } = await import("../../lib/prisma");
  const { aiConsentService } = await import("../auth/ai-consent.service");
  const { conversationService } = await import("../conversation/conversation.service");
  const { chatkitService, chatkitInference } = await import("./chatkit.service");
  const { subscriptionService } = await import("../subscription/subscription.service");
  t.after(() => mock.restoreAll());
  const stub = (target: any, key: string, value: (...args: any[]) => any) => {
    const original = target[key];
    target[key] = value;
    t.after(() => { target[key] = original; });
  };
  type Row = { id: string; conversationId: string; role: string; content: string; createdAt: Date; replyStatus: string | null; replyErrorCode?: string | null };
  const rows = new Map<string, Row>();
  let memory: unknown = null;
  const conversation = { id: "conversation-a", userId: "alice", status: "active", persona: null, personaId: null, personaSnapshot: null, personaInsightsEnabled: false, state: { rollingSummary: "Last week's party", factsJson: [], openLoopsJson: [], safetyFlagsJson: {} } };
  stub(prisma.user, "findUnique", async () => ({ plan: "basic", email: "dev@gossipai.test", preferredLanguage: "tr" }));
  mock.method(subscriptionService, "getDailyUsage", async () => ({ count: 0, limit: 10, remaining: 10, plan: "basic", premiumExpiresAt: null }));
  stub(prisma.dailyUsage, "upsert", async () => ({}));
  stub(prisma.dailyUsage, "updateMany", async () => ({ count: 1 }));
  mock.method(aiConsentService, "requireActive", async () => undefined);
  stub(prisma.conversation, "findUnique", async () => conversation);
  stub(prisma.conversation, "findFirst", async ({ where }: any) => where.userId === "alice" ? conversation : null);
  stub(prisma.conversation, "update", async () => conversation);
  stub(prisma, "$queryRaw", async () => [{ id: conversation.id }]);
  stub(prisma, "$transaction", async (callback: any) => callback(prisma));
  stub(prisma.message, "findUnique", async ({ where }: any) => rows.get(where.id) ?? null);
  stub(prisma.message, "findFirst", async ({ where }: any) => {
    if (where.conversation?.userId && where.conversation.userId !== "alice") return null;
    if (where.id) return rows.get(where.id) ?? null;
    return [...rows.values()].find((row) => row.replyStatus === "processing") ?? null;
  });
  stub(prisma.message, "findMany", async () => []);
  stub(prisma.message, "create", async ({ data }: any) => {
    assert.ok(!rows.has(data.id), "message ID must be unique");
    const row = { ...data, createdAt: new Date() }; rows.set(row.id, row); return row;
  });
  stub(prisma.message, "update", async ({ where, data }: any) => {
    const row = { ...rows.get(where.id), ...data } as Row; rows.set(where.id, row); return row;
  });
  stub(prisma.message, "updateMany", async ({ where, data }: any) => {
    const row = rows.get(where.id);
    if (row?.replyStatus !== where.replyStatus) return { count: 0 };
    rows.set(where.id, { ...row, ...data }); return { count: 1 };
  });
  stub(prisma.conversationState, "upsert", async (args: any) => { memory = args.update; return {}; });
  mock.method(conversationService, "get", async () => ({ state: memory }));
  stub(prisma.pushDevice, "findMany", async () => []);
  mock.method(chatkitInference, "remember", async () => ({ rollingSummary: "The party and today's plans", facts: ["Went to a party last week"], openLoops: [] }));
  let finish!: (value: any) => void;
  let started!: () => void;
  const accepted = new Promise<void>((resolve) => { started = resolve; });
  const inference = mock.method(chatkitInference, "reply", async (prompt: string, _history: unknown, mode: string) => {
    assert.match(prompt, /USER_LANGUAGE: de/);
    assert.match(prompt, /Last week's party/);
    assert.equal(mode, "CONVERSATION");
    started();
    return new Promise((resolve) => { finish = resolve; });
  });
  const input = chatkitMessageSchema.parse({ content: "Remember the party?", conversationId: conversation.id, requestId, experience: "conversation", language: "de" });
  const response = chatkitService.sendMessage("alice", input);
  await accepted;
  assert.equal((await chatkitService.replyState("alice", conversation.id, requestId)).status, "processing");
  assert.equal((await chatkitService.replyState("bob", conversation.id, requestId)).status, "not_received");
  await assert.rejects(chatkitService.sendMessage("bob", input), /Conversation not found/);
  await assert.rejects(chatkitService.sendMessage("alice", input), /Reply already accepted/);
  finish({ content: "Yes, you told me about the party.", promptTokens: 5, completionTokens: 5 });
  const result = await response;
  assert.equal(result.assistant.content, "Yes, you told me about the party.");
  assert.equal(rows.size, 2);
  assert.equal((await chatkitService.replyState("alice", conversation.id, requestId)).status, "completed");
  const duplicate = await chatkitService.sendMessage("alice", input);
  assert.equal(duplicate.assistant.id, result.assistant.id);
  assert.equal(inference.mock.calls.length, 1);
  assert.equal((memory as any).rollingSummary, "The party and today's plans");
});
