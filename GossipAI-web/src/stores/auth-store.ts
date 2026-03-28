"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { persistStorage } from "@/lib/store/persist-storage";

export const authUserSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    email: z.string().email().nullish(),
    name: z.string().min(1).nullish(),
    role: z.string().min(1).nullish(),
  })
  .passthrough();

export const authTokensSchema = z
  .object({
    accessToken: z.string().min(1, "Access token zorunludur."),
    refreshToken: z.string().min(1, "Refresh token zorunludur."),
    tokenType: z.string().min(1).default("Bearer"),
    expiresIn: z.number().int().positive().optional(),
    expiresAt: z.string().optional(),
  })
  .passthrough();

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token bulunamadi."),
});

export const refreshTokenEnvelopeSchema = z.union([
  authTokensSchema,
  z.object({ data: authTokensSchema }).passthrough(),
  z.object({ tokens: authTokensSchema }).passthrough(),
]);

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthTokens = z.infer<typeof authTokensSchema>;

type AuthStore = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setSession: (payload: { user?: AuthUser | null; tokens: AuthTokens }) => void;
  setTokens: (
    tokens: Partial<AuthTokens> & Pick<AuthTokens, "accessToken">,
  ) => void;
  clearAuth: () => void;
};

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
} satisfies Pick<AuthStore, "user" | "tokens" | "isAuthenticated">;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: ({ user = null, tokens }) =>
        set({
          user,
          tokens: authTokensSchema.parse(tokens),
          isAuthenticated: true,
        }),
      setTokens: (tokens) =>
        set((state) => {
          const mergedTokens = authTokensSchema.parse({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken ?? state.tokens?.refreshToken,
            tokenType: tokens.tokenType ?? state.tokens?.tokenType ?? "Bearer",
            expiresAt: tokens.expiresAt ?? state.tokens?.expiresAt,
            expiresIn: tokens.expiresIn ?? state.tokens?.expiresIn,
          });

          return {
            tokens: mergedTokens,
            isAuthenticated: true,
          };
        }),
      clearAuth: () => set(initialState),
    }),
    {
      name: "gossipai-auth-store",
      storage: persistStorage,
      partialize: ({ user, tokens, isAuthenticated }) => ({
        user,
        tokens,
        isAuthenticated,
      }),
    },
  ),
);

export function getAccessToken() {
  return useAuthStore.getState().tokens?.accessToken ?? null;
}

export function getRefreshToken() {
  return useAuthStore.getState().tokens?.refreshToken ?? null;
}
