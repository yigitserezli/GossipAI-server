#!/bin/sh
set -eu

echo "[backend] waiting for database and applying schema..."

RETRIES=30
COUNT=0
until npx prisma db push --skip-generate --accept-data-loss; do
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
