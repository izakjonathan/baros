import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) { super(message); }
}
export function jsonError(error: unknown) {
  if (error instanceof ApiError) return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
