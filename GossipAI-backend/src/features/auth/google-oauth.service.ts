import { createHash, randomUUID } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

type GoogleCredentials = { clientId: string; clientSecret: string };

export type GoogleIdentity = {
  subject: string;
  email: string;
  name: string | null;
};

type GoogleState = JwtPayload & {
  type: "google-oauth-state";
  returnTo: string;
};

type GoogleIdTokenClaims = {
  aud?: unknown;
  email?: unknown;
  email_verified?: unknown;
  exp?: unknown;
  iss?: unknown;
  name?: unknown;
  sub?: unknown;
};

const getCredentialsFromFile = (): GoogleCredentials | null => {
  const configuredPath = env.GOOGLE_CREDENTIALS_FILE
    ? resolve(process.cwd(), env.GOOGLE_CREDENTIALS_FILE)
    : null;
  const directories = [resolve(process.cwd(), ".secrets"), resolve(process.cwd(), "..", ".secrets")];
  const directory = directories.find((candidate) => existsSync(candidate));
  if (!configuredPath && !directory) return null;
  const filePath = configuredPath ?? (() => {
    const fileName = readdirSync(directory!).find(
      (entry) => entry.startsWith("client_secret_") && entry.endsWith(".json")
    );
    return fileName ? resolve(directory!, fileName) : null;
  })();
  if (!filePath || !existsSync(filePath)) return null;

  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as {
      web?: { client_id?: string; client_secret?: string };
    };
    const clientId = parsed.web?.client_id?.trim();
    const clientSecret = parsed.web?.client_secret?.trim();
    return clientId && clientSecret ? { clientId, clientSecret } : null;
  } catch {
    return null;
  }
};

const getCredentials = (): GoogleCredentials => {
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    return { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET };
  }

  const fileCredentials = getCredentialsFromFile();
  if (fileCredentials) return fileCredentials;

  throw new AppError("Google sign-in is not configured.", 503, undefined, "GOOGLE_AUTH_UNAVAILABLE");
};

const validateMobileReturnTo = (rawUrl: string): string => {
  try {
    const url = new URL(rawUrl);
    if (
      url.protocol !== `${env.GOOGLE_MOBILE_REDIRECT_SCHEME}:` ||
      url.hostname !== "auth" ||
      url.pathname !== "/google"
    ) {
      throw new Error("Invalid redirect");
    }
    return url.toString();
  } catch {
    throw new AppError("Invalid Google sign-in redirect.", 400, undefined, "INVALID_GOOGLE_REDIRECT");
  }
};

const verifyIdTokenClaims = (claims: GoogleIdTokenClaims, clientId: string): GoogleIdentity => {
  const validIssuer = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
  const expiresAt = typeof claims.exp === "number" || typeof claims.exp === "string" ? Number(claims.exp) : 0;
  const emailVerified = claims.email_verified === true || claims.email_verified === "true";
  if (
    claims.aud !== clientId ||
    !validIssuer ||
    expiresAt <= Math.floor(Date.now() / 1000) ||
    !emailVerified ||
    typeof claims.sub !== "string" ||
    typeof claims.email !== "string"
  ) {
    throw new AppError("Google identity could not be verified.", 401, undefined, "INVALID_GOOGLE_ID_TOKEN");
  }

  return {
    subject: claims.sub,
    email: claims.email.trim().toLowerCase(),
    name: typeof claims.name === "string" && claims.name.trim() ? claims.name.trim() : null,
  };
};

const parseState = (value: string): GoogleState => {
  try {
    const parsed = jwt.verify(value, env.JWT_ACCESS_SECRET) as GoogleState;
    if (parsed.type !== "google-oauth-state" || typeof parsed.returnTo !== "string") throw new Error("Invalid state");
    validateMobileReturnTo(parsed.returnTo);
    return parsed;
  } catch {
    throw new AppError("Google sign-in session has expired. Please try again.", 400, undefined, "INVALID_GOOGLE_STATE");
  }
};

export const googleOAuthService = {
  createAuthorizationUrl(returnTo: string): string {
    const safeReturnTo = validateMobileReturnTo(returnTo);
    const { clientId } = getCredentials();
    const state = jwt.sign(
      { type: "google-oauth-state", returnTo: safeReturnTo },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "10m", jwtid: randomUUID() }
    );
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: "code",
      scope: "openid email profile",
      prompt: "select_account",
      state,
    }).toString();
    return url.toString();
  },

  async completeAuthorization(code: string, state: string): Promise<{ identity: GoogleIdentity; returnTo: string }> {
    const parsedState = parseState(state);
    const { clientId, clientSecret } = getCredentials();
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });
    const body = (await response.json().catch(() => null)) as { id_token?: unknown } | null;
    if (!response.ok || typeof body?.id_token !== "string") {
      throw new AppError("Google sign-in could not be completed.", 502, undefined, "GOOGLE_TOKEN_EXCHANGE_FAILED");
    }

    const verificationResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.id_token)}`
    );
    const claims = (await verificationResponse.json().catch(() => null)) as GoogleIdTokenClaims | null;
    if (!verificationResponse.ok || !claims) {
      throw new AppError("Google identity could not be verified.", 502, undefined, "INVALID_GOOGLE_ID_TOKEN");
    }

    return { identity: verifyIdTokenClaims(claims, clientId), returnTo: parsedState.returnTo };
  },

  hashGrant(grant: string): string {
    return createHash("sha256").update(grant).digest("hex");
  },
};
