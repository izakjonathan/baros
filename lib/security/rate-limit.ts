import { db } from "@/lib/db/client";

export class RateLimitError extends Error {
  readonly status = 429;
  constructor(public readonly retryAfterSeconds: number) {
    super("RATE_LIMITED");
    this.name = "RateLimitError";
  }
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError || (
    error instanceof Error &&
    error.name === "RateLimitError" &&
    Number.isFinite(Number((error as Error & { retryAfterSeconds?: number }).retryAfterSeconds))
  );
}

export async function enforceRateLimit(key: string, limit = 10, windowSeconds = 60) {
  const [row] = await db()<Array<{ count: number | string; expires_at: Date | string }>>`
    insert into rate_limit_buckets(key,count,window_started_at,expires_at)
    values(${key},1,now(),now()+(${windowSeconds}||' seconds')::interval)
    on conflict(key) do update set
      count=case when rate_limit_buckets.expires_at<now() then 1 else rate_limit_buckets.count+1 end,
      window_started_at=case when rate_limit_buckets.expires_at<now() then now() else rate_limit_buckets.window_started_at end,
      expires_at=case when rate_limit_buckets.expires_at<now() then now()+(${windowSeconds}||' seconds')::interval else rate_limit_buckets.expires_at end
    returning count,expires_at
  `;
  const remaining = Math.max(1, Math.ceil((new Date(row.expires_at).getTime() - Date.now()) / 1000));
  if (Number(row.count) > limit) throw new RateLimitError(remaining);
  return { remaining: Math.max(0, limit - Number(row.count)), resetAfterSeconds: remaining };
}
