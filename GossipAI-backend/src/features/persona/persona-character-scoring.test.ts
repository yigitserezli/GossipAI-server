import assert from "node:assert/strict";
import test from "node:test";
import { CHARACTER_QUESTION_DEFINITIONS, CORE_CHARACTER_QUESTION_DEFINITIONS, DEEPEN_CHARACTER_QUESTION_DEFINITIONS, calculatePersonaCharacterAnalysis } from "./persona-character-scoring";

const all = (score: number) => CHARACTER_QUESTION_DEFINITIONS.map((question) => ({ questionId: question.id, score: question.reverse ? 100 - score : score }));

test("calculates dimensions using normalized reverse-scored answers", () => {
  const result = calculatePersonaCharacterAnalysis([
    { questionId: "Q01", score: 100 }, { questionId: "Q02", score: 75 }, { questionId: "Q03", score: 0 }, { questionId: "Q04", score: 50 },
  ]);
  assert.equal(result.dimensionScores.EO, 81.25);
  assert.equal(result.dimensionConfidences.EO, 1);
});

test("does not score I don't know answers and needs two numeric answers", () => {
  const result = calculatePersonaCharacterAnalysis([
    { questionId: "Q01", score: 100 }, { questionId: "Q02", score: null }, { questionId: "Q03", score: null }, { questionId: "Q04", score: null },
  ]);
  assert.equal(result.answeredQuestionCount, 1);
  assert.equal(result.completedQuestionCount, 4);
  assert.equal(result.dimensionScores.EO, null);
  assert.equal(result.dimensionConfidences.EO, 0.25);
});

test("returns an eligible deterministic primary type with stable secondary traits", () => {
  const result = calculatePersonaCharacterAnalysis(all(15));
  assert.equal(result.status, "complete");
  assert.equal(result.primaryTypeId, "hard_to_read");
  assert.ok((result.primaryTypeScore ?? 0) >= 68);
  assert.ok(result.secondaryTraits.length <= 3);
  assert.deepEqual(result, calculatePersonaCharacterAnalysis(all(15)));
});

test("produces a result after the 20 core questions without requiring the optional deepening questions", () => {
  const result = calculatePersonaCharacterAnalysis(all(15).filter((answer) => CORE_CHARACTER_QUESTION_DEFINITIONS.some((question) => question.id === answer.questionId)));
  assert.equal(CORE_CHARACTER_QUESTION_DEFINITIONS.length, 20);
  assert.equal(DEEPEN_CHARACTER_QUESTION_DEFINITIONS.length, 20);
  assert.equal(result.completedQuestionCount, 20);
  assert.equal(result.status, "complete");
  assert.equal(result.primaryTypeId, "hard_to_read");
});

test("keeps the analysis in progress until all core questions are completed", () => {
  const result = calculatePersonaCharacterAnalysis(CHARACTER_QUESTION_DEFINITIONS.slice(0, 8).map((question) => ({ questionId: question.id, score: 100 })));
  assert.equal(result.status, "in_progress");
  assert.equal(result.primaryTypeId, null);
});

test("orders high and low traits by strength and caps them at three", () => {
  const result = calculatePersonaCharacterAnalysis(all(100));
  assert.equal(result.secondaryTraits.length, 3);
  assert.ok(result.secondaryTraits.every((trait, index, traits) => index === 0 || traits[index - 1].strength >= trait.strength));
});
