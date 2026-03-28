"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppPreferencesSync } from "@/components/providers/app-preferences-sync";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { makeQueryClient } from "@/lib/query/query-client";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <>
      <AppPreferencesSync />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
