import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ pathname: string[] }> };

export async function GET(request: Request, { params }: RouteContext) {
  const user = await getSessionUser();
  const { pathname: segments } = await params;
  const pathname = segments.join("/");
  const matchedPath = /^operation\/([0-9a-f-]{36})\//i.exec(pathname);
  if (!matchedPath) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  const organizationId = matchedPath[1];

  let isPublicArticleImage = false;
  if (user) {
    if (organizationId !== user.organizationId) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } else {
    try {
      const { db } = await import("@/lib/db/client");
      const [article] = await db()<Array<{ id: string }>>`
        select id from operation_articles
        where organization_id=${organizationId} and published=true and content::text like ${`%${pathname}%`}
        limit 1
      `;
      isPublicArticleImage = Boolean(article);
    } catch {
      isPublicArticleImage = false;
    }
    if (!isPublicArticleImage) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const blob = await get(pathname, {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") || undefined,
  });
  if (!blob) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  const cacheControl = isPublicArticleImage ? "public, max-age=300" : "private, max-age=3600";
  if (blob.statusCode === 304) return new NextResponse(null, { status: 304, headers: { ETag: blob.blob.etag, "Cache-Control": cacheControl } });

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": blob.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      ETag: blob.blob.etag,
      "Cache-Control": cacheControl,
    },
  });
}
