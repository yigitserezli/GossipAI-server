import { prisma } from "../../lib/prisma";

// ConversationState is durable storage linked to the persona through Conversation.
// Read permitted source memories directly so revoking/deleting a source takes effect
// immediately and AI interpretations never become a new independent fact source.
export const personaMemoryService = {
  async list(userId: string, personaId: string, excludeConversationId?: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId, personaId, personaInsightsEnabled: true, status: { not: "deleted" },
        ...(excludeConversationId ? { id: { not: excludeConversationId } } : {}),
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      select: { id: true, state: { select: { rollingSummary: true, factsJson: true, openLoopsJson: true, updatedAt: true } } },
    });
    return conversations.flatMap(({ id, state }) => {
      if (!state || (!state.rollingSummary.trim() &&
          !(Array.isArray(state.factsJson) && state.factsJson.length) &&
          !(Array.isArray(state.openLoopsJson) && state.openLoopsJson.length))) return [];
      return [{
        sourceConversationId: id,
        sourceType: "derived_conversation_memory",
        updatedAt: state.updatedAt.toISOString(),
        rollingSummary: state.rollingSummary,
        factsJson: state.factsJson,
        openLoopsJson: state.openLoopsJson,
      }];
    });
  },
};
