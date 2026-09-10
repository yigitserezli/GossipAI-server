import type { Persona, PersonaInsight, Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/app-error";
import { getFirebaseStorageBucket, isFirebaseConfigured } from "../../lib/firebase-admin";
import { prisma } from "../../lib/prisma";
import type { CreatePersonaInput, UpdatePersonaInput } from "./persona.schema";

const MAX_PERSONAS_PER_USER = 5;
const AVATAR_URL_TTL_MS = 60 * 60 * 1000;

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

type PersonaWithInsight = Persona & { insight: PersonaInsight | null; _count?: { conversations: number } };

const asJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

const cleanDataUrl = (value: string) => value.replace(/^data:image\/(?:jpeg|jpg|png);base64,/i, "").trim();

const decodeAvatar = (value: string) => {
  const isPng = /^data:image\/png;base64,/i.test(value) || cleanDataUrl(value).startsWith("iVBOR");
  const isJpeg = /^data:image\/(?:jpeg|jpg);base64,/i.test(value) || cleanDataUrl(value).startsWith("/9j/");
  if (!isPng && !isJpeg) {
    throw new AppError("Avatar must be a JPEG or PNG image.", 400, undefined, "INVALID_AVATAR", true);
  }

  const bytes = Buffer.from(cleanDataUrl(value), "base64");
  if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024) {
    throw new AppError("Avatar image is too large.", 400, undefined, "INVALID_AVATAR", true);
  }

  return { bytes, contentType: isPng ? "image/png" : "image/jpeg", extension: isPng ? "png" : "jpg" };
};

const avatarPathFor = (userId: string, personaId: string, extension: string) =>
  `persona-avatars/${userId}/${personaId}.${extension}`;

const uploadAvatar = async (userId: string, personaId: string, value: string) => {
  if (!isFirebaseConfigured) {
    throw new AppError("Avatar storage is not configured.", 503, undefined, "AVATAR_STORAGE_UNAVAILABLE", true);
  }
  const avatar = decodeAvatar(value);
  const path = avatarPathFor(userId, personaId, avatar.extension);
  const bucket = getFirebaseStorageBucket();
  await bucket.file(path).save(avatar.bytes, {
    resumable: false,
    metadata: { contentType: avatar.contentType, cacheControl: "private, max-age=3600" },
  });
  return path;
};

const deleteAvatar = async (path: string | null) => {
  if (!path || !isFirebaseConfigured) return;
  await getFirebaseStorageBucket().file(path).delete({ ignoreNotFound: true });
};

const avatarUrl = async (path: string | null) => {
  if (!path || !isFirebaseConfigured) return null;
  try {
    const [url] = await getFirebaseStorageBucket().file(path).getSignedUrl({
      action: "read",
      expires: Date.now() + AVATAR_URL_TTL_MS,
    });
    return url;
  } catch {
    return null;
  }
};

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

const toResponse = async (persona: PersonaWithInsight) => ({
  id: persona.id,
  name: persona.name,
  relationshipType: persona.relationshipType,
  avatarEmoji: persona.avatarEmoji,
  avatarUrl: await avatarUrl(persona.avatarStoragePath),
  themeKey: persona.themeKey,
  whoIsThis: persona.whoIsThis,
  thoughtsFeelings: persona.thoughtsFeelings,
  goals: persona.goals,
  currentSituation: persona.currentSituation,
  communicationStyle: persona.communicationStyle,
  insight: toInsight(persona.insight),
  conversationCount: persona._count?.conversations ?? 0,
  createdAt: persona.createdAt.toISOString(),
  updatedAt: persona.updatedAt.toISOString(),
});

const findOwned = async (userId: string, personaId: string) => {
  const persona = await prisma.persona.findFirst({
    where: { id: personaId, userId },
    include: { insight: true, _count: { select: { conversations: true } } },
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
      include: { insight: true, _count: { select: { conversations: true } } },
    });
    return Promise.all(personas.map(toResponse));
  },

  async get(userId: string, personaId: string) {
    return toResponse(await findOwned(userId, personaId));
  },

  async getContext(userId: string, personaId: string) {
    const persona = await findOwned(userId, personaId);
    return this.toSnapshot(persona);
  },

  async create(userId: string, input: CreatePersonaInput) {
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
          ...inputFields(input),
        },
        include: { insight: true, _count: { select: { conversations: true } } },
      });
    });

    if (input.avatarImageBase64) {
      try {
        const avatarStoragePath = await uploadAvatar(userId, persona.id, input.avatarImageBase64);
        const updated = await prisma.persona.update({
          where: { id: persona.id },
          data: { avatarStoragePath },
          include: { insight: true, _count: { select: { conversations: true } } },
        });
        return toResponse(updated);
      } catch (error) {
        await prisma.persona.delete({ where: { id: persona.id } }).catch(() => undefined);
        throw error;
      }
    }

    return toResponse(persona);
  },

  async update(userId: string, personaId: string, input: UpdatePersonaInput) {
    const existing = await findOwned(userId, personaId);
    let nextAvatarStoragePath = existing.avatarStoragePath;
    if (input.avatarImageBase64) {
      nextAvatarStoragePath = await uploadAvatar(userId, personaId, input.avatarImageBase64);
    } else if (input.removeAvatarImage) {
      nextAvatarStoragePath = null;
    }

    const updated = await prisma.persona.update({
      where: { id: personaId },
      data: { ...inputFields(input), avatarEmoji: input.avatarEmoji, avatarStoragePath: nextAvatarStoragePath },
      include: { insight: true, _count: { select: { conversations: true } } },
    });
    if (input.removeAvatarImage && existing.avatarStoragePath) {
      await deleteAvatar(existing.avatarStoragePath).catch(() => undefined);
    }
    return toResponse(updated);
  },

  async remove(userId: string, personaId: string) {
    const persona = await findOwned(userId, personaId);
    await prisma.persona.delete({ where: { id: persona.id } });
    await deleteAvatar(persona.avatarStoragePath).catch(() => undefined);
  },

  asJson(snapshot: PersonaContextSnapshot) {
    return asJson(snapshot);
  },
};
