import assert from "node:assert/strict";
import test from "node:test";
import { runPersonaAgent } from "./persona-agent.client";
import { buildPersonaInsightAgentPayload } from "./persona-insight.contract";

const agentId = "agent_test";
const payload = buildPersonaInsightAgentPayload({ language: "tr", persona: { name: "Deniz", relationshipType: "friend", whoIsThis: null, thoughtsFeelings: null, goals: null, currentSituation: null, communicationStyle: null }, characterAnalysis: null, whatsappSummaries: [], optedInConversationMemory: [], selectedConversation: null });
const output = { summary: "Henüz yeterli bilgi yok.", confidence: 0, communicationStyle: null, greenFlags: [], redFlags: [], relationshipNarrative: "Bu ilk okuma sınırlı bilgiye dayanıyor." };
const events = (text: string, complete = true) => [
  { type: "agent.session.created", session: { id: "session" } },
  { type: "agent.session.turn.in_progress", turn: { id: "turn", subagent_id: null } },
  { type: "agent.session.turn.item.done", turn_id: "turn", item: { id: "message", type: "message", role: "assistant", phase: "final_answer", status: "completed", content: [{ type: "output_text", text }] } },
  ...(complete ? [{ type: "agent.session.turn.completed", session_id: "session", turn: { id: "turn", agent_id: agentId, subagent_id: null, status: "completed" } }] : []),
];
const fetchEvents = (items: unknown[], inspect?: (body: any) => void): typeof fetch => async (_url, init) => {
  inspect?.(JSON.parse(String(init?.body)));
  const encoded = new TextEncoder().encode(items.map((event) => `data: ${JSON.stringify(event)}\r\n\r\n`).join(""));
  let offset = 0;
  return new Response(new ReadableStream({ pull(controller) {
    // Includes split Unicode code points and CRLF boundaries.
    if (offset >= encoded.length) return controller.close();
    controller.enqueue(encoded.slice(offset, offset += 7));
  } }), { headers: { "Content-Type": "text/event-stream" } });
};

test("uses the saved agent and validates complete streamed JSON, including chunked Unicode", async () => {
  const result = await runPersonaAgent(payload, { apiKey: "test", agentId, fetch: fetchEvents(events(JSON.stringify(output)), (body) => {
    assert.equal(body.agent_id, agentId);
    assert.equal(body.agent.instructions, undefined);
    assert.equal(body.agent.model, undefined);
    assert.equal(body.agent.text.format.type, "json_schema");
    assert.equal(body.agent.text.format.schema.additionalProperties, false);
    assert.deepEqual(JSON.parse(body.input), payload);
  }) });
  assert.deepEqual(result, output);
});

test("does not accept a partial turn even if its JSON is valid", async () => {
  await assert.rejects(runPersonaAgent(payload, { apiKey: "test", agentId, fetch: fetchEvents(events(JSON.stringify(output), false)) }), /invalid result/);
});

test("rejects wrong types, extra fields, markdown and non-paragraph output", async () => {
  for (const text of [JSON.stringify({ ...output, confidence: "15" }), JSON.stringify({ ...output, extra: true }), '```json\n' + JSON.stringify(output) + '\n```', JSON.stringify({ ...output, relationshipNarrative: "First\nSecond" }), JSON.stringify({ ...output, greenFlags: Array(6).fill("Signal") })]) {
    await assert.rejects(runPersonaAgent(payload, { apiKey: "test", agentId, fetch: fetchEvents(events(text)) }), /invalid result/);
  }
});

test("rejects agent failures, wrong agent and non-successful HTTP responses", async () => {
  const wrongAgent = events(JSON.stringify(output));
  (wrongAgent.at(-1) as any).turn.agent_id = "another-agent";
  for (const items of [[{ type: "agent.session.turn.failed" }], wrongAgent]) {
    await assert.rejects(runPersonaAgent(payload, { apiKey: "test", agentId, fetch: fetchEvents(items) }), /invalid result/);
  }
  await assert.rejects(runPersonaAgent(payload, { apiKey: "test", agentId, fetch: async () => new Response("", { status: 403 }) }), /unavailable/);
});
