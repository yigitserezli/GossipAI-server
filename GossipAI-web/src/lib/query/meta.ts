import type { QueryKey } from "@tanstack/react-query";

export type AppQueryMeta = {
  errorMessage?: string;
  skipErrorToast?: boolean;
};

export type AppMutationMeta = {
  invalidates?: QueryKey[];
  successMessage?: string;
  errorMessage?: string;
  skipSuccessToast?: boolean;
  skipErrorToast?: boolean;
};

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: AppQueryMeta;
    mutationMeta: AppMutationMeta;
  }
}

export {};
