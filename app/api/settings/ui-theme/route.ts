import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { ApiError, jsonError, readJsonObject } from "@/lib/http";
import { getUiTheme, normalizeUiColor } from "@/lib/ui-theme";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    return NextResponse.json(await getUiTheme(user.organizationId), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "42P01") {
      return jsonError(new ApiError(503, "UI Studio is not ready. Run database migration 020_organization_ui_theme.sql."), request);
    }
    return jsonError(error, request);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser(["OWNER"]);
    const body = await readJsonObject(request);
    const canvasColor = normalizeUiColor(body.canvasColor, "Canvas color");
    const inkColor = normalizeUiColor(body.inkColor, "Ink color");
    const accentColor = normalizeUiColor(body.accentColor, "Accent color");
    const positiveColor = normalizeUiColor(body.positiveColor, "Positive color");
    if (canvasColor === inkColor) throw new ApiError(400, "Canvas and ink colors must be different");
    const before = await getUiTheme(user.organizationId);
    const [theme] = await db()<Array<{ canvas_color: string; ink_color: string; accent_color: string; positive_color: string; updated_at: Date }>>`
      insert into organization_ui_themes(organization_id, canvas_color, ink_color, accent_color, positive_color, updated_by, updated_at)
      values(${user.organizationId}, ${canvasColor}, ${inkColor}, ${accentColor}, ${positiveColor}, ${user.userId}, now())
      on conflict (organization_id) do update set
        canvas_color=excluded.canvas_color,
        ink_color=excluded.ink_color,
        accent_color=excluded.accent_color,
        positive_color=excluded.positive_color,
        updated_by=excluded.updated_by,
        updated_at=now()
      returning canvas_color, ink_color, accent_color, positive_color, updated_at
    `;
    const next = { canvasColor: theme.canvas_color, inkColor: theme.ink_color, accentColor: theme.accent_color, positiveColor: theme.positive_color, updatedAt: theme.updated_at.toISOString() };
    await db()`
      insert into audit_logs(organization_id, actor_user_id, action, entity_type, entity_id, before_data, after_data)
      values(${user.organizationId}, ${user.userId}, 'UI_THEME_UPDATED', 'organization_ui_theme', ${user.organizationId}, ${JSON.stringify(before)}::jsonb, ${JSON.stringify(next)}::jsonb)
    `;
    return NextResponse.json(next, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "42P01") {
      return jsonError(new ApiError(503, "UI Studio is not ready. Run database migration 020_organization_ui_theme.sql."), request);
    }
    return jsonError(error, request);
  }
}
