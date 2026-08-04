# Bar Ops — Phase D Visual Design System Brief

## Status

Approved initial visual direction for Phase D. This brief is the visual source of truth for redesign releases from v0.18.4 onward. It is intentionally a starting system and may be refined through reviewed releases.

## Core architecture principle

The visual redesign uses a layered design-system architecture consisting of primitive tokens, semantic tokens, foundation styles, shared UI primitives and feature-specific product components. Design decisions are globalised through tokens, while component implementation remains locally scoped through CSS Modules. Components control their internal presentation, while parent layouts control external spacing and placement.

## 1. Visual character

Bar Ops should feel graphic, bold, direct and operational rather than neutral or conventionally corporate.

- Light mode uses a beige page background.
- Dark mode uses a black page background.
- Browser top and bottom safe-area regions must match the active page background.
- Typography and colour carry most of the hierarchy.
- Copy is concise. Description text is limited to what supports a decision or task.
- Cards are rounded and colourful, but not decorative for their own sake.
- No shadows, gradients, glow or glass effects.
- Nested cards are used only when they clarify real information hierarchy.

## 2. Approved palette

| Token | Value | Purpose |
|---|---|---|
| Beige | `#FFF4C4` | Light page background, neutral cards and text on black |
| Black | `#000000` | Dark page background, text, borders and filled actions |
| Neon | `#DFEE4B` | Employees and team content |
| Pink | `#F47ADD` | Shifts and scheduling content |
| Blue | `#4E4CED` | Inventory and stock content |
| Orange | `#FEB34A` | Orders and purchasing content |

Colours are semantic. One content family keeps the same identity throughout the application. Mixed-colour dashboards are allowed when each colour continues to represent its established content family.

## 3. Surface rules

- Coloured cards have no border.
- Text on coloured cards is black.
- Neutral cards can use beige fill or no fill with a black border.
- Black surfaces use beige text.
- External screen areas, safe areas and overscroll regions match the page background.
- No component adds a shadow, gradient or glow.

## 4. Typography

- Use bold display typography for page titles, section titles and card headlines.
- Use a clear size and weight hierarchy instead of decorative UI elements.
- Keep supporting labels small, concise and high contrast.
- Avoid long paragraphs inside operational cards.
- Preserve semantic HTML headings while styling them according to their product context.

## 5. Buttons

Approved button forms:

1. Standalone text action.
2. Rounded outline action with transparent fill, black border and black text.
3. Rounded black-filled action with text using the colour of the surface below it where legibility permits.
4. Icon-only action where the meaning is universally clear and an accessible label is provided.

Buttons do not use shadows, gradients or oversized icon decoration.

## 6. Icons

- Use one icon system throughout the product.
- Icons are black, stroked and visually consistent.
- Large decorative icons are not used inside operational cards.
- Small icons may clarify actions or status, but labels remain when meaning is not obvious.

## 7. Cards and grids

- Cards use large rounded corners and compact internal spacing.
- Prefer a two-column grid on capable widths.
- Prefer a compact one-column layout on narrow widths.
- Avoid excess empty space.
- Cards may break the standard grid for genuine data visualisation or workflow reasons.
- Small indicators communicate status without recolouring an entire card unnecessarily.
- Product components such as `ShiftCard`, `EmployeeCard`, `OrderCard` and `StockCard` own their internal presentation.
- Parent layouts own card placement, margins and gaps.

## 8. Content colour identity

- Scheduling and shifts: Pink.
- Employees and team: Neon.
- Inventory and stock: Blue.
- Orders and purchasing: Orange.
- Neutral utilities, filters and settings: Beige, black, or transparent with a black border.

A content family must not change colour arbitrarily between screens.

## 9. Responsive behaviour

- Mobile layouts are intentionally designed, not merely stacked desktop layouts.
- Two-column card grids collapse to one column when information density requires it.
- Controls remain touch-safe.
- Dialog and fixed action areas respect safe-area insets.
- Page background extends into browser top and bottom areas.

## 10. Accessibility

- Black text on coloured cards must retain strong contrast.
- Focus states remain visible without relying on shadows or glow.
- Icon-only actions require accessible names.
- Status is communicated with text or shape in addition to colour.
- Reduced-motion preferences remain supported.
- Touch targets remain at least 44 by 44 CSS pixels where practical.

## 11. Implementation model

1. Primitive tokens: palette, raw spacing, type sizes and radii.
2. Semantic tokens: page, card, employee, shift, inventory, order, text and border roles.
3. Foundation styles: reset, body, typography, focus and safe-area behaviour.
4. Shared primitives: buttons, cards, fields, badges, dialogs and layout helpers.
5. Product components: employee, shift, order, inventory and operational components.

Globalise design decisions. Localise component implementation.

## 12. Phase D review questions

Every redesigned screen should be reviewed against these questions:

- Does each content type use its approved colour identity?
- Is hierarchy led by typography and colour?
- Is copy concise?
- Are cards compact and purposeful?
- Are nested cards avoided unless they improve understanding?
- Are all shadows, gradients and glow absent?
- Are icons from the same black-stroked system?
- Do top, bottom and safe-area regions match the page background?
- Does the layout work intentionally on mobile, iPad and desktop?
- Are existing permissions, data and workflows unchanged?
