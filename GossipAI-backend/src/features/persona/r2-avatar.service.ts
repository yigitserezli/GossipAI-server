import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

const UPLOAD_TTL_SECONDS = 5 * 60;
const allowedTypes = new Set(["image/jpeg", "image/png"]);

const config = () => {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL } = env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_BASE_URL) {
    throw new AppError("R2 avatar storage is not configured.", 503, undefined, "AVATAR_STORAGE_UNAVAILABLE", true);
  }
  const publicBaseUrl = R2_PUBLIC_BASE_URL.replace(/\/+$/, "");
  try { new URL(publicBaseUrl); } catch { throw new AppError("R2 public URL is invalid.", 500); }
  return { accountId: R2_ACCOUNT_ID, accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET, publicBaseUrl };
};

const client = () => {
  const settings = config();
  return new S3Client({
    region: "auto",
    endpoint: `https://${settings.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: settings.accessKeyId, secretAccessKey: settings.secretAccessKey },
  });
};

export const r2AvatarService = {
  async createUploadUrl(userId: string, contentType: string) {
    if (!allowedTypes.has(contentType)) {
      throw new AppError("Avatar must be a JPEG or PNG image.", 400, undefined, "INVALID_AVATAR", true);
    }
    const settings = config();
    const extension = contentType === "image/png" ? "png" : "jpg";
    const objectKey = `persona-avatars/${userId}/${randomUUID()}.${extension}`;
    const uploadUrl = await getSignedUrl(
      client(),
      new PutObjectCommand({ Bucket: settings.bucket, Key: objectKey, ContentType: contentType }),
      { expiresIn: UPLOAD_TTL_SECONDS }
    );
    return { objectKey, publicUrl: `${settings.publicBaseUrl}/${objectKey}`, uploadUrl, contentType, expiresAt: new Date(Date.now() + UPLOAD_TTL_SECONDS * 1000).toISOString() };
  },

  isOwnedPublicObject(userId: string, objectKey: string, publicUrl: string) {
    const settings = config();
    const expectedPrefix = `persona-avatars/${userId}/`;
    return objectKey.startsWith(expectedPrefix) && !objectKey.includes("..") && publicUrl === `${settings.publicBaseUrl}/${objectKey}`;
  },

  async delete(objectKey: string | null) {
    if (!objectKey) return;
    const settings = config();
    await client().send(new DeleteObjectCommand({ Bucket: settings.bucket, Key: objectKey }));
  },
};
