import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { defaultTheme, getUiTheme } from "@/lib/ui-theme";

type RouteContext = { params: Promise<{ organizationSlug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { organizationSlug } = await params;
  const [organization] = await db()<Array<{ id: string }>>`
    select id from organizations where slug=${organizationSlug} limit 1
  `;
  if (!organization) return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "cache-control": "no-store" } });

  const theme = await getUiTheme(organization.id).catch(() => defaultTheme);
  return NextResponse.json(theme, { headers: { "cache-control": "no-store" } });
}
