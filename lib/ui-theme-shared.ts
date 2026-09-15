import type { CSSProperties } from "react";

export type UiTheme = { canvasColor: string; inkColor: string; updatedAt: string | null };

export const defaultTheme: UiTheme = { canvasColor: "#fff4c4", inkColor: "#000000", updatedAt: null };

export function operationThemeCustomProperties(theme: UiTheme): CSSProperties {
  return {
    "--op-canvas": theme.canvasColor,
    "--op-ink": theme.inkColor,
  } as CSSProperties;
}
