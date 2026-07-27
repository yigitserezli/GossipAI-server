#!/bin/sh
set -eu

echo "[backend] waiting for database and applying migrations..."

RETRIES=30
COUNT=0
until npx prisma migrate deploy; do
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$RETRIES" ]; then
    echo "[backend] prisma migrate deploy failed after $RETRIES attempts"
    exit 1
  fi
  echo "[backend] database not ready yet, retrying in 3s ($COUNT/$RETRIES)..."
  sleep 3
done

echo "[backend] migrations ready, starting app"
exec node dist/index.js
