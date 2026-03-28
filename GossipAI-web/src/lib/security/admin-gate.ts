import { z } from "zod";
import { isAxiosError } from "axios";
import { apiRequest } from "@/lib/api/request";

const ADMIN_SESSION_KEY = "gossipai-admin-unlocked";
const ADMIN_PASSCODE_SESSION_KEY = "gossipai-admin-passcode";
const ADMIN_FAILED_ATTEMPTS_KEY = "gossipai-admin-failed-attempts";
const ADMIN_LOCK_UNTIL_KEY = "gossipai-admin-lock-until";
const ADMIN_MAX_FAILED_ATTEMPTS = 3;
const ADMIN_LOCK_DURATION_MS = 5 * 60 * 1000;
const adminPasscodeResponseSchema = z.object({
  valid: z.literal(true),
});

export const normalizeAdminPasscode = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 6);
};

export const isAdminUnlockedInSession = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const unlocked = window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
  const passcode = window.sessionStorage.getItem(ADMIN_PASSCODE_SESSION_KEY) ?? "";
  return unlocked && /^\d{6}$/.test(passcode);
};

export const unlockAdminInSession = (passcode: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeAdminPasscode(passcode);
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
  window.sessionStorage.setItem(ADMIN_PASSCODE_SESSION_KEY, normalized);
};

export const getAdminPasscodeFromSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const passcode = window.sessionStorage.getItem(ADMIN_PASSCODE_SESSION_KEY) ?? "";
  return /^\d{6}$/.test(passcode) ? passcode : null;
};

export const verifyAdminPasscodeOnServer = async (passcode: string) => {
  const normalized = normalizeAdminPasscode(passcode);
  if (!/^\d{6}$/.test(normalized)) {
    return false;
  }

  try {
    await apiRequest(
      {
        method: "POST",
        url: "/auth/admin/verify-passcode",
        data: { passcode: normalized },
      },
      adminPasscodeResponseSchema
    );
  } catch (error) {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      (error.response?.data as { error?: { code?: string } } | undefined)?.error?.code ===
        "INVALID_ADMIN_PASSCODE"
    ) {
      return false;
    }

    throw error;
  }

  return true;
};

export const getAdminAllowedEmails = () => {
  const raw = process.env.NEXT_PUBLIC_ADMIN_ALLOWED_EMAILS?.trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

export const isAdminEmailAllowed = (email?: string | null) => {
  const allowlist = getAdminAllowedEmails();
  if (allowlist.length === 0) {
    return true;
  }

  if (!email) {
    return false;
  }

  return allowlist.includes(email.trim().toLowerCase());
};

export const getAdminLockRemainingMs = () => {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.sessionStorage.getItem(ADMIN_LOCK_UNTIL_KEY);
  const lockUntil = raw ? Number(raw) : 0;
  if (!Number.isFinite(lockUntil) || lockUntil <= 0) {
    return 0;
  }

  const remaining = lockUntil - Date.now();
  if (remaining <= 0) {
    window.sessionStorage.removeItem(ADMIN_LOCK_UNTIL_KEY);
    window.sessionStorage.removeItem(ADMIN_FAILED_ATTEMPTS_KEY);
    return 0;
  }

  return remaining;
};

export const clearAdminAttemptState = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(ADMIN_FAILED_ATTEMPTS_KEY);
  window.sessionStorage.removeItem(ADMIN_LOCK_UNTIL_KEY);
};

export const registerAdminFailedAttempt = () => {
  if (typeof window === "undefined") {
    return {
      locked: false,
      remainingAttempts: 0,
      lockRemainingMs: 0,
    };
  }

  const existing = Number(window.sessionStorage.getItem(ADMIN_FAILED_ATTEMPTS_KEY) ?? "0");
  const attempts = Number.isFinite(existing) ? existing + 1 : 1;

  if (attempts >= ADMIN_MAX_FAILED_ATTEMPTS) {
    const lockUntil = Date.now() + ADMIN_LOCK_DURATION_MS;
    window.sessionStorage.setItem(ADMIN_LOCK_UNTIL_KEY, String(lockUntil));
    window.sessionStorage.removeItem(ADMIN_FAILED_ATTEMPTS_KEY);
    return {
      locked: true,
      remainingAttempts: 0,
      lockRemainingMs: ADMIN_LOCK_DURATION_MS,
    };
  }

  window.sessionStorage.setItem(ADMIN_FAILED_ATTEMPTS_KEY, String(attempts));

  return {
    locked: false,
    remainingAttempts: ADMIN_MAX_FAILED_ATTEMPTS - attempts,
    lockRemainingMs: 0,
  };
};
