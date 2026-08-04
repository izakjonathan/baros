# Validation Log — v0.11.4

## Baseline

- v0.11.3 Request Targeting and Monthly Availability

## Passed

- `npm run test:all`
- v0.11.3 request and availability regression suite
- v0.11.4 monthly availability SQL-type regression suite
- Package JSON parsing
- ZIP integrity validation

## Attempted but blocked

- `npm run typecheck`

The project ZIP contains no installed dependencies. TypeScript therefore cannot resolve React, Next.js, postgres, or Node type packages. The Vercel dependency-backed build remains the authoritative production typecheck for this release.

## Database

No migration is included or required.
