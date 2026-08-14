"use client";

import { useTheme } from "@/context/ThemeContext";

export const dashPanel = "overflow-hidden rounded-2xl border";

export function useDashTheme() {
  const { getColor, getGradient } = useTheme();

  return {
    DASH_BG: getColor("background"),
    DASH_SURFACE: getColor("surface"),
    DASH_BORDER: getColor("border"),
    DASH_TEXT: getColor("primaryText"),
    DASH_MUTED: getColor("mutedText"),
    DASH_GREEN: getColor("primary"),
    DASH_GREEN_DARK: getColor("secondary"),
    DASH_ICON_BORDER: getColor("border"),
    DASH_PILL: getColor("primaryLight"),
    DASH_BTN: getGradient("primaryButton"),
    DASH_TAB: getGradient("primaryButton"),
    DASH_ACCENT: getColor("accent"),
  };
}
