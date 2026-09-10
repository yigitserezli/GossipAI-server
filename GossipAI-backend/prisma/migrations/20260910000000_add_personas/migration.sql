CREATE TABLE "personas" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "relationshipType" TEXT NOT NULL,
  "avatarEmoji" TEXT,
  "avatarStoragePath" TEXT,
  "themeKey" TEXT NOT NULL DEFAULT 'violet',
  "whoIsThis" TEXT,
  "thoughtsFeelings" TEXT,
  "goals" TEXT,
  "currentSituation" TEXT,
  "communicationStyle" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "persona_insights" (
  "personaId" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "confidence" INTEGER NOT NULL,
  "communicationStyle" TEXT,
  "greenFlagsJson" JSONB,
  "redFlagsJson" JSONB,
  "lastMessageExcerpt" TEXT,
  "lastAnalyzedConversationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "persona_insights_pkey" PRIMARY KEY ("personaId")
);

ALTER TABLE "conversations"
  ADD COLUMN "personaId" TEXT,
  ADD COLUMN "personaSnapshot" JSONB,
  ADD COLUMN "personaInsightsEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "personas_userId_createdAt_idx" ON "personas"("userId", "createdAt");
CREATE INDEX "conversations_personaId_idx" ON "conversations"("personaId");

ALTER TABLE "personas"
  ADD CONSTRAINT "personas_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "persona_insights"
  ADD CONSTRAINT "persona_insights_personaId_fkey"
  FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations"
  ADD CONSTRAINT "conversations_personaId_fkey"
  FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
