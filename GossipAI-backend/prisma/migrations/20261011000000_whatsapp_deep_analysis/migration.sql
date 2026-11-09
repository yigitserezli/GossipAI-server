ALTER TABLE "persona_insights" ADD COLUMN "personaMemoryJson" JSONB, ADD COLUMN "evidenceSnapshotAt" TIMESTAMP(3);
ALTER TABLE "persona_whatsapp_imports"
  ADD COLUMN "byteSize" INTEGER,
  ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN "participantsJson" JSONB,
  ADD COLUMN "userParticipant" TEXT,
  ADD COLUMN "personaParticipant" TEXT,
  ADD COLUMN "contentHash" TEXT,
  ADD COLUMN "evidenceJson" JSONB,
  ADD COLUMN "analysisJson" JSONB,
  ADD COLUMN "processedChunks" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "totalChunks" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "workerToken" TEXT,
  ADD COLUMN "leaseUntil" TIMESTAMP(3);
CREATE UNIQUE INDEX "persona_whatsapp_imports_personaId_contentHash_key" ON "persona_whatsapp_imports"("personaId", "contentHash");
-- Existing records have unknown size/participants. Keep these values NULL;
-- never invent historical metadata or infer sender identities.
