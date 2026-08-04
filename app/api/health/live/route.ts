import { NextResponse } from "next/server";
import { requestIdFrom } from "@/lib/observability";
import { publicReleaseInfo, releaseHeaders } from "@/lib/release";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  return NextResponse.json(
    { ...publicReleaseInfo(), status: "alive", requestId },
    { headers: { "cache-control": "no-store", "x-request-id": requestId, ...releaseHeaders() } },
  );
}
