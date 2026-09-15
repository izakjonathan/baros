import type { CSSProperties } from "react";
import { db } from "@/lib/db/client";
import { ApiError } from "@/lib/http";

export type UiTheme = { canvasColor: string; inkColor: string; updatedAt: string | null };

const defaultTheme: UiTheme = { canvasColor: "#fff4c4", inkColor: "#000000", updatedAt: null };
const hexColor = /^#[0-9a-f]{6}$/i;

export function normalizeUiColor(value: unknown, field: string) {
  const color = String(value ?? "").trim();
  if (!hexColor.test(color)) throw new ApiError(400, `${field} must be a six-digit hex color`);
  return color.toLowerCase();
}

export function themeCustomProperties(theme: UiTheme): CSSProperties {
  return {
    "--ui-canvas": theme.canvasColor,
    "--ui-ink": theme.inkColor,
  } as CSSProperties;
}

export async function getUiTheme(organizationId?: string | null): Promise<UiTheme> {
  if (!organizationId) return defaultTheme;
  try {
    const [row] = await db()<Array<{ canvas_color: string; ink_color: string; updated_at: Date }>>`
      select canvas_color, ink_color, updated_at
      from organization_ui_themes
      where organization_id=${organizationId}
      limit 1
    `;
    return row ? { canvasColor: row.canvas_color, inkColor: row.ink_color, updatedAt: row.updated_at.toISOString() } : defaultTheme;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "42P01") return defaultTheme;
    throw error;
  }
}

export { defaultTheme };
