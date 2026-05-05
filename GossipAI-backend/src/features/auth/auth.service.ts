import { Prisma, type SubscriptionPlan } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import type { AuthContextUser } from "../../shared/types/auth";
import type { AdminVerifyPasscodeInput, LoginInput, LogoutInput, RegisterInput } from "./auth.schema";
import type { SessionContext } from "./session-context";

interface PublicUser {
  id: string;
  name: string;
  email: string;
  preferredLanguage: string;
  plan: SubscriptionPlan;
  gender: string | null;
  createdAt: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface SessionInfo {
  sessionId: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string;
}

interface AuthResult {
  user: PublicUser;
  tokens: Tokens;
  session: SessionInfo;
}

interface AccessPayload extends JwtPayload {
  sub: string;
  email: string;
  tokenVersion: number;
  type: "access";
}

interface RefreshPayload extends JwtPayload {
  sub: string;
  tokenVersion: number;
  jti: string;
  type: "refresh";
}

interface AdminPasscodeAttemptState {
  attempts: number;
  lockUntil: number;
}

const sanitizeUser = (user: { id: string; name: string; email: string; preferredLanguage: string; plan: SubscriptionPlan; gender: string | null; createdAt: Date }): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  preferredLanguage: user.preferredLanguage,
  plan: user.plan,
  gender: user.gender,
  createdAt: user.createdAt.toISOString()
});

const toSessionInfo = (session: {
  sessionId: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  lastUsedAt: Date;
}): SessionInfo => ({
  sessionId: session.sessionId,
  ipAddress: session.ipAddress,
  userAgent: session.userAgent,
  createdAt: session.createdAt.toISOString(),
  lastUsedAt: session.lastUsedAt.toISOString()
});

const toAccessPayload = (decoded: string | JwtPayload): AccessPayload => {
  if (
    typeof decoded !== "object" ||
    decoded.type !== "access" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.email !== "string" ||
    typeof decoded.tokenVersion !== "number"
  ) {
    throw new AppError("Invalid access token", 401, undefined, "INVALID_ACCESS_TOKEN");
  }

  return decoded as AccessPayload;
};

const toRefreshPayload = (decoded: string | JwtPayload): RefreshPayload => {
  if (
    typeof decoded !== "object" ||
    decoded.type !== "refresh" ||
    typeof decoded.sub !== "string" ||
    typeof decoded.jti !== "string" ||
    typeof decoded.tokenVersion !== "number"
  ) {
    throw new AppError("Invalid refresh token", 401, undefined, "INVALID_REFRESH_TOKEN");
  }

  return decoded as RefreshPayload;
};

const signAccessToken = (user: { id: string; email: string; tokenVersion: number }): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
      type: "access"
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    }
  );
};

const signRefreshToken = (user: { id: string; tokenVersion: number }, jti: string): string => {
  return jwt.sign(
    {
      sub: user.id,
      tokenVersion: user.tokenVersion,
      jti,
      type: "refresh"
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    }
  );
};

const createTokenPair = async (
  user: { id: string; email: string; tokenVersion: number },
  sessionContext: SessionContext,
  sessionId?: string
): Promise<{ tokens: Tokens; session: SessionInfo }> => {
  const jti = randomUUID();
  const refreshToken = signRefreshToken(user, jti);
  const now = new Date();

  const refreshSession = await prisma.refreshSession.create({
    data: {
      jti,
      userId: user.id,
      tokenVersion: user.tokenVersion,
      sessionId: sessionId ?? randomUUID(),
      ipAddress: sessionContext.ipAddress,
      userAgent: sessionContext.userAgent,
      lastUsedAt: now
    }
  });

  return {
    tokens: {
      accessToken: signAccessToken(user),
      refreshToken
    },
    session: toSessionInfo(refreshSession)
  };
};

const verifyAccessToken = (token: string): AccessPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return toAccessPayload(decoded);
  } catch {
    throw new AppError("Unauthorized", 401, undefined, "UNAUTHORIZED");
  }
};

const verifyRefreshToken = (token: string): RefreshPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    return toRefreshPayload(decoded);
  } catch {
    throw new AppError("Invalid refresh token", 401, undefined, "INVALID_REFRESH_TOKEN");
  }
};

