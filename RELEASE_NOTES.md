# v0.19.0-rc.53 — Local Font Build Reliability

## Baseline
- Continued from the complete v0.19.0-rc.52 release ZIP, which remains the rollback checkpoint.

## Root cause and fix
- Vercel reached the Next.js production compilation stage, then Google returned HTTP 404 for all requested Space Grotesk 500, 600, and 700 font resources.
- Turbopack's repeated `@vercel/turbopack-next/internal/font/google/font` module errors were downstream consequences of those failed build-time downloads.
- The root layout now loads repository-owned variable Inter and Space Grotesk webfonts through `next/font/local`, removing Google font requests from the production build.
- The existing font families, CSS variables, design weights, extended-Latin coverage, display strategy, and fallback stack are preserved.
- The bundled upstream font license notices are included beside the assets.

## Regression protection
- The existing UI contract now rejects `next/font/google` imports and verifies both local font assets and their license notices.

## Scope
No CSS, dependency, database migration, API, authorization rule, permission, layout, visual direction, or business workflow changed.

Rollback checkpoint: **v0.19.0-rc.52**.
