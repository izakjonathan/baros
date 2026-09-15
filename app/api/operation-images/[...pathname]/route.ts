import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ pathname: string[] }> };

export async function GET(request: Request, { params }: RouteContext) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const { pathname: segments } = await params;
  const pathname = segments.join("/");
  const prefix = `operation/${user.organizationId}/`;
  if (!pathname.startsWith(prefix)) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  const blob = await get(pathname, {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") || undefined,
  });
  if (!blob) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  if (blob.statusCode === 304) return new NextResponse(null, { status: 304, headers: { ETag: blob.blob.etag, "Cache-Control": "private, no-cache" } });

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      ETag: blob.blob.etag,
      "Cache-Control": "private, no-cache",
    },
  });
}
