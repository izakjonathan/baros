import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { logServerError, requestIdFrom } from "@/lib/observability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  const base = { service: "bar-ops", version: process.env.npm_package_version || "0.16.1", requestId };
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ...base, status: "degraded", database: "not-configured" }, { status: 503, headers: { "cache-control": "no-store", "x-request-id": requestId } });
  }
  try {
    await db()`select 1 as ok`;
    return NextResponse.json({ ...base, status: "ok", database: "reachable" }, { headers: { "cache-control": "no-store", "x-request-id": requestId } });
  } catch (error) {
    logServerError(error, { requestId, path: "/api/health", operation: "health-check" });
    return NextResponse.json({ ...base, status: "unavailable", database: "unreachable" }, { status: 503, headers: { "cache-control": "no-store", "x-request-id": requestId } });
  }
}
