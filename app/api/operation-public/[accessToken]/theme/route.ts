import { NextResponse } from "next/server";
import { defaultTheme, getUiTheme } from "@/lib/ui-theme";
import { getPublicOperationAccess } from "@/lib/operation-public-access";

type RouteContext = { params: Promise<{ accessToken: string }> };
export async function GET(_request: Request, { params }: RouteContext) {
  const { accessToken } = await params;
  const access = await getPublicOperationAccess(accessToken);
  if (!access) return NextResponse.json({ error: "Not found" }, { status: 404, headers: { "cache-control": "no-store" } });
  return NextResponse.json(await getUiTheme(access.organizationId).catch(() => defaultTheme), { headers: { "cache-control": "no-store" } });
}
