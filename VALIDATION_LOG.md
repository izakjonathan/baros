# Validation Log — Bar Ops v0.16.15.1

## Passed

- Purchase-order request values are narrowed before SQL interpolation
- Order status is constrained to the database enum
- Delivery date, notes and order number are validated
- Order items use the bounded object-array parser
- v0.16.14 tenant-scope regression
- v0.16.15 transaction-integrity regression
- `public/sw.js` present
- `public/offline.html` absent
- `vercel.json` absent
- Release ZIP integrity

## Not run in this environment

- Clean dependency installation
- ESLint
- TypeScript compilation
- Full Next.js production build
- Vercel deployment

The local npm mirror returned 404 for `@types/node@22.10.2`; Vercel must run the complete dependency-based gates.
