export const PERSONA_CHARACTER_SCORING_VERSION = "persona-character-v1";

export const CHARACTER_DIMENSIONS = ["EO", "CO", "EM", "DI", "CE", "IN", "IT", "ST", "BR", "VN"] as const;
export type CharacterDimension = (typeof CHARACTER_DIMENSIONS)[number];
export type CharacterAnswerScore = 0 | 25 | 50 | 75 | 100 | null;
export type CharacterAnalysisStatus = "in_progress" | "insufficient_confidence" | "complete";

type QuestionDefinition = { id: string; dimension: CharacterDimension; reverse?: boolean };
type Target = "H" | "M" | "L";
type ArchetypeDefinition = { id: string; priority: number; matrix: Partial<Record<CharacterDimension, [Target, 1 | 2]>> };
type TraitDefinition = { high: string; low: string };

export const CHARACTER_QUESTION_DEFINITIONS: QuestionDefinition[] = [
  { id: "Q01", dimension: "EO" }, { id: "Q02", dimension: "EO" }, { id: "Q03", dimension: "EO", reverse: true }, { id: "Q04", dimension: "EO" },
  { id: "Q05", dimension: "CO" }, { id: "Q06", dimension: "CO" }, { id: "Q07", dimension: "CO", reverse: true }, { id: "Q08", dimension: "CO" },
  { id: "Q09", dimension: "EM" }, { id: "Q10", dimension: "EM" }, { id: "Q11", dimension: "EM", reverse: true }, { id: "Q12", dimension: "EM" },
  { id: "Q13", dimension: "DI" }, { id: "Q14", dimension: "DI", reverse: true }, { id: "Q15", dimension: "DI" }, { id: "Q16", dimension: "DI", reverse: true },
  { id: "Q17", dimension: "CE" }, { id: "Q18", dimension: "CE" }, { id: "Q19", dimension: "CE", reverse: true }, { id: "Q20", dimension: "CE" },
  { id: "Q21", dimension: "IN" }, { id: "Q22", dimension: "IN" }, { id: "Q23", dimension: "IN" }, { id: "Q24", dimension: "IN", reverse: true },
  { id: "Q25", dimension: "IT" }, { id: "Q26", dimension: "IT" }, { id: "Q27", dimension: "IT", reverse: true }, { id: "Q28", dimension: "IT" },
  { id: "Q29", dimension: "ST" }, { id: "Q30", dimension: "ST", reverse: true }, { id: "Q31", dimension: "ST" }, { id: "Q32", dimension: "ST", reverse: true },
  { id: "Q33", dimension: "BR" }, { id: "Q34", dimension: "BR" }, { id: "Q35", dimension: "BR", reverse: true }, { id: "Q36", dimension: "BR" },
  { id: "Q37", dimension: "VN" }, { id: "Q38", dimension: "VN" }, { id: "Q39", dimension: "VN", reverse: true }, { id: "Q40", dimension: "VN" },
];

const archetypes: ArchetypeDefinition[] = [
  { id: "open_book", priority: 0, matrix: { EO: ["H", 2], CO: ["H", 1], DI: ["H", 2], CE: ["H", 1], ST: ["H", 1] } },
  { id: "hard_to_read", priority: 10, matrix: { EO: ["L", 2], DI: ["L", 2], CE: ["L", 1], IT: ["L", 1] } },
  { id: "lowkey_loyal", priority: 3, matrix: { EO: ["M", 1], CO: ["H", 2], EM: ["H", 1], ST: ["H", 1], BR: ["H", 2] } },
  { id: "hot_and_cold", priority: 11, matrix: { EO: ["M", 1], CO: ["L", 2], IT: ["H", 1], ST: ["L", 2], VN: ["H", 1] } },
  { id: "straight_shooter", priority: 1, matrix: { EO: ["H", 1], DI: ["H", 2], CE: ["H", 2], ST: ["H", 1], BR: ["H", 1] } },
  { id: "peace_keeper", priority: 6, matrix: { EM: ["H", 1], DI: ["M", 1], CE: ["L", 2], ST: ["H", 1], BR: ["H", 1] } },
  { id: "soft_heart", priority: 2, matrix: { EO: ["H", 2], CO: ["H", 1], EM: ["H", 2], BR: ["H", 1] } },
  { id: "slow_burner", priority: 4, matrix: { EO: ["L", 1], CO: ["H", 2], IN: ["H", 1], IT: ["L", 2], ST: ["H", 1], BR: ["H", 1] } },
  { id: "independent_soul", priority: 5, matrix: { CO: ["H", 1], IN: ["H", 2], ST: ["H", 1], BR: ["H", 1], VN: ["L", 2] } },
  { id: "free_spirit", priority: 8, matrix: { CO: ["L", 1], DI: ["M", 1], IN: ["H", 2], IT: ["H", 2], ST: ["M", 1], VN: ["L", 1] } },
  { id: "main_character_energy", priority: 9, matrix: { EO: ["H", 1], DI: ["H", 1], IN: ["M", 1], IT: ["H", 2], ST: ["M", 1], VN: ["H", 2] } },
  { id: "the_challenger", priority: 7, matrix: { EM: ["M", 1], DI: ["H", 2], CE: ["H", 2], IT: ["H", 1], ST: ["H", 1], BR: ["M", 1] } },
];

