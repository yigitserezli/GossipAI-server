import { AppError } from "../../shared/errors/app-error";
import { prisma } from "../../lib/prisma";
import { calculatePersonaCharacterAnalysis, isCharacterQuestionId, type CharacterAnswerScore } from "./persona-character-scoring";

const ownedPersona = async (userId: string, personaId: string) => {
  const persona = await prisma.persona.findFirst({ where: { id: personaId, userId }, select: { id: true } });
  if (!persona) throw new AppError("Persona not found.", 404, undefined, "PERSONA_NOT_FOUND", true);
  return persona;
};

const serialize = (analysis: {
  status: string; scoringVersion: string; answeredQuestionCount: number; completedQuestionCount: number;
  dimensionScoresJson: unknown; dimensionConfidencesJson: unknown; primaryTypeId: string | null;
  primaryTypeScore: number | null; primaryTypeCoverage: number | null; secondaryTraitsJson: unknown;
  lastCalculatedAt: Date; answers?: { questionId: string; score: number | null }[];
}) => ({
  status: analysis.status,
  scoringVersion: analysis.scoringVersion,
  answeredQuestionCount: analysis.answeredQuestionCount,
  completedQuestionCount: analysis.completedQuestionCount,
  dimensionScores: analysis.dimensionScoresJson ?? {},
  dimensionConfidences: analysis.dimensionConfidencesJson ?? {},
  primaryTypeId: analysis.primaryTypeId,
  primaryTypeScore: analysis.primaryTypeScore,
  primaryTypeCoverage: analysis.primaryTypeCoverage,
  secondaryTraits: analysis.secondaryTraitsJson ?? [],
  lastCalculatedAt: analysis.lastCalculatedAt.toISOString(),
  ...(analysis.answers ? { answers: analysis.answers.map((answer) => ({ questionId: answer.questionId, score: answer.score })) } : {}),
});

export const personaCharacterAnalysisService = {
  async start(userId: string, personaId: string) {
    await ownedPersona(userId, personaId);
    const analysis = await prisma.personaCharacterAnalysis.upsert({
      where: { personaId },
      create: { personaId },
      update: {},
      include: { answers: { orderBy: { questionId: "asc" } } },
    });
    return serialize(analysis);
  },

  async get(userId: string, personaId: string) {
    await ownedPersona(userId, personaId);
    const analysis = await prisma.personaCharacterAnalysis.findUnique({
      where: { personaId },
      include: { answers: { orderBy: { questionId: "asc" } } },
    });
    return analysis ? serialize(analysis) : null;
  },

  async answer(userId: string, personaId: string, questionId: string, score: CharacterAnswerScore) {
    await ownedPersona(userId, personaId);
    if (!isCharacterQuestionId(questionId)) {
      throw new AppError("Unknown character analysis question.", 400, undefined, "INVALID_CHARACTER_QUESTION", true);
    }
    const analysis = await prisma.$transaction(async (tx) => {
      await tx.personaCharacterAnalysis.upsert({ where: { personaId }, create: { personaId }, update: {} });
      await tx.personaCharacterAnswer.upsert({
        where: { personaId_questionId: { personaId, questionId } },
        create: { personaId, questionId, score },
        update: { score },
      });
      const answers = await tx.personaCharacterAnswer.findMany({ where: { personaId }, orderBy: { questionId: "asc" } });
      const result = calculatePersonaCharacterAnalysis(answers);
      return tx.personaCharacterAnalysis.update({
        where: { personaId },
        data: {
          status: result.status,
          scoringVersion: result.scoringVersion,
          answeredQuestionCount: result.answeredQuestionCount,
          completedQuestionCount: result.completedQuestionCount,
          dimensionScoresJson: result.dimensionScores,
          dimensionConfidencesJson: result.dimensionConfidences,
          primaryTypeId: result.primaryTypeId,
          primaryTypeScore: result.primaryTypeScore,
          primaryTypeCoverage: result.primaryTypeCoverage,
          secondaryTraitsJson: result.secondaryTraits,
          lastCalculatedAt: new Date(),
        },
        include: { answers: { orderBy: { questionId: "asc" } } },
      });
    });
    return serialize(analysis);
  },
};
