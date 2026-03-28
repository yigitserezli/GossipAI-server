"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Global hidden shortcut for admin panel access.
 * Handles macOS Option+G across different keyboard layouts.
 */
export function AdminShortcutListener() {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return;

      const key = event.key?.toLowerCase();
      const isAdminShortcut = event.code === "KeyG" || key === "g" || key === "©";

      if (!isAdminShortcut) return;

      event.preventDefault();
      router.push("/admin");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return null;
}
