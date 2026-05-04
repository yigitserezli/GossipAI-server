-- AlterTable (idempotent: skip if column already exists)
DO $$ BEGIN
  ALTER TABLE "users" ADD COLUMN "premiumExpiresAt" TIMESTAMP(3);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
