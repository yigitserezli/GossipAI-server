"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import "@/lib/query/meta";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/toast/notify";

export function makeQueryClient() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.skipErrorToast) {
          return;
        }

        showApiErrorToast(error, query.meta?.errorMessage ?? "Veri alinamadi");
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: async (data, _variables, _context, mutation) => {
        if (mutation.meta?.invalidates?.length) {
          await Promise.all(
            mutation.meta.invalidates.map((queryKey) =>
              queryClient.invalidateQueries({ queryKey }),
            ),
          );
        }

        if (!mutation.meta?.skipSuccessToast) {
          showApiSuccessToast(
            data,
            mutation.meta?.successMessage ?? "Islem basariyla tamamlandi.",
          );
        }
      },
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.skipErrorToast) {
          return;
        }

        showApiErrorToast(
          error,
          mutation.meta?.errorMessage ?? "Islem tamamlanamadi",
        );
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });

  return queryClient;
}
