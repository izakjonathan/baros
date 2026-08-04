# Validation Log — Bar Ops v0.16.15

## Passed

- v0.16.12 Shared Session Issuance
- v0.16.13 Authentication Endpoint Consistency
- v0.16.14 Authorization & Tenant Scope Integrity
- v0.16.15 Transaction Integrity
- Purchase-order location, supplier and product scope checks present
- Payroll-period location scope check present
- Purchase-order audit write is inside its transaction
- Payroll-period audit write is inside its transaction
- External post-transaction audit calls removed from affected routes
- `public/sw.js` present
- `public/offline.html` absent
- `vercel.json` absent
- Release ZIP integrity

## Not run in this environment

- Clean dependency installation
- ESLint
- TypeScript compilation
- Full Next.js production build
- Live cross-tenant database test
- Live transaction rollback test
- Vercel deployment

These dependency- and infrastructure-based gates must run in GitHub Actions or Vercel.
