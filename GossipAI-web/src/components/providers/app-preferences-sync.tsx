"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export function AppPreferencesSync() {
  const theme = useAppStore((state) => state.theme);
  const language = useAppStore((state) => state.language);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const shouldDark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.toggle("dark", shouldDark);
    };

    applyTheme();
    if (theme === "system") {
      media.addEventListener("change", applyTheme);
      return () => media.removeEventListener("change", applyTheme);
    }

    return undefined;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
