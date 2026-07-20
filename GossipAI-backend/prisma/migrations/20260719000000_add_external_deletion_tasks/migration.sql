-- A prior interrupted production attempt may have created the enum before
-- Prisma could record this migration. Keep the migration recoverable.
DO $$
BEGIN
  CREATE TYPE "ExternalDeletionProvider" AS ENUM ('revenuecat');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "external_deletion_tasks" (
  "id" TEXT NOT NULL,
  "provider" "ExternalDeletionProvider" NOT NULL,
  "externalUserId" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "external_deletion_tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "external_deletion_tasks_provider_externalUserId_key"
  ON "external_deletion_tasks"("provider", "externalUserId");
CREATE INDEX IF NOT EXISTS "external_deletion_tasks_createdAt_idx"
  ON "external_deletion_tasks"("createdAt");
