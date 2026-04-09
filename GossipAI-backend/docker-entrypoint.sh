#!/bin/sh
set -eu

echo "[backend] running enum migration (free → basic)..."
# Rename the enum value if the old one still exists; safe to re-run.
npx prisma db execute --stdin <<'SQL' || true
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'free'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SubscriptionPlan')
  ) THEN
    ALTER TYPE "SubscriptionPlan" RENAME VALUE 'free' TO 'basic';
    RAISE NOTICE 'Renamed SubscriptionPlan.free → basic';
  ELSE
    RAISE NOTICE 'SubscriptionPlan.free already renamed or does not exist';
  END IF;
END $$;
SQL

echo "[backend] waiting for database and applying schema..."

RETRIES=30
COUNT=0
until npx prisma db push --skip-generate; do
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$RETRIES" ]; then
    echo "[backend] prisma db push failed after $RETRIES attempts"
    exit 1
  fi
  echo "[backend] database not ready yet, retrying in 3s ($COUNT/$RETRIES)..."
  sleep 3
done

echo "[backend] schema ready, starting app"
exec node dist/index.js
