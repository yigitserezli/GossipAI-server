import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { mock } from "node:test";
import { ensureTestEnv } from "../src/test/test-env";

// Explicitly opt into a disposable local DB; never use the app's .env database.
const database = new URL(process.env.DATABASE_URL ?? "https://invalid");
assert.ok(["localhost", "127.0.0.1"].includes(database.hostname));
assert.ok(database.pathname.startsWith("/gossipai_chat_schema_"));
ensureTestEnv();

test("real Postgres: accepted reply, concurrent duplicate, restart-style retrieval, retry and cursor history", async (t) => {
  const { prisma } = await import("../src/lib/prisma");
  const { chatkitService, chatkitInference } = await import("../src/features/chatkit/chatkit.service");
  const { aiConsentService } = await import("../src/features/auth/ai-consent.service");
  const { chatkitMessageSchema } = await import("../src/features/chatkit/chatkit.schema");
  const { replyMessageIds } = await import("../src/features/chatkit/chat-reply.domain");
  const user = await prisma.user.create({ data: { name: "Chat integration fixture", email: `chat-test-${randomUUID()}@example.test` } });
  t.after(async () => { mock.restoreAll(); await prisma.user.delete({ where: { id: user.id } }); await prisma.$disconnect(); });
  mock.method(aiConsentService, "requireActive", async () => undefined);
  mock.method(chatkitInference, "remember", async () => ({ rollingSummary: "Remember last week's party.", facts: ["Party last week"], openLoops: [] }));
  const input = chatkitMessageSchema.parse({ requestId: randomUUID(), conversationId: randomUUID(), newConversation: true, experience: "conversation", content: "Hello", language: "de" });
  let finish!: () => void;
  let signal!: () => void;
  let accepted = new Promise<void>((resolve) => { signal = resolve; });
  const reply = mock.method(chatkitInference, "reply", async () => {
    signal();
    await new Promise<void>((resolve) => { finish = resolve; });
    return { content: "Hallo!", promptTokens: 1, completionTokens: 1 };
  });
  const sending = chatkitService.sendMessage(user.id, input);
  await accepted;
  assert.equal((await chatkitService.replyState(user.id, input.conversationId!, input.requestId!)).status, "processing");
  await assert.rejects(chatkitService.sendMessage(user.id, input), /already accepted/);
  finish();
  const response = await sending;
  assert.equal(response.assistant.content, "Hallo!");
  assert.equal((await chatkitService.replyState(user.id, input.conversationId!, input.requestId!)).status, "completed");
  assert.equal(await prisma.message.count({ where: { conversationId: input.conversationId } }), 2);
  assert.equal((await prisma.dailyUsage.findFirst({ where: { userId: user.id } }))?.count, 1);
  assert.equal((await prisma.conversationState.findUnique({ where: { conversationId: input.conversationId! } }))?.rollingSummary, "Remember last week's party.");
  const repeated = await chatkitService.sendMessage(user.id, input);
  assert.equal(repeated.assistant.id, response.assistant.id);
  assert.equal(reply.mock.calls.length, 1);

  const retryInput = { ...input, requestId: randomUUID(), content: "Second turn", newConversation: false };
  reply.mock.mockImplementation(async () => { throw new Error("Synthetic provider failure"); });
  await assert.rejects(chatkitService.sendMessage(user.id, retryInput));
  assert.equal((await chatkitService.replyState(user.id, input.conversationId!, retryInput.requestId)).status, "failed");
  reply.mock.mockImplementation(async () => ({ content: "Recovered", promptTokens: 1, completionTokens: 1 }));
  await chatkitService.sendMessage(user.id, retryInput);
  assert.equal(await prisma.message.count({ where: { conversationId: input.conversationId } }), 4);
  assert.equal((await prisma.dailyUsage.findFirst({ where: { userId: user.id } }))?.count, 2, "retry must not spend quota twice");

  // A process interruption is detected from persisted state, not in-memory flags.
  const interruptedId = randomUUID();
  await prisma.message.create({ data: { id: replyMessageIds(user.id, interruptedId).user, conversationId: input.conversationId!, role: "user", content: "Interrupted", replyStatus: "processing", createdAt: new Date(Date.now() - 16 * 60_000) } });
  assert.equal((await chatkitService.replyState(user.id, input.conversationId!, interruptedId)).status, "interrupted");
  assert.equal((await chatkitService.replyState(user.id, input.conversationId!, interruptedId)).status, "failed");

  await prisma.message.createMany({ data: Array.from({ length: 105 }, (_, index) => ({ conversationId: input.conversationId!, role: "user" as const, content: `History ${index}`, createdAt: new Date(1_700_000_000_000 + index) })) });
  const seen = new Set<string>();
  let cursor: string | null = null;
  do {
    const page = await chatkitService.listMessages(user.id, input.conversationId!, cursor ?? undefined);
    assert.ok(page.messages.length <= 50);
    for (const message of page.messages) { assert.ok(!seen.has(message.id), "overlapping history page"); seen.add(message.id); }
    cursor = page.nextCursor;
  } while (cursor);
  assert.equal(seen.size, 110);
  await assert.rejects(chatkitService.listMessages("wrong-owner", input.conversationId!), /not found/);

  // Deleting a conversation while inference runs cannot resurrect it.
  const deleteInput = { ...input, conversationId: randomUUID(), requestId: randomUUID() };
  accepted = new Promise<void>((resolve) => { signal = resolve; });
  reply.mock.mockImplementation(async () => { signal(); await new Promise<void>((resolve) => { finish = resolve; }); return { content: "Late", promptTokens: 1, completionTokens: 1 }; });
  const deleted = chatkitService.sendMessage(user.id, deleteInput);
  await accepted;
  await prisma.conversation.delete({ where: { id: deleteInput.conversationId } });
  finish();
  await assert.rejects(deleted, /not active/);
  assert.equal(await prisma.message.count({ where: { conversationId: deleteInput.conversationId } }), 0);
});
