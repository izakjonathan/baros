# Bar Ops v0.19.0-rc.2 — staging acceptance matrix

This document is the evidence record for the production acceptance release. A checkbox may only be marked complete after the named workflow has been exercised against the staging deployment with the intended production-like database and authentication configuration.

## Technical gates

- [ ] Clean `npm install --no-audit --no-fund` completes on Node 24.
- [ ] `npm run audit:artifacts` passes before dependency installation.
- [ ] `npm run audit:preflight` passes.
- [ ] `npm run validate:release` passes.
- [ ] `npm run test:all` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] Production environment validation passes with real staging values.
- [ ] `npm run build` completes without warnings that block promotion.
- [ ] `npm run db:verify` passes against the staging database.
- [ ] `/api/health/ready` returns ready after deployment.

## Manager workflows

- [ ] Sign in and select a location.
- [ ] Create, edit, publish and acknowledge a shift.
- [ ] Clock an employee in and out; start and end a break.
- [ ] Submit and approve an attendance correction.
- [ ] Review and approve a timesheet period.
- [ ] Add a product and complete a stock adjustment.
- [ ] Create and receive a purchase order; verify stock movement.
- [ ] Submit and resolve time-off, open-shift and shift-change requests.
- [ ] Add or edit an employee and verify invitation controls.
- [ ] Complete opening/closing tasks and save a manager handover.

## Employee workflows

- [ ] Activate an employee account and sign in.
- [ ] View published shifts and acknowledge the schedule.
- [ ] Claim an open shift.
- [ ] Submit availability, time off and a shift-change request.
- [ ] View hours and submit a correction.
- [ ] Verify notifications and the More sheet.

## Device and browser matrix

- [ ] Current iPhone Safari: portrait and landscape.
- [ ] Desktop Safari.
- [ ] Current Chrome desktop.
- [ ] Keyboard-only navigation on desktop.
- [ ] VoiceOver smoke test on iPhone using `V01814_DEVICE_ACCEPTANCE.md`.

## Failure record

For every failed item, record the route, role, location, steps, expected result, actual result, severity, screenshot or console evidence, and the release that fixes it. Production promotion is blocked by any unresolved critical or high-severity defect.
