import { NextResponse } from "next/server";
import { requestIdFrom } from "@/lib/observability";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  return NextResponse.json(
    { service: "bar-ops", status: "alive", requestId },
    { headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
