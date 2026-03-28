"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { persistStorage } from "@/lib/store/persist-storage";

export const appThemeSchema = z.enum(["system", "light", "dark"]);
export const appLanguageSchema = z.enum(["tr", "en"]);

const appPreferencesSchema = z.object({
  theme: appThemeSchema.default("system"),
  language: appLanguageSchema.default("tr"),
  sidebarOpen: z.boolean().default(true),
});

export type AppTheme = z.infer<typeof appThemeSchema>;
export type AppLanguage = z.infer<typeof appLanguageSchema>;
type AppPreferences = z.infer<typeof appPreferencesSchema>;

type AppStore = AppPreferences & {
  setTheme: (theme: AppTheme) => void;
  setLanguage: (language: AppLanguage) => void;
  setSidebarOpen: (sidebarOpen: boolean) => void;
  resetPreferences: () => void;
};

const defaultPreferences = appPreferencesSchema.parse({});

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      resetPreferences: () => set(defaultPreferences),
    }),
    {
      name: "gossipai-app-store",
      storage: persistStorage,
      partialize: ({ theme, language, sidebarOpen }) => ({
        theme,
        language,
        sidebarOpen,
      }),
    },
  ),
);
