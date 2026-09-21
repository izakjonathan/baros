import type { CSSProperties } from "react";

export type UiTheme = { canvasColor: string; inkColor: string; accentColor: string; positiveColor: string; updatedAt: string | null };

export const defaultTheme: UiTheme = { canvasColor: "#fff4c4", inkColor: "#000000", accentColor: "#bb533f", positiveColor: "#78a353", updatedAt: null };

function relativeLuminance(hex: string) {
  const channels = [1, 3, 5].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255).map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function uiColorContrastRatio(first: string, second: string) {
  if (!/^#[0-9a-f]{6}$/i.test(first) || !/^#[0-9a-f]{6}$/i.test(second)) return 0;
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((left, right) => right - left);
  return (lighter + 0.05) / (darker + 0.05);
}

export function operationThemeCustomProperties(theme: UiTheme): CSSProperties {
  return {
    "--op-canvas": theme.canvasColor,
    "--op-ink": theme.inkColor,
    "--op-accent": theme.accentColor,
    "--op-positive": theme.positiveColor,
  } as CSSProperties;
}