const traits: Record<CharacterDimension, TraitDefinition> = {
  EO: { high: "heart_on_sleeve", low: "guarded" }, CO: { high: "reliable_energy", low: "mixed_energy" }, EM: { high: "emotion_reader", low: "head_over_heart" },
  DI: { high: "no_mixed_signals", low: "speaks_in_subtext" }, CE: { high: "faces_it", low: "avoids_the_heat" }, IN: { high: "needs_their_space", low: "closeness_first" },
  IT: { high: "makes_the_first_move", low: "waits_for_a_sign" }, ST: { high: "cool_under_pressure", low: "mood_led" }, BR: { high: "boundary_safe", low: "tests_limits" }, VN: { high: "needs_reassurance", low: "self_secure" },
};

const targetValue: Record<Target, number> = { H: 85, M: 50, L: 15 };
const questionById = new Map(CHARACTER_QUESTION_DEFINITIONS.map((question) => [question.id, question]));

export const isCharacterQuestionId = (value: string) => questionById.has(value);

export type CharacterAnalysisResult = {
  status: CharacterAnalysisStatus;
  scoringVersion: string;
  answeredQuestionCount: number;
  completedQuestionCount: number;
  dimensionScores: Record<CharacterDimension, number | null>;
  dimensionConfidences: Record<CharacterDimension, number>;
  primaryTypeId: string | null;
  primaryTypeScore: number | null;
  primaryTypeCoverage: number | null;
  secondaryTraits: { id: string; strength: number }[];
};

export const calculatePersonaCharacterAnalysis = (rawAnswers: { questionId: string; score: number | null }[]): CharacterAnalysisResult => {
  const answers = new Map(rawAnswers.filter((answer) => isCharacterQuestionId(answer.questionId)).map((answer) => [answer.questionId, answer.score]));
  const dimensionScores = {} as Record<CharacterDimension, number | null>;
  const dimensionConfidences = {} as Record<CharacterDimension, number>;

  for (const dimension of CHARACTER_DIMENSIONS) {
    const values = CHARACTER_QUESTION_DEFINITIONS
      .filter((question) => question.dimension === dimension)
      .map((question) => ({ question, score: answers.get(question.id) }))
      .filter((entry): entry is { question: QuestionDefinition; score: number } => typeof entry.score === "number")
      .map(({ question, score }) => question.reverse ? 100 - score : score);
    dimensionConfidences[dimension] = values.length / 4;
    dimensionScores[dimension] = values.length >= 2 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }

  const answeredQuestionCount = [...answers.values()].filter((score) => typeof score === "number").length;
  const completedQuestionCount = answers.size;
  const ranked = archetypes.map((archetype) => {
    let weightedTotal = 0;
    let confidenceWeight = 0;
    let maxWeight = 0;
    for (const [dimension, [target, weight]] of Object.entries(archetype.matrix) as [CharacterDimension, [Target, 1 | 2]][]) {
      maxWeight += weight;
      const confidence = dimensionConfidences[dimension];
      const score = dimensionScores[dimension];
      if (score === null || confidence === 0) continue;
      weightedTotal += (1 - Math.abs(score - targetValue[target]) / 100) * weight * confidence;
      confidenceWeight += weight * confidence;
    }
    return { ...archetype, score: confidenceWeight ? 100 * weightedTotal / confidenceWeight : 0, coverage: maxWeight ? confidenceWeight / maxWeight : 0 };
  }).sort((left, right) => Math.abs(right.score - left.score) < 0.01 ? left.priority - right.priority : right.score - left.score);

  const winner = ranked[0];
  const eligible = answeredQuestionCount >= 24 && winner.coverage >= 0.65 && winner.score >= 68;
  const secondaryTraits = CHARACTER_DIMENSIONS
    .flatMap((dimension) => {
      const score = dimensionScores[dimension];
      const confidence = dimensionConfidences[dimension];
      if (score === null || confidence < 0.75 || (score < 72 && score > 28)) return [];
      return [{ id: score >= 72 ? traits[dimension].high : traits[dimension].low, strength: Math.abs(score - 50) * 2 * confidence }];
    })
    .sort((left, right) => right.strength - left.strength || left.id.localeCompare(right.id))
    .slice(0, 3);

  return {
    status: eligible ? "complete" : answeredQuestionCount || completedQuestionCount ? "insufficient_confidence" : "in_progress",
    scoringVersion: PERSONA_CHARACTER_SCORING_VERSION,
    answeredQuestionCount,
    completedQuestionCount,
    dimensionScores,
    dimensionConfidences,
    primaryTypeId: eligible ? winner.id : null,
    primaryTypeScore: eligible ? winner.score : null,
    primaryTypeCoverage: eligible ? winner.coverage : null,
    secondaryTraits,
  };
};
