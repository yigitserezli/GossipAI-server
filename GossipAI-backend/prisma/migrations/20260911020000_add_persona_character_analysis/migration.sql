CREATE TABLE "persona_character_analyses" (
  "personaId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'in_progress',
  "scoringVersion" TEXT NOT NULL DEFAULT 'persona-character-v1',
  "answeredQuestionCount" INTEGER NOT NULL DEFAULT 0,
  "completedQuestionCount" INTEGER NOT NULL DEFAULT 0,
  "dimensionScoresJson" JSONB,
  "dimensionConfidencesJson" JSONB,
  "primaryTypeId" TEXT,
  "primaryTypeScore" DOUBLE PRECISION,
  "primaryTypeCoverage" DOUBLE PRECISION,
  "secondaryTraitsJson" JSONB,
  "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "persona_character_analyses_pkey" PRIMARY KEY ("personaId"),
  CONSTRAINT "persona_character_analyses_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "persona_character_answers" (
  "personaId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "score" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "persona_character_answers_pkey" PRIMARY KEY ("personaId", "questionId"),
  CONSTRAINT "persona_character_answers_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "persona_character_analyses"("personaId") ON DELETE CASCADE ON UPDATE CASCADE
);
