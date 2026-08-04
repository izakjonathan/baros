import packageJson from "@/package.json";

const UNKNOWN = "unknown";

function clean(value: string | undefined, maxLength: number) {
  const normalized = value?.trim();
  if (!normalized) return UNKNOWN;
  return normalized.slice(0, maxLength).replace(/[^A-Za-z0-9._/-]/g, "-");
}

export const releaseInfo = Object.freeze({
  service: "bar-ops",
  version: packageJson.version,
  environment: clean(process.env.VERCEL_ENV ?? process.env.NODE_ENV, 32),
  commit: clean(process.env.VERCEL_GIT_COMMIT_SHA, 40),
  deployment: clean(process.env.VERCEL_DEPLOYMENT_ID, 96),
});

export function publicReleaseInfo() {
  return {
    service: releaseInfo.service,
    version: releaseInfo.version,
    environment: releaseInfo.environment,
    commit: releaseInfo.commit === UNKNOWN ? UNKNOWN : releaseInfo.commit.slice(0, 12),
  };
}

export function releaseHeaders() {
  return {
    "x-bar-ops-version": releaseInfo.version,
    "x-bar-ops-commit": releaseInfo.commit === UNKNOWN ? UNKNOWN : releaseInfo.commit.slice(0, 12),
  };
}
