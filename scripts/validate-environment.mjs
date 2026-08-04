const production = process.env.NODE_ENV === "production";
const errors = [];
const warnings = [];
if (production && !process.env.DATABASE_URL) errors.push("DATABASE_URL is required in production");
if (production && process.env.DEV_AUTH_ENABLED === "true") errors.push("DEV_AUTH_ENABLED must not be true in production");
if (production && !process.env.APP_URL) errors.push("APP_URL is required in production");
if (process.env.SESSION_TTL_DAYS && (!Number.isFinite(Number(process.env.SESSION_TTL_DAYS)) || Number(process.env.SESSION_TTL_DAYS) < 1)) errors.push("SESSION_TTL_DAYS must be a positive number");
if (!production && !process.env.DATABASE_URL) warnings.push("DATABASE_URL is not set; database-backed routes will be unavailable");
for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) { for (const error of errors) console.error(`ERROR: ${error}`); process.exit(1); }
console.log("Environment validation passed");
