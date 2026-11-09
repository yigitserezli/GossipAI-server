import { prisma } from "../../lib/prisma";
import { whatsappMemorySchema } from "./whatsapp-analysis.contract";

export const whatsappMemoryRepository = {
  async get(userId: string, personaId: string) {
    const insight = await prisma.personaInsight.findFirst({
      where: { personaId, persona: { userId } },
      select: { personaMemoryJson: true, narrativeUpdatedAt: true },
    });
    const memory = whatsappMemorySchema.safeParse(insight?.personaMemoryJson);
    return memory.success ? { sourceType: "derived_whatsapp_analysis", updatedAt: insight?.narrativeUpdatedAt?.toISOString() ?? null, ...memory.data } : null;
  },
};
