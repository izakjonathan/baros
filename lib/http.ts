import { NextResponse } from "next/server";
import { logServerError, requestIdFrom } from "@/lib/observability";
import { isRateLimitError } from "@/lib/security/rate-limit";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) { super(message); }
}
export function jsonError(error: unknown, request?: Request) {
  const requestId = requestIdFrom(request);
  const headers = { "x-request-id": requestId, "cache-control": "no-store" };
  if (isRateLimitError(error)) return NextResponse.json({ error: "Too many requests. Try again later.", requestId }, { status: 429, headers: { ...headers, "retry-after": String(error.retryAfterSeconds) } });
  if (error instanceof ApiError) return NextResponse.json({ error: error.message, details: error.details, requestId }, { status: error.status, headers });
  logServerError(error, { requestId, path: request ? new URL(request.url).pathname : undefined });
  return NextResponse.json({ error: "Internal server error", requestId }, { status: 500, headers });
}
export async function readJsonObject(request: Request, maxBytes = 32_000): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > maxBytes) throw new ApiError(413, "Request body is too large");
  const value = await request.json().catch(() => { throw new ApiError(400, "Invalid JSON body"); });
  if (!value || Array.isArray(value) || typeof value !== "object") throw new ApiError(400, "JSON object required");
  return value as Record<string, unknown>;
}
export function requiredString(body: Record<string, unknown>, key: string, max = 200) {
  const value = String(body[key] ?? "").trim();
  if (!value) throw new ApiError(400, `${key} is required`);
  if (value.length > max) throw new ApiError(400, `${key} is too long`);
  return value;
}
export function optionalString(body: Record<string, unknown>, key: string, max = 500) {
  if (body[key] == null || body[key] === "") return null;
  const value = String(body[key]).trim();
  if (value.length > max) throw new ApiError(400, `${key} is too long`);
  return value;
}
export function uuid(value: unknown, key = "id") {
  const text = String(value || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) throw new ApiError(400, `${key} must be a UUID`);
  return text;
}
export function isoDate(value: unknown, key: string) {
  const text = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(`${text}T00:00:00Z`))) throw new ApiError(400, `${key} must be YYYY-MM-DD`);
  return text;
}
export function finiteNumber(value: unknown, key: string, options: { min?: number; max?: number; integer?: boolean } = {}) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) throw new ApiError(400, `${key} must be a number`);
  if (options.integer && !Number.isInteger(number)) throw new ApiError(400, `${key} must be an integer`);
  if (options.min != null && number < options.min) throw new ApiError(400, `${key} must be at least ${options.min}`);
  if (options.max != null && number > options.max) throw new ApiError(400, `${key} must be at most ${options.max}`);
  return number;
}
export function enumValue<T extends string>(value: unknown, key: string, allowed: readonly T[]): T {
  const text = String(value || "");
  if (!allowed.includes(text as T)) throw new ApiError(400, `${key} is invalid`);
  return text as T;
}
export function objectArray(value: unknown, key: string, max = 250): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw new ApiError(400, `${key} must be an array`);
  if (value.length > max) throw new ApiError(400, `${key} has too many items`);
  if (value.some(item => !item || Array.isArray(item) || typeof item !== "object")) throw new ApiError(400, `${key} contains an invalid item`);
  return value as Record<string, unknown>[];
}
