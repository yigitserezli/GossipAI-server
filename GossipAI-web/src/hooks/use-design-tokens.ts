"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { MOBILE_DESIGN_TOKENS } from "@/constants/design-tokens";

export function useDesignTokens() {
  const tokens = MOBILE_DESIGN_TOKENS;

  const cssVars = useMemo(
    () =>
      ({
        "--dt-bg": tokens.colors.background,
        "--dt-surface": tokens.colors.surface,
        "--dt-surface-low": tokens.colors.surfaceLow,
        "--dt-surface-high": tokens.colors.surfaceHigh,
        "--dt-on-bg": tokens.colors.onBackground,
        "--dt-on-surface": tokens.colors.onSurface,
        "--dt-on-surface-variant": tokens.colors.onSurfaceVariant,
        "--dt-outline": tokens.colors.outline,
        "--dt-outline-variant": tokens.colors.outlineVariant,
        "--dt-primary": tokens.colors.primary,
        "--dt-primary-container": tokens.colors.primaryContainer,
        "--dt-secondary": tokens.colors.secondary,
        "--dt-secondary-container": tokens.colors.secondaryContainer,
        "--dt-space-container": tokens.spacing.containerPadding,
        "--dt-radius-lg": tokens.radius.lg,
        "--dt-radius-xl": tokens.radius.xl,
        "--dt-h1-size": tokens.typography.h1Size,
        "--dt-h1-line": tokens.typography.h1LineHeight,
        "--dt-h2-size": tokens.typography.h2Size,
        "--dt-h2-line": tokens.typography.h2LineHeight,
      }) as CSSProperties,
    [tokens]
  );

  return { tokens, cssVars };
}
