import type { CSSProperties } from "react";

export type UiTheme = { canvasColor: string; inkColor: string; accentColor: string; positiveColor: string; updatedAt: string | null };

export const defaultTheme: UiTheme = { canvasColor: "#fff4c4", inkColor: "#000000", accentColor: "#bb533f", positiveColor: "#78a353", updatedAt: null };

export function operationThemeCustomProperties(theme: UiTheme): CSSProperties {
  return {
    "--op-canvas": theme.canvasColor,
    "--op-ink": theme.inkColor,
    "--op-accent": theme.accentColor,
    "--op-positive": theme.positiveColor,
  } as CSSProperties;
}
