import { type NextRequest, NextResponse } from "next/server";
import { requestIdFrom } from "@/lib/observability";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function forbidden(requestId: string, message: string) {
  return NextResponse.json(
    { error: message, requestId },
    {
      status: 403,
      headers: {
        "cache-control": "no-store",
        "x-request-id": requestId,
      },
    },
  );
}

export function proxy(request: NextRequest) {
  const requestId = requestIdFrom(request);
  const method = request.method.toUpperCase();

  if (MUTATING_METHODS.has(method)) {
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite === "cross-site") {
      return forbidden(requestId, "Cross-site request blocked");
    }

    const origin = request.headers.get("origin");
    if (origin) {
      let suppliedOrigin: string;
      try {
        suppliedOrigin = new URL(origin).origin;
      } catch {
        return forbidden(requestId, "Invalid request origin");
      }
      if (suppliedOrigin !== request.nextUrl.origin) {
        return forbidden(requestId, "Request origin is not allowed");
      }
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-request-id", requestId);
  response.headers.set("cache-control", "no-store");
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
