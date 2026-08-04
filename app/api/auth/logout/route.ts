import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { requestIdFrom } from "@/lib/observability";

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  await destroySession();
  return NextResponse.json(
    { ok: true, requestId },
    { headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
