import type { Persona, PersonaCharacterAnalysis, PersonaInsight, Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/app-error";
import { prisma } from "../../lib/prisma";
import type { CreatePersonaInput, UpdatePersonaInput } from "./persona.schema";
import { r2AvatarService } from "./r2-avatar.service";

const MAX_PERSONAS_PER_USER = 5;

export type PersonaContextSnapshot = {
  id: string;
  name: string;
  relationshipType: string;
  whoIsThis: string | null;
  thoughtsFeelings: string | null;
  goals: string | null;
  currentSituation: string | null;
  communicationStyle: string | null;
};

type PersonaWithInsight = Persona & { insight: PersonaInsight | null; characterAnalysis: PersonaCharacterAnalysis | null; _count?: { conversations: number } };

const asJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

const toInsight = (insight: PersonaInsight | null) =>
  insight
    ? {
        summary: insight.summary,
        confidence: insight.confidence,
        communicationStyle: insight.communicationStyle,
        greenFlags: Array.isArray(insight.greenFlagsJson) ? insight.greenFlagsJson : [],
        redFlags: Array.isArray(insight.redFlagsJson) ? insight.redFlagsJson : [],
        lastMessageExcerpt: insight.lastMessageExcerpt,
        lastAnalyzedConversationId: insight.lastAnalyzedConversationId,
        updatedAt: insight.updatedAt.toISOString(),
      }
    : null;

const toCharacterAnalysis = (analysis: PersonaCharacterAnalysis | null) =>
  analysis
    ? {
        status: analysis.status,
        scoringVersion: analysis.scoringVersion,
        answeredQuestionCount: analysis.answeredQuestionCount,
        completedQuestionCount: analysis.completedQuestionCount,
        primaryTypeId: analysis.primaryTypeId,
        primaryTypeScore: analysis.primaryTypeScore,
        primaryTypeCoverage: analysis.primaryTypeCoverage,
        secondaryTraits: analysis.secondaryTraitsJson ?? [],
        lastCalculatedAt: analysis.lastCalculatedAt.toISOString(),
      }
    : null;

const toResponse = (persona: PersonaWithInsight) => ({
  id: persona.id,
  name: persona.name,
  relationshipType: persona.relationshipType,
  avatarEmoji: persona.avatarEmoji,
  avatarUrl: persona.avatarUrl,
  themeKey: persona.themeKey,
  whoIsThis: persona.whoIsThis,
  thoughtsFeelings: persona.thoughtsFeelings,
  goals: persona.goals,
  currentSituation: persona.currentSituation,
  communicationStyle: persona.communicationStyle,
  insight: toInsight(persona.insight),
  characterAnalysis: toCharacterAnalysis(persona.characterAnalysis),
  conversationCount: persona._count?.conversations ?? 0,
  createdAt: persona.createdAt.toISOString(),
  updatedAt: persona.updatedAt.toISOString(),
});

const findOwned = async (userId: string, personaId: string) => {
  const persona = await prisma.persona.findFirst({
    where: { id: personaId, userId },
    include: { insight: true, characterAnalysis: true, _count: { select: { conversations: true } } },
  });
  if (!persona) throw new AppError("Persona not found.", 404, undefined, "PERSONA_NOT_FOUND", true);
  return persona;
};

const inputFields = (input: CreatePersonaInput | UpdatePersonaInput) => ({
  ...(input.name !== undefined ? { name: input.name } : {}),
  ...(input.relationshipType !== undefined ? { relationshipType: input.relationshipType } : {}),
  ...(input.themeKey !== undefined ? { themeKey: input.themeKey } : {}),
  ...(input.whoIsThis !== undefined ? { whoIsThis: input.whoIsThis } : {}),
  ...(input.thoughtsFeelings !== undefined ? { thoughtsFeelings: input.thoughtsFeelings } : {}),
  ...(input.goals !== undefined ? { goals: input.goals } : {}),
  ...(input.currentSituation !== undefined ? { currentSituation: input.currentSituation } : {}),
  ...(input.communicationStyle !== undefined ? { communicationStyle: input.communicationStyle } : {}),
});

const validateAvatarInput = (userId: string, input: CreatePersonaInput | UpdatePersonaInput) => {
  if ((input.avatarUrl && !input.avatarObjectKey) || (!input.avatarUrl && input.avatarObjectKey)) {
    throw new AppError("Avatar URL and object key must be provided together.", 400, undefined, "INVALID_AVATAR", true);
  }
  if (input.avatarUrl && input.avatarObjectKey && !r2AvatarService.isOwnedPublicObject(userId, input.avatarObjectKey, input.avatarUrl)) {
    throw new AppError("Avatar does not belong to this user.", 403, undefined, "INVALID_AVATAR", true);
  }
};

export const personaService = {
  maxPerUser: MAX_PERSONAS_PER_USER,

  toSnapshot(persona: Persona): PersonaContextSnapshot {
    return {
      id: persona.id,
      name: persona.name,
      relationshipType: persona.relationshipType,
      whoIsThis: persona.whoIsThis,
      thoughtsFeelings: persona.thoughtsFeelings,
      goals: persona.goals,
      currentSituation: persona.currentSituation,
      communicationStyle: persona.communicationStyle,
    };
  },

  async list(userId: string) {
    const personas = await prisma.persona.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: { insight: true, characterAnalysis: true, _count: { select: { conversations: true } } },
    });
    return personas.map(toResponse);
  },

  async get(userId: string, personaId: string) {
    return toResponse(await findOwned(userId, personaId));
  },

  async getContext(userId: string, personaId: string) {
    const persona = await findOwned(userId, personaId);
    return this.toSnapshot(persona);
  },

  async create(userId: string, input: CreatePersonaInput) {
    validateAvatarInput(userId, input);
    const persona = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
      const count = await tx.persona.count({ where: { userId } });
      if (count >= MAX_PERSONAS_PER_USER) {
        throw new AppError("You can create up to 5 personas.", 409, { max: MAX_PERSONAS_PER_USER }, "PERSONA_LIMIT_REACHED", true);
      }
      return tx.persona.create({
        data: {
          userId,
          name: input.name,
          relationshipType: input.relationshipType,
          themeKey: input.themeKey,
          avatarEmoji: input.avatarEmoji,
          avatarUrl: input.avatarUrl,
          avatarObjectKey: input.avatarObjectKey,
          ...inputFields(input),
        },
        include: { insight: true, characterAnalysis: true, _count: { select: { conversations: true } } },
      });
    });

    return toResponse(persona);
  },

  async update(userId: string, personaId: string, input: UpdatePersonaInput) {
    const existing = await findOwned(userId, personaId);
    const hasNewAvatar = Boolean(input.avatarUrl || input.avatarObjectKey);
    validateAvatarInput(userId, input);

    const updated = await prisma.persona.update({
      where: { id: personaId },
      data: {
        ...inputFields(input),
        ...(input.avatarEmoji !== undefined ? { avatarEmoji: input.avatarEmoji } : {}),
        ...(hasNewAvatar ? { avatarUrl: input.avatarUrl, avatarObjectKey: input.avatarObjectKey } : {}),
        ...(input.removeAvatar ? { avatarUrl: null, avatarObjectKey: null } : {}),
      },
      include: { insight: true, characterAnalysis: true, _count: { select: { conversations: true } } },
    });
    if ((input.removeAvatar || hasNewAvatar) && existing.avatarObjectKey) {
      await r2AvatarService.delete(existing.avatarObjectKey).catch(() => undefined);
    }
    return toResponse(updated);
  },

  async remove(userId: string, personaId: string) {
    const persona = await findOwned(userId, personaId);
    await prisma.persona.delete({ where: { id: persona.id } });
    await r2AvatarService.delete(persona.avatarObjectKey).catch(() => undefined);
  },

  asJson(snapshot: PersonaContextSnapshot) {
    return asJson(snapshot);
  },
};
