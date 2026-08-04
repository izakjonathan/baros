import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { elapsedMilliseconds, logServerError, logServerEvent, requestIdFrom } from "@/lib/observability";
import { publicReleaseInfo, releaseHeaders } from "@/lib/release";

export const dynamic = "force-dynamic";
const TIMEOUT_MS = 4_000;

export async function GET(request: Request) {
  const startedAt = performance.now();
  const requestId = requestIdFrom(request);
  const headers = { "cache-control": "no-store", "x-request-id": requestId, ...releaseHeaders() };
  const release = publicReleaseInfo();
  if (!process.env.DATABASE_URL) {
    const durationMs = elapsedMilliseconds(startedAt);
    logServerEvent("health.readiness", { requestId, status: "not-ready", database: "not-configured", durationMs });
    return NextResponse.json({ ...release, status: "not-ready", database: "not-configured", durationMs, requestId }, { status: 503, headers });
  }
  try {
    await Promise.race([
      db()`select 1 as ok`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("HEALTH_CHECK_TIMEOUT")), TIMEOUT_MS)),
    ]);
    const durationMs = elapsedMilliseconds(startedAt);
    logServerEvent("health.readiness", { requestId, status: "ready", database: "reachable", durationMs });
    return NextResponse.json({ ...release, status: "ready", database: "reachable", durationMs, requestId }, { headers });
  } catch (error) {
    const durationMs = elapsedMilliseconds(startedAt);
    logServerError(error, { requestId, path: "/api/health/ready", operation: "readiness-check", durationMs });
    return NextResponse.json({ ...release, status: "not-ready", database: "unreachable", durationMs, requestId }, { status: 503, headers });
  }
}
