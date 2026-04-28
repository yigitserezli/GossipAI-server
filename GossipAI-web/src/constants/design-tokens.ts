export type DesignTokens = {
  colors: {
    background: string;
    surface: string;
    surfaceLow: string;
    surfaceHigh: string;
    onBackground: string;
    onSurface: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
    primary: string;
    primaryContainer: string;
    secondary: string;
    secondaryContainer: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    containerPadding: string;
  };
  radius: {
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  typography: {
    h1Size: string;
    h1LineHeight: string;
    h2Size: string;
    h2LineHeight: string;
    bodySize: string;
    bodyLineHeight: string;
    captionSize: string;
  };
};

export const MOBILE_DESIGN_TOKENS: DesignTokens = {
  colors: {
    background: "#131313",
    surface: "#17111E",
    surfaceLow: "#120B1A",
    surfaceHigh: "#201f1f",
    onBackground: "#e5e2e1",
    onSurface: "#e5e2e1",
    onSurfaceVariant: "#cec3d3",
    outline: "#978d9c",
    outlineVariant: "#4b4451",
    primary: "#dcb8ff",
    primaryContainer: "#c792ff",
    secondary: "#d0c0e5",
    secondaryContainer: "#4d4160",
  },
  spacing: {
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
    containerPadding: "20px",
  },
  radius: {
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
  typography: {
    h1Size: "clamp(3rem, 11vw, 6.5rem)",
    h1LineHeight: "0.92",
    h2Size: "clamp(2rem, 6vw, 3.75rem)",
    h2LineHeight: "1.02",
    bodySize: "16px",
    bodyLineHeight: "24px",
    captionSize: "14px",
  },
};
