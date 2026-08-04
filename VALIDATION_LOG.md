# Validation Log

## Release

v0.16.9.1 — Session Cookie TypeScript Hotfix

## Baseline

v0.16.7 — Production Hardening VII & VIII

## Passed

- Shared session cookie options retain literal Next.js-compatible `sameSite` and `priority` types
- Invalid widened string cookie options are absent

- v0.16.4 Request Boundary Protection regression
- v0.16.5 Configuration Integrity regression
- v0.16.6 Session Lifecycle Hardening regression
- v0.16.7 CI Runtime Alignment regression
- v0.16.8 API Payload Integrity regression
- v0.16.9 Database Operations Guardrails regression
- Confirmed `public/sw.js` is present
- Confirmed `public/offline.html` is absent
- Confirmed `vercel.json` is absent
- ZIP archive integrity

## Source review

- Shared JSON parsing no longer uses unbounded `Request.json()`.
- Streamed byte counts enforce maximum body sizes when `Content-Length` is missing.
- Database migrations acquire and release a PostgreSQL advisory lock.
- Database administration and quality workflows both target Node.js 24.

## Not run in this environment

- Full dependency installation
- ESLint
- TypeScript compiler
- Complete Next.js production build
- Live PostgreSQL migration concurrency test
- Vercel deployment

These dependency- and infrastructure-backed gates must run through GitHub Actions, Vercel and the managed PostgreSQL environment.
