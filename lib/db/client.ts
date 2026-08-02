import postgres from "postgres";

declare global { var __barOpsSql: ReturnType<typeof postgres> | undefined; }

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  if (!global.__barOpsSql) {
    global.__barOpsSql = postgres(url, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 15, max_lifetime: 60 * 30, connection: { application_name: "baros-vercel" } });
  }
  return global.__barOpsSql;
}
