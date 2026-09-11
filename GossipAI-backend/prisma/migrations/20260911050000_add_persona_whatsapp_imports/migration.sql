ALTER TABLE "persona_insights"
  ADD COLUMN "relationshipNarrative" TEXT,
  ADD COLUMN "narrativeLanguage" TEXT,
  ADD COLUMN "narrativeUpdatedAt" TIMESTAMP(3);

CREATE TABLE "persona_whatsapp_imports" (
  "id" TEXT NOT NULL,
  "personaId" TEXT NOT NULL,
  "originalFilename" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "storageObjectKey" TEXT,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "messageCount" INTEGER,
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "derivedSummary" TEXT,
  "errorCode" TEXT,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "rawDeletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "persona_whatsapp_imports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "persona_whatsapp_imports_status_nextAttemptAt_idx"
  ON "persona_whatsapp_imports"("status", "nextAttemptAt");
CREATE INDEX "persona_whatsapp_imports_personaId_createdAt_idx"
  ON "persona_whatsapp_imports"("personaId", "createdAt");
ALTER TABLE "persona_whatsapp_imports"
  ADD CONSTRAINT "persona_whatsapp_imports_personaId_fkey"
  FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
