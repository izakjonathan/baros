# Validation Log — v0.11.0

## Scope

Employee self-service lifecycle and manager review only.

## Automated validation

- `npm run test:v0110-self-service`
- `npm run test:all`
- JavaScript syntax checks for test scripts
- ZIP integrity check

## Environment limitation

Dependency-backed Next.js build, TypeScript and ESLint validation are left to GitHub/Vercel because installed dependencies are not bundled with the baseline workspace.
