# Accessibility and interaction QA — v0.18.14

## Shared contract

- Every application shell exposes a keyboard-visible skip link to the main workspace.
- Keyboard focus uses one site-wide `:focus-visible` treatment; mouse and touch interaction do not receive persistent outlines.
- Shared dialogs trap Tab and Shift+Tab, close with Escape, lock background scrolling, and restore focus to the opener.
- Mobile sheets must follow the same focus trap, Escape, and restoration behavior.
- Popover triggers expose `aria-expanded` and `aria-controls`; popover surfaces have an accessible name.
- Loading, saving, success, and error feedback use status or alert semantics without duplicating spoken content.
- Busy actions remain disabled until completion to prevent accidental duplicate submissions.
- Motion is reduced when `prefers-reduced-motion` is enabled.
- Controls remain identifiable in Windows forced-colors mode.

## Physical-device acceptance

Automated/source checks cannot verify VoiceOver speech, physical touch accuracy, Safari virtual-keyboard behavior, or focus visibility under every iPhone viewport. The release therefore includes a focused acceptance checklist in `V01814_DEVICE_ACCEPTANCE.md`.
