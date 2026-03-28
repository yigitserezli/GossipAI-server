import type { Request } from "express";

export interface SessionContext {
  ipAddress: string | null;
  userAgent: string | null;
}

const normalizeHeaderValue = (value: string | string[] | undefined): string | null => {
  if (!value) {
    return null;
  }

  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = rawValue.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
};

export const extractSessionContext = (req: Request): SessionContext => {
  const forwardedFor = normalizeHeaderValue(req.headers["x-forwarded-for"]);
  const forwardedIp = forwardedFor?.split(",")[0]?.trim() ?? null;

  const ipAddress = forwardedIp || req.ip || req.socket.remoteAddress || null;
  const userAgent = normalizeHeaderValue(req.headers["user-agent"]);

  return {
    ipAddress,
    userAgent
  };
};
