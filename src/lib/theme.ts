// Central source of truth for the KALNET identity/status/chart palette.
// Mirrors the CSS custom properties in src/index.css so components that
// need literal color strings (recharts, canvas, inline styles — anything
// that can't consume a Tailwind class) stay in sync with the app's theme
// instead of hand-picking hex values.

export type ThemeMode = "light" | "dark";

const identityLight = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
] as const;

const identityDark = [
  "#3987e5", // blue
  "#199e70", // aqua
  "#c98500", // yellow
  "#2fa62f", // green
  "#9085e9", // violet
  "#e66767", // red
  "#d55181", // magenta
  "#d95926", // orange
] as const;

// Status colors are intentionally mode-invariant (see src/index.css) — a
// solid fill needs to stay dark enough for white text in both modes, and a
// badge tint needs to stay light enough for dark text in both modes.
export const statusColors = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

export function getIdentityPalette(mode: ThemeMode): readonly string[] {
  return mode === "light" ? identityLight : identityDark;
}

/**
 * Stable per-key accent color, hashed from a string (a nav path, a
 * category name, a service type) so the same feature keeps the same
 * identity color everywhere it appears — sidebar icon, KpiCard chip,
 * category tag, chart series. Never hand-pick a hex per usage; always go
 * through this so the mapping stays centralized.
 */
export function getIdentityColor(key: string, mode: ThemeMode = "light"): string {
  const palette = getIdentityPalette(mode);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

export interface ChartColors {
  categorical: readonly string[];
  status: typeof statusColors;
  grid: string;
  axis: string;
}

export function getChartColors(mode: ThemeMode): ChartColors {
  return {
    categorical: getIdentityPalette(mode),
    status: statusColors,
    grid: mode === "light" ? "#e1e0dc" : "#2c2c2a",
    axis: mode === "light" ? "#8a8a86" : "#8a8a86",
  };
}

/**
 * Recharts <Tooltip> style props. `cursor: false` turns off the library's
 * default flat grey hover-cursor rectangle, which is very visible on
 * single/sparse-bar charts and otherwise has to be disabled per-chart.
 */
export function getChartTooltipStyle(mode: ThemeMode) {
  const paper = mode === "light" ? "#ffffff" : "#1d1d1f";
  const border = mode === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const ink = mode === "light" ? "#111111" : "#f5f5f4";
  return {
    contentStyle: {
      backgroundColor: paper,
      border: `1px solid ${border}`,
      borderRadius: 8,
      fontSize: 13,
      boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
    },
    labelStyle: { color: ink, fontWeight: 600 },
    cursor: false as const,
  };
}

/** Reads the app's current theme mode from the .dark class on <html>. */
export function getCurrentThemeMode(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
