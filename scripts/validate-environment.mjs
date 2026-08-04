const production = process.env.NODE_ENV === "production";
const errors = [];
const warnings = [];

function parseUrl(name, value, protocols) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (!protocols.includes(parsed.protocol)) {
      errors.push(`${name} must use ${protocols.join(" or ")}`);
      return null;
    }
    return parsed;
  } catch {
    errors.push(`${name} must be a valid URL`);
    return null;
  }
}

if (production && !process.env.DATABASE_URL) errors.push("DATABASE_URL is required in production");
if (production && process.env.DEV_AUTH_ENABLED === "true") errors.push("DEV_AUTH_ENABLED must not be true in production");
if (production && !process.env.APP_URL) errors.push("APP_URL is required in production");

const databaseUrl = parseUrl("DATABASE_URL", process.env.DATABASE_URL, ["postgres:", "postgresql:"]);
const appUrl = parseUrl("APP_URL", process.env.APP_URL, ["http:", "https:"]);

if (production && appUrl && appUrl.protocol !== "https:") errors.push("APP_URL must use https in production");
if (appUrl && (appUrl.username || appUrl.password)) errors.push("APP_URL must not contain credentials");
if (databaseUrl && !databaseUrl.hostname) errors.push("DATABASE_URL must include a hostname");

if (process.env.SESSION_TTL_DAYS) {
  const ttl = Number(process.env.SESSION_TTL_DAYS);
  if (!Number.isInteger(ttl) || ttl < 1 || ttl > 365) errors.push("SESSION_TTL_DAYS must be an integer between 1 and 365");
}

if (process.env.SESSION_COOKIE_NAME && !/^[A-Za-z0-9_-]{1,64}$/.test(process.env.SESSION_COOKIE_NAME)) {
  errors.push("SESSION_COOKIE_NAME must contain only letters, numbers, underscores, or hyphens and be at most 64 characters");
}

if (!production && !process.env.DATABASE_URL) warnings.push("DATABASE_URL is not set; database-backed routes will be unavailable");
if (!production && appUrl?.protocol === "http:" && !["localhost", "127.0.0.1"].includes(appUrl.hostname)) {
  warnings.push("APP_URL uses http outside localhost");
}

for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log("Environment validation passed");
