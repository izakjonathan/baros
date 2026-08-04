import { randomUUID } from "node:crypto";

export type LogContext = Record<string, unknown>;

export function requestIdFrom(request?: Request) {
  const supplied = request?.headers.get("x-request-id")?.trim();
  return supplied && supplied.length <= 128 && /^[A-Za-z0-9._:-]+$/.test(supplied) ? supplied : randomUUID();
}

export function logServerError(error: unknown, context: LogContext = {}) {
  const normalized = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { name: "UnknownError", message: String(error) };
  console.error(JSON.stringify({ level: "error", timestamp: new Date().toISOString(), ...context, error: normalized }));
}
