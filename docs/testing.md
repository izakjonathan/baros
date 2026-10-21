# Operation verification

## Reader scroll containment (rc.134)

Article readers lock both document and body scrolling for their lifetime. The article is the single vertical scroll area within a bounded grid row; its overscroll is contained so reaching an edge cannot scroll the background page. Editor and reader locks are reference counted and restore their previous overflow/overscroll values after the last overlay closes.

`npm run test:editor` verifies page locking while a reader and editor overlap, reader scroll-container identity and scrollTop preservation across a remote save, and full scroll-style restoration on close. jsdom cannot reproduce native iPhone momentum/scroll chaining. Device acceptance: repeatedly swipe a long Handbook article in both directions, reach its top/bottom, start gestures near the side margins, allow a remote edit to arrive, and close/reopen it. Confirm the article continues scrolling and the Handbook behind it stays still.

rc.134 verification: regression tests, lint, type checking, environment validation and production build passed. Native iPhone scrolling remains a device acceptance check.

## Live Handbook sync (rc.133)

`npm run test:editor` now mounts two independent OperationModule instances against a mocked saved-article API. One opens the Handbook reader while the other edits and saves an article. Advancing the real subscription callbacks updates the first reader and card without remounting the reader or reloading the page. Coverage includes authenticated and shared-staff endpoint selection, immediate reader-close refresh, temporary errors/retry, pausing while editing, hidden/offline pause/resume, unmount cleanup, overlapping-request prevention and aborting late responses.

Article refresh uses the existing protected GET routes with `scope=articles`, fetching only Handbook/News rather than task, reminder and cash-count data. Signed-in responses are scoped to organization and role; shared responses validate the active, unexpired link first and always use Employee publication rules.

This is two-second polling, plus network time, rather than server push. Tests use jsdom and mocked API data, not physical devices or a live database. Production acceptance: leave an article open on one device, save edits with the checkmark on another, and confirm the open reader and Handbook card update without a reload; repeat through a shared staff link.

rc.133 verification: `npm run test:all`, `npm run lint`, `npm run typecheck`, production-shaped `npm run validate:env`, and `npm run build` passed.

Run before every release:

```bash
npm run test:all
npm run lint
npm run typecheck
NODE_ENV=production DATABASE_URL=postgresql://ci:ci@localhost:5432/barops APP_URL=https://barops.example DEV_AUTH_ENABLED=false npm run validate:env
npm run build
```

`test:operation` protects the established Operation behavior. `test:operation-only` prevents deleted product routes from returning and verifies the owner invitation contract.

After migration 025 is deployed, complete these manual production checks:

1. Owner signs in and lands on `/operation`.
2. Owner creates each role invitation and copies its link.
3. Invitation activates once, rejects reuse, and signs the new account into `/operation`.
4. Manager and Employee accounts see their intended Operation permissions.
5. Shared staff link works without Vercel or application login.
6. Disabled and rotated shared links stop working.
7. Legacy URLs such as `/employee`, `/api/shifts`, and `/api/orders` return 404.

## Apple Notes paste

`npm run test:paste` tests generated clipboard fixtures through the HTML converter and actual Tiptap/ProseMirror schema. It covers semantic headings, iOS styled spans, macOS stylesheet/point sizes, Apple font hints, mixed inline formatting, lists, line breaks, repeat normalization, actual editor paste insertion, Undo/Redo and the storage-parser round trip. Fixtures model supported clipboard shapes; they are not captures from a physical Apple device.

Before release acceptance, copy a real note with Title, Heading, Subheading, Body, a partly bold paragraph, links and lists into the article body on iPhone Safari and macOS Safari. Confirm the Aa menu reports Heading/Subheading, save and reopen the article, and check Undo/Redo and insertion into an existing paragraph. Test copying only one subheading as well as a full note. Plain-text paste should remain body text.

rc.131 verification: `npm run test:all`, `npm run lint`, `npm run typecheck`, production-shaped `npm run validate:env`, and `npm run build` passed. The release ZIP also passed `npm run audit:artifacts`. No live database or physical Apple clipboard was used.

## Editor keyboard toolbar

`npm run test:editor` mounts the real ArticleEditor/Tiptap component in jsdom. It verifies that all eight toolbar controls and the link form render in the footer outside the scroll container; simulated visual viewport resize/scroll events update frame dimensions; touch preserves focus; Subheading/Bold change the selected content; closing the editor restores page scrolling.

The footer is an automatically sized grid row, so article scrolling cannot clip it and the toolbar no longer estimates its top from a fixed rem offset. Existing visual viewport resize/scroll listeners position the whole frame.

jsdom does not perform layout or emulate an iOS keyboard. Browser installation in this session failed with a truncated download, so pixel visibility and physical iPhone Safari behavior remain unverified. On iPhone, edit a long existing note, focus text near the bottom, scroll the note with the keyboard open, apply Heading/Subheading/Bold, open More/Link, dismiss and reopen the keyboard, then rotate the device. The complete toolbar must remain above the keyboard and selections must retain their formatting.

rc.132 verification: `npm run test:all`, `npm run lint`, `npm run typecheck`, production-shaped `npm run validate:env`, and `npm run build` passed. The component mount reports the existing duplicate Link/Underline extension warning; this release does not change the extension setup.
