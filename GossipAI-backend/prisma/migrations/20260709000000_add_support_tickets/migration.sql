DO $$ BEGIN
  CREATE TYPE "SupportTicketStatus" AS ENUM ('open', 'in_progress', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "support_tickets" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "contactName" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "support_tickets"
    ADD CONSTRAINT "support_tickets_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "support_tickets_status_createdAt_idx" ON "support_tickets"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "support_tickets_userId_createdAt_idx" ON "support_tickets"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "support_tickets_contactEmail_idx" ON "support_tickets"("contactEmail");
