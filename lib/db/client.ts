import postgres from "postgres";

const globalForDb = globalThis as typeof globalThis & { __barOpsSql?: ReturnType<typeof postgres> };

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  if (!globalForDb.__barOpsSql) {
    globalForDb.__barOpsSql = postgres(url, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 15, max_lifetime: 60 * 30, connection: { application_name: "baros-vercel" } });
  }
  return globalForDb.__barOpsSql;
}
