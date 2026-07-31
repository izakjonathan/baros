# Bar Ops

Initial Vercel-ready foundation for a bar shift planning and goods ordering platform.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm start
```

## Deploy to Vercel

Import the repository in Vercel or run `vercel --prod` from the project root. Vercel detects Next.js automatically.

## Current scope

This version is a polished frontend prototype with local demo state. It includes the manager dashboard, weekly shift planner, inventory, purchase orders, team directory, responsive navigation, dialogs, filtering and status updates.

## Planned infrastructure

The UI and data types are structured for a later PostgreSQL database, authentication, organization/location tenancy, audit history, notifications and live employee access.
