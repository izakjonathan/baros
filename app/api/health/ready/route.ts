import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { logServerError, requestIdFrom } from "@/lib/observability";

export const dynamic = "force-dynamic";
const TIMEOUT_MS = 4_000;

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  const headers = { "cache-control": "no-store", "x-request-id": requestId };
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ service: "bar-ops", status: "not-ready", database: "not-configured", requestId }, { status: 503, headers });
  }
  try {
    await Promise.race([
      db()`select 1 as ok`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("HEALTH_CHECK_TIMEOUT")), TIMEOUT_MS)),
    ]);
    return NextResponse.json({ service: "bar-ops", status: "ready", database: "reachable", requestId }, { headers });
  } catch (error) {
    logServerError(error, { requestId, path: "/api/health/ready", operation: "readiness-check" });
    return NextResponse.json({ service: "bar-ops", status: "not-ready", database: "unreachable", requestId }, { status: 503, headers });
  }
}