const parseDeveloperEmails = () =>
  (env.DEVELOPER_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const ADMIN_PASSCODE_MAX_ATTEMPTS = 3;
const ADMIN_PASSCODE_LOCK_DURATION_MS = 5 * 60 * 1000;
const adminPasscodeAttempts = new Map<string, AdminPasscodeAttemptState>();

const getAdminPasscodeAttemptKey = (user: Pick<AuthContextUser, "email"> | null | undefined, ipAddress?: string | null) => {
  const normalizedIp = (ipAddress ?? "unknown").trim().toLowerCase();
  const identity = user?.email?.trim().toLowerCase() || "anonymous";
  return `${identity}::${normalizedIp}`;
};

const clearAdminPasscodeLock = (key: string) => {
  adminPasscodeAttempts.delete(key);
};

const assertNotLockedForAdminPasscode = (key: string) => {
  const state = adminPasscodeAttempts.get(key);
  if (!state) {
    return;
  }

  if (state.lockUntil <= Date.now()) {
    adminPasscodeAttempts.delete(key);
    return;
  }

  const retryAfterSeconds = Math.ceil((state.lockUntil - Date.now()) / 1000);
  throw new AppError(
    `Too many invalid admin passcode attempts. Try again in ${retryAfterSeconds} seconds.`,
    429,
    { retryAfterSeconds },
    "ADMIN_PASSCODE_LOCKED"
  );
};

const registerAdminPasscodeFailure = (key: string) => {
  const now = Date.now();
  const current = adminPasscodeAttempts.get(key);
  const currentAttempts = current && current.lockUntil <= now ? 0 : (current?.attempts ?? 0);
  const attempts = currentAttempts + 1;

  if (attempts >= ADMIN_PASSCODE_MAX_ATTEMPTS) {
    const lockUntil = now + ADMIN_PASSCODE_LOCK_DURATION_MS;
    adminPasscodeAttempts.set(key, { attempts: 0, lockUntil });

    const retryAfterSeconds = Math.ceil(ADMIN_PASSCODE_LOCK_DURATION_MS / 1000);
    throw new AppError(
      `Too many invalid admin passcode attempts. Try again in ${retryAfterSeconds} seconds.`,
      429,
      { retryAfterSeconds },
      "ADMIN_PASSCODE_LOCKED"
    );
  }

  adminPasscodeAttempts.set(key, { attempts, lockUntil: 0 });
};

export const authService = {
  async register(input: RegisterInput, sessionContext: SessionContext): Promise<AuthResult> {
    const normalizedEmail = input.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail
      },
      select: {
        id: true
      }
    });

    if (existingUser) {
      throw new AppError("Email already in use", 409, undefined, "EMAIL_IN_USE");
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    try {
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: normalizedEmail,
          passwordHash,
          gender: input.gender ?? null
        }
      });

      const tokenPair = await createTokenPair(user, sessionContext);

      return {
        user: sanitizeUser(user),
        tokens: tokenPair.tokens,
        session: tokenPair.session
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError("Email already in use", 409, undefined, "EMAIL_IN_USE");
      }

      throw error;
    }
  },

  async login(input: LoginInput, sessionContext: SessionContext): Promise<AuthResult> {
    const normalizedEmail = input.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail
      }
    });

    if (!user) {
      throw new AppError("Invalid credentials", 401, undefined, "INVALID_CREDENTIALS");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError("Invalid credentials", 401, undefined, "INVALID_CREDENTIALS");
    }

    const tokenPair = await createTokenPair(user, sessionContext);

    return {
      user: sanitizeUser(user),
      tokens: tokenPair.tokens,
      session: tokenPair.session
    };
  },

  async refresh(refreshToken: string, sessionContext: SessionContext): Promise<AuthResult> {
    const payload = verifyRefreshToken(refreshToken);

    const existingSession = await prisma.refreshSession.findUnique({
      where: {
        jti: payload.jti
      }
    });

    if (!existingSession || existingSession.revokedAt) {
      throw new AppError("Refresh token already used or revoked", 401, undefined, "REFRESH_TOKEN_REVOKED");
    }

    const revoked = await prisma.refreshSession.updateMany({
      where: {
        jti: payload.jti,
        revokedAt: null
      },
      data: {
        revokedAt: new Date(),
        lastUsedAt: new Date()
      }
    });

    if (revoked.count === 0) {
      throw new AppError("Refresh token already used or revoked", 401, undefined, "REFRESH_TOKEN_REVOKED");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub
      }
    });

    if (
      !user ||
      user.tokenVersion !== payload.tokenVersion ||
      existingSession.userId !== user.id ||
      existingSession.tokenVersion !== payload.tokenVersion
    ) {
      throw new AppError("Invalid refresh token", 401, undefined, "INVALID_REFRESH_TOKEN");
    }

    const tokenPair = await createTokenPair(
      user,
      {
        ipAddress: sessionContext.ipAddress ?? existingSession.ipAddress,
        userAgent: sessionContext.userAgent ?? existingSession.userAgent
      },
      existingSession.sessionId
    );

    return {
      user: sanitizeUser(user),
      tokens: tokenPair.tokens,
      session: tokenPair.session
    };
  },

  async logout(input: LogoutInput) {
    try {
      const payload = verifyRefreshToken(input.refreshToken);

      await prisma.refreshSession.updateMany({
        where: {
          jti: payload.jti,
          revokedAt: null
        },
        data: {
          revokedAt: new Date(),
          lastUsedAt: new Date()
        }
      });

      if (input.deviceToken) {
        await prisma.pushDevice.deleteMany({
          where: {
            token: input.deviceToken,
            userId: payload.sub
          }
        });
      }
    } catch {
      return;
    }
  },

  async getMe(user: AuthContextUser) {
    const storedUser = await prisma.user.findUnique({
      where: {
        id: user.id
      }
    });

    if (!storedUser) {
      throw new AppError("User not found", 404, undefined, "USER_NOT_FOUND");
    }

    if (storedUser.tokenVersion !== user.tokenVersion) {
      throw new AppError("Unauthorized", 401, undefined, "UNAUTHORIZED");
    }

    return sanitizeUser(storedUser);
  },

  async updatePreferredLanguage(user: AuthContextUser, preferredLanguage: string) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { preferredLanguage }
    });

    return sanitizeUser(updatedUser);
  },

  decodeAccessToken(token: string): AuthContextUser {
    const payload = verifyAccessToken(token);

    return {
      id: payload.sub,
      email: payload.email,
      tokenVersion: payload.tokenVersion
    };
  },

  async verifyAdminPasscode(
    user: AuthContextUser | null,
    input: AdminVerifyPasscodeInput,
    context?: { ipAddress?: string | null }
  ): Promise<void> {
    const developerEmails = parseDeveloperEmails();
    const attemptKey = getAdminPasscodeAttemptKey(user, context?.ipAddress);

    if (
      user &&
      developerEmails.length > 0 &&
      !developerEmails.includes(user.email.toLowerCase())
    ) {
      throw new AppError("Admin access required.", 403, undefined, "FORBIDDEN");
    }

    assertNotLockedForAdminPasscode(attemptKey);

    if (input.passcode !== env.ADMIN_PASSCODE) {
      registerAdminPasscodeFailure(attemptKey);
      throw new AppError("Invalid admin passcode.", 401, undefined, "INVALID_ADMIN_PASSCODE");
    }

    clearAdminPasscodeLock(attemptKey);
  },

  async forgotPassword(email: string): Promise<void> {
    const { sendPasswordResetEmail } = await import("../../lib/email");
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always respond successfully to prevent email enumeration
    if (!user) return;

    // Invalidate any existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() }
    });

    // Generate a cryptographically secure 6-digit code
    const { randomInt, createHash } = await import("node:crypto");
    const code = String(randomInt(100000, 1000000)); // 100000–999999
    const tokenHash = createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt }
    });

    await sendPasswordResetEmail(user.email, code);
  },

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const { createHash } = await import("node:crypto");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new AppError("Reset link is invalid or has expired.", 400, undefined, "INVALID_RESET_TOKEN");
    }

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash, tokenVersion: { increment: 1 } }
      }),
      prisma.passwordResetToken.update({
        where: { tokenHash },
        data: { usedAt: new Date() }
      }),
      // Revoke all refresh sessions so existing sessions are invalidated
      prisma.refreshSession.deleteMany({ where: { userId: record.userId } })
    ]);
  }
};
