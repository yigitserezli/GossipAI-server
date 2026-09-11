import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

const URL_TTL_SECONDS = 5 * 60;
const allowedTypes = new Set(["image/jpeg", "image/png"]);

const config = () => {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    throw new AppError("R2 avatar storage is not configured.", 503, undefined, "AVATAR_STORAGE_UNAVAILABLE", true);
  }
  return { accountId: R2_ACCOUNT_ID, accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET };
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
      { expiresIn: URL_TTL_SECONDS }
    );
    return { objectKey, uploadUrl, contentType, expiresAt: new Date(Date.now() + URL_TTL_SECONDS * 1000).toISOString() };
  },

  isOwnedObject(userId: string, objectKey: string) {
    const expectedPrefix = `persona-avatars/${userId}/`;
    return objectKey.startsWith(expectedPrefix) && !objectKey.includes("..");
  },

  async createReadUrl(objectKey: string) {
    const settings = config();
    return getSignedUrl(client(), new GetObjectCommand({ Bucket: settings.bucket, Key: objectKey }), { expiresIn: URL_TTL_SECONDS });
  },

  async delete(objectKey: string | null) {
    if (!objectKey) return;
    const settings = config();
    await client().send(new DeleteObjectCommand({ Bucket: settings.bucket, Key: objectKey }));
  },
};

// The import worker shares the same private R2 bucket. Keeping these helpers
// here avoids accidentally introducing a second storage configuration.
export const r2PrivateObjectService = {
  async createUploadUrl(objectKey: string, contentType: string) {
    const settings = config();
    const uploadUrl = await getSignedUrl(
      client(),
      new PutObjectCommand({ Bucket: settings.bucket, Key: objectKey, ContentType: contentType }),
      { expiresIn: URL_TTL_SECONDS }
    );
    return { uploadUrl, expiresAt: new Date(Date.now() + URL_TTL_SECONDS * 1000).toISOString() };
  },

  async read(objectKey: string) {
    const settings = config();
    const response = await client().send(new GetObjectCommand({ Bucket: settings.bucket, Key: objectKey }));
    if (!response.Body) throw new AppError("Uploaded file could not be read.", 422, undefined, "IMPORT_FILE_MISSING", true);
    const chunks: Buffer[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) chunks.push(Buffer.from(chunk));
    return { body: Buffer.concat(chunks), contentType: response.ContentType ?? null };
  },

  async delete(objectKey: string | null) {
    if (!objectKey) return;
    const settings = config();
    await client().send(new DeleteObjectCommand({ Bucket: settings.bucket, Key: objectKey }));
  },
};
