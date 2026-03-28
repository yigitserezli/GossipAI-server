"use client";

import axios, {
  AxiosHeaders,
  HttpStatusCode,
  type InternalAxiosRequestConfig,
} from "axios";
import { showApiErrorToast, showValidationErrorToast } from "@/lib/toast/notify";
import {
  authTokensSchema,
  getAccessToken,
  getRefreshToken,
  refreshTokenEnvelopeSchema,
  refreshTokenRequestSchema,
  useAuthStore,
} from "@/stores/auth-store";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetryCount?: number;
  _skipAuthRefresh?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const AUTH_REFRESH_PATH =
  process.env.NEXT_PUBLIC_AUTH_REFRESH_PATH ?? "/auth/refresh";
const ADMIN_SESSION_KEY = "gossipai-admin-unlocked";
const ADMIN_PASSCODE_SESSION_KEY = "gossipai-admin-passcode";
const ADMIN_RELOCK_ERROR_CODES = new Set(["AUTH_REQUIRED", "INVALID_ACCESS_TOKEN"]);

type ApiErrorPayload = {
  error?: {
    code?: string;
  };
};

function getAdminPasscodeFromSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const passcode = window.sessionStorage.getItem(ADMIN_PASSCODE_SESSION_KEY) ?? "";
  return /^\d{6}$/.test(passcode) ? passcode : null;
}

function forceAdminPasscodeScreenIfNeeded(requestUrl?: string) {
  if (typeof window === "undefined") {
    return;
  }

  const url = requestUrl ?? "";
  if (!url.startsWith("/notifications") && !url.startsWith("/admin")) {
    return;
  }

  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
  window.sessionStorage.removeItem(ADMIN_PASSCODE_SESSION_KEY);

  if (window.location.pathname.startsWith("/admin")) {
    window.location.assign("/admin");
  }
}

function shouldForceAdminRelockOnUnauthorized(error: unknown, requestUrl?: string) {
  const url = requestUrl ?? "";
  if (!url.startsWith("/notifications") && !url.startsWith("/admin")) {
    return false;
  }

  const code =
    (error as { response?: { data?: ApiErrorPayload } } | undefined)?.response?.data?.error?.code;

  return typeof code === "string" && ADMIN_RELOCK_ERROR_CODES.has(code);
}

const baseConfig = {
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
};

const apiClient = axios.create(baseConfig);
const refreshClient = axios.create(baseConfig);

let refreshPromise: Promise<string | null> | null = null;

function unwrapRefreshTokens(payload: unknown) {
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return authTokensSchema.parse(payload.data);
  }

  if (typeof payload === "object" && payload !== null && "tokens" in payload) {
    return authTokensSchema.parse(payload.tokens);
  }

  return authTokensSchema.parse(payload);
}

async function requestTokenRefresh() {
  const refreshToken = getRefreshToken();
  const parsedPayload = refreshTokenRequestSchema.safeParse({ refreshToken });

  if (!parsedPayload.success) {
    showValidationErrorToast(parsedPayload.error, "Oturum yenilenemedi");
    useAuthStore.getState().clearAuth();
    return null;
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await refreshClient.post(
        AUTH_REFRESH_PATH,
        parsedPayload.data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const parsedResponse = refreshTokenEnvelopeSchema.safeParse(response.data);

      if (!parsedResponse.success) {
        showValidationErrorToast(
          parsedResponse.error,
          "Refresh cevabi dogrulanamadi",
        );
        continue;
      }

      const payload = unwrapRefreshTokens(parsedResponse.data);

      const nextTokens = authTokensSchema.parse({
        accessToken: payload.accessToken,
        refreshToken:
          payload.refreshToken ??
          getRefreshToken() ??
          parsedPayload.data.refreshToken,
        tokenType: payload.tokenType,
        expiresAt: payload.expiresAt,
        expiresIn: payload.expiresIn,
      });

      useAuthStore.getState().setTokens(nextTokens);

      return payload.accessToken;
    } catch (error) {
      if (attempt === 1) {
        showApiErrorToast(error, "Oturum suresi doldu");
        useAuthStore.getState().clearAuth();
        return null;
      }
    }
  }

  return null;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  const headers = AxiosHeaders.from(config.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const url = config.url ?? "";
  if (url.startsWith("/notifications") || url.startsWith("/admin")) {
    const adminPasscode = getAdminPasscodeFromSession();
    if (adminPasscode) {
      headers.set("x-admin-passcode", adminPasscode);
    }
  }

  config.headers = headers;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== HttpStatusCode.Unauthorized ||
      !originalRequest ||
      originalRequest._skipAuthRefresh
    ) {
      return Promise.reject(error);
    }

    originalRequest._authRetryCount =
      (originalRequest._authRetryCount ?? 0) + 1;

    if (originalRequest._authRetryCount > 1) {
      return Promise.reject(error);
    }

    const nextAccessToken = await refreshAccessToken();

    if (!nextAccessToken) {
      if (shouldForceAdminRelockOnUnauthorized(error, originalRequest.url)) {
        forceAdminPasscodeScreenIfNeeded(originalRequest.url);
      }
      return Promise.reject(error);
    }

    const headers = AxiosHeaders.from(originalRequest.headers);
    headers.set("Authorization", `Bearer ${nextAccessToken}`);
    originalRequest.headers = headers;

    return apiClient(originalRequest);
  },
);

export { apiClient };

export default apiClient;
