import { randomUUID } from "node:crypto";
import { releaseInfo } from "@/lib/release";

export type LogContext = Record<string, unknown>;

type LogLevel = "info" | "warn" | "error";

export function requestIdFrom(request?: Request) {
  const supplied = request?.headers.get("x-request-id")?.trim();
  return supplied && supplied.length <= 128 && /^[A-Za-z0-9._:-]+$/.test(supplied) ? supplied : randomUUID();
}

function writeLog(level: LogLevel, event: string, context: LogContext = {}) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    service: releaseInfo.service,
    version: releaseInfo.version,
    environment: releaseInfo.environment,
    commit: releaseInfo.commit,
    ...context,
  };
  const serialized = JSON.stringify(payload);
  if (level === "error") console.error(serialized);
  else if (level === "warn") console.warn(serialized);
  else console.info(serialized);
}

export function logServerEvent(event: string, context: LogContext = {}) {
  writeLog("info", event, context);
}

export function logServerError(error: unknown, context: LogContext = {}) {
  const normalized = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { name: "UnknownError", message: String(error) };
  writeLog("error", "server.error", { ...context, error: normalized });
}

export function elapsedMilliseconds(startedAt: number) {
  return Math.max(0, Math.round(performance.now() - startedAt));
}
