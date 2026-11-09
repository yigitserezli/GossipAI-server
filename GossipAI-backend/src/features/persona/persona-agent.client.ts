import { z } from "zod";
import { AppError } from "../../shared/errors/app-error";
import { personaInsightOutputSchema, type PersonaInsightAgentPayload } from "./persona-insight.contract";

const invalidResult = () => new AppError("Persona insight generation returned an invalid result.", 502, undefined, "PERSONA_INSIGHT_INVALID", true);

// Saved agent instructions/model are inherited. Only the response shape is constrained.
export async function runStructuredPersonaAgent<T>(
  payload: unknown,
  config: { apiKey: string; agentId: string; fetch?: typeof fetch },
  outputSchema: z.ZodType<T>,
) {
  const schema = z.toJSONSchema(outputSchema);
  const response = await (config.fetch ?? fetch)("https://api.openai.com/v1/agents/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "OpenAI-Beta": "agents=v1", "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_id: config.agentId,
      agent: { text: { format: { type: "json_schema", schema } } },
      environment: { type: "none" },
      input: JSON.stringify(payload),
      stream: true,
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok || !response.body) {
    throw new AppError("Persona agent is unavailable.", 502, undefined, "PERSONA_AGENT_UNAVAILABLE", true);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sessionId: string | undefined;
  let turnId: string | undefined;
  const messages = new Map<string, string>();
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      if (buffer.length > 1_000_000) throw invalidResult();
      let boundary: RegExpExecArray | null;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        const data = frame.split(/\r?\n/).filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart()).join("\n");
        if (!data || data === "[DONE]") continue;
        const event = JSON.parse(data);
        if (event.type === "agent.session.created") sessionId = event.session?.id;
        if (event.type === "agent.session.turn.in_progress" && event.turn?.subagent_id == null) {
          turnId = event.turn?.id;
        }
        if (event.type === "error" || event.type?.endsWith(".failed") || event.type?.endsWith(".cancelled")) throw invalidResult();
        if (event.type === "agent.session.turn.item.done" && event.turn_id === turnId &&
            event.item?.type === "message" && event.item.role === "assistant" && event.item.phase === "final_answer") {
          if (event.item.status !== "completed" || !Array.isArray(event.item.content) ||
              event.item.content.some((part: { type: string }) => part.type !== "output_text")) throw invalidResult();
          messages.set(event.item.id, event.item.content.map((part: { text: string }) => part.text).join(""));
        }
        if (event.type === "agent.session.turn.completed" && event.turn?.subagent_id == null) {
          if (!sessionId || event.session_id !== sessionId || !turnId || event.turn?.id !== turnId ||
              event.turn.agent_id !== config.agentId || event.turn.status !== "completed" || messages.size !== 1) throw invalidResult();
          const output = outputSchema.parse(JSON.parse([...messages.values()][0]));
          if (output && typeof output === "object" && "relationshipNarrative" in output && typeof output.relationshipNarrative === "string" && /[\r\n]/.test(output.relationshipNarrative)) throw invalidResult();
          return output;
        }
      }
    }
    throw invalidResult();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw invalidResult();
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export const runPersonaAgent = (payload: PersonaInsightAgentPayload, config: { apiKey: string; agentId: string; fetch?: typeof fetch }) =>
  runStructuredPersonaAgent(payload, config, personaInsightOutputSchema);
