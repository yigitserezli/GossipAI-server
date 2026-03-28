"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export function AppPreferencesSync() {
  const theme = useAppStore((state) => state.theme);
  const language = useAppStore((state) => state.language);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
