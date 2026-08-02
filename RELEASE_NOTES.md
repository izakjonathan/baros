# Bar Ops v0.10.0 — Fixed Shell & Compact Operations UI

This release corrects the app-shell and responsive layout issues visible in v0.9.9.

## Fixed application shell

- The manager top navigation is now truly fixed to the viewport.
- Manager pages scroll below the persistent header.
- On mobile, the navigation drawer starts below the fixed header instead of covering or duplicating it.
- The mobile drawer brand block is hidden because the fixed header already provides workspace identity.
- The navigation scrim also starts below the header.

## Shift plan

- The Week/Month/Custom selector has a stable readable width.
- Copy and Add are compact icon actions beside the selector.
- Period navigation and Publish remain in a separate clear toolbar.
- Publish is again a visible labelled primary action rather than an almost invisible paper-plane icon.
- Custom date inputs occupy their own full-width row and cannot overlap the toolbar.
- Mobile controls retain minimum interaction sizes.

## Team

- Employee cards use tighter vertical spacing.
- Identity, scheduled hours, portal status and actions are grouped more closely.
- Status pills are compact.
- Adjacent employee actions are equal-height and use a quieter tonal treatment.

No database migration is required.
