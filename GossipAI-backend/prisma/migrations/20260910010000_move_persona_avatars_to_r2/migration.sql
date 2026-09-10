ALTER TABLE "personas" RENAME COLUMN "avatarStoragePath" TO "avatarUrl";
ALTER TABLE "personas" ADD COLUMN "avatarObjectKey" TEXT;
