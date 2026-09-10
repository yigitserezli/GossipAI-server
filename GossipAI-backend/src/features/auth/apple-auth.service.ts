import { createPublicKey, verify } from "node:crypto";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

type AppleJwk = {
  alg?: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use?: string;
};

type AppleTokenHeader = {
  alg?: unknown;
  kid?: unknown;
};

type AppleTokenClaims = {
  aud?: unknown;
  email?: unknown;
  exp?: unknown;
  iss?: unknown;
  sub?: unknown;
};

export type AppleIdentity = {
  email: string | null;
  subject: string;
};

const APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

let cachedKeys: { expiresAt: number; keys: AppleJwk[] } | null = null;

const parseJsonPart = <T>(value: string): T => {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    throw new AppError("Apple identity could not be verified.", 401, undefined, "INVALID_APPLE_ID_TOKEN");
  }
};

const fetchAppleKeys = async (forceRefresh = false): Promise<AppleJwk[]> => {
  if (!forceRefresh && cachedKeys && cachedKeys.expiresAt > Date.now()) {
    return cachedKeys.keys;
  }

  const response = await fetch(APPLE_JWKS_URL);
  const body = (await response.json().catch(() => null)) as { keys?: unknown } | null;
  if (!response.ok || !Array.isArray(body?.keys)) {
    throw new AppError("Apple sign-in is temporarily unavailable.", 503, undefined, "APPLE_AUTH_UNAVAILABLE");
  }

  const keys = body.keys.filter((key): key is AppleJwk =>
    Boolean(
      key &&
        typeof key === "object" &&
        typeof (key as AppleJwk).kid === "string" &&
        typeof (key as AppleJwk).kty === "string" &&
        typeof (key as AppleJwk).n === "string" &&
        typeof (key as AppleJwk).e === "string"
    )
  );
  cachedKeys = { keys, expiresAt: Date.now() + CACHE_DURATION_MS };
  return keys;
};

const findSigningKey = async (kid: string): Promise<AppleJwk> => {
  let key = (await fetchAppleKeys()).find((candidate) => candidate.kid === kid);
  if (!key) {
    key = (await fetchAppleKeys(true)).find((candidate) => candidate.kid === kid);
  }
  if (!key || key.kty !== "RSA" || (key.alg && key.alg !== "RS256")) {
    throw new AppError("Apple identity could not be verified.", 401, undefined, "INVALID_APPLE_ID_TOKEN");
  }
  return key;
};

const isExpectedAudience = (audience: unknown): boolean =>
  audience === env.APPLE_CLIENT_ID ||
  (Array.isArray(audience) && audience.some((value) => value === env.APPLE_CLIENT_ID));

export const appleAuthService = {
  async verifyIdentityToken(identityToken: string): Promise<AppleIdentity> {
    const parts = identityToken.split(".");
    if (parts.length !== 3 || !parts.every(Boolean)) {
      throw new AppError("Apple identity could not be verified.", 401, undefined, "INVALID_APPLE_ID_TOKEN");
    }

    const [encodedHeader, encodedClaims, encodedSignature] = parts as [string, string, string];
    const header = parseJsonPart<AppleTokenHeader>(encodedHeader);
    const claims = parseJsonPart<AppleTokenClaims>(encodedClaims);
    if (header.alg !== "RS256" || typeof header.kid !== "string") {
      throw new AppError("Apple identity could not be verified.", 401, undefined, "INVALID_APPLE_ID_TOKEN");
    }

    const key = await findSigningKey(header.kid);
    const signatureIsValid = verify(
      "RSA-SHA256",
      Buffer.from(`${encodedHeader}.${encodedClaims}`),
      createPublicKey({ key, format: "jwk" }),
      Buffer.from(encodedSignature, "base64url")
    );
    const expiresAt = typeof claims.exp === "number" ? claims.exp : 0;
    if (
      !signatureIsValid ||
      claims.iss !== "https://appleid.apple.com" ||
      !isExpectedAudience(claims.aud) ||
      expiresAt <= Math.floor(Date.now() / 1000) ||
      typeof claims.sub !== "string" ||
      !claims.sub.trim()
    ) {
      throw new AppError("Apple identity could not be verified.", 401, undefined, "INVALID_APPLE_ID_TOKEN");
    }

    return {
      subject: claims.sub,
      email: typeof claims.email === "string" && claims.email.trim() ? claims.email.trim().toLowerCase() : null,
    };
  },
};
