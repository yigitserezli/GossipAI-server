DO $$ BEGIN
  CREATE TYPE "AiConsentStatus" AS ENUM ('granted', 'revoked');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ai_consent_events" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "AiConsentStatus" NOT NULL,
  "policyVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ai_consent_events_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "ai_consent_events"
    ADD CONSTRAINT "ai_consent_events_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "ai_consent_events_userId_createdAt_idx"
  ON "ai_consent_events"("userId", "createdAt");
