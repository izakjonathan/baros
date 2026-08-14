# Bar Ops — Intentional Exception Register

This register protects product-specific decisions from being “corrected” into generic SaaS conventions.

| ID | Decision to preserve | General convention it differs from | Bar Ops reason | Guardrail |
|---|---|---|---|---|
| EX-01 | Operational density | Large whitespace and presentation-heavy dashboards | Staff make repeated decisions during live shifts | Density must remain readable and touch-safe |
| EX-02 | Fast manager shell | Route-per-module enterprise navigation | Rapid switching is valuable during service | Architectural extraction must not slow navigation |
| EX-03 | Bartender as employee/shift role | One top-level auth role per job title | Account authority and assigned shift role are separate | Document terminology in permissions and UI |
| EX-04 | Draft shifts use muted styling and dotted border without a pill | Explicit status badge on every record | Reduces redundant visual noise | Draft state must remain unmistakable |
| EX-05 | Horizontally scrollable day columns on phone | Stacked daily list | Weekly context is operationally useful | Columns must be close, readable, and shrink-safe |
| EX-06 | End time at or before start means next day | Same-day time assumptions | Bars routinely work past midnight | Add DST and timezone tests |
| EX-07 | Native date picker with component-owned visible label | Fully browser-rendered date text | iOS Safari internal date text proved unstable | Keep native control accessible and synchronized |
| EX-08 | Narrow reporting scope | Broad analytics platform | Trustworthy operational data comes first | No analytics expansion before source verification |
| EX-09 | Functional color coding | Neutral monochrome enterprise UI | Fast recognition supports operational use | Preserve contrast and avoid decorative overload |
| EX-10 | Screen-specific mobile composition | Uniform responsive component structure | Different workflows need different phone layouts | Exceptions must remain locally owned |
| EX-11 | Browser-persisted development data | Production-only repository | Allows UI work without PostgreSQL | Must be impossible in production and isolated over time |
| EX-12 | No shadows, gradients, glow, or decorative effects | Trend-led dashboard styling | Restrained presentation supports clarity | Use type, color, spacing, and shape for hierarchy |
| EX-13 | Compact controls and summaries | Large card-based mobile layouts | More operational context should fit above the fold | Maintain 44px touch targets where applicable |
| EX-14 | Shared manager access to live operational modules | Strictly narrow role dashboards | Multiple management roles need situational awareness | Action authority must still be capability-filtered |
| EX-15 | Reporting is a later phase | Analytics delivered alongside transactions | Data integrity and workflow adoption take priority | Record implemented/deferred status explicitly |
| EX-16 | `app/global-error.tsx` keeps minimal inline emergency styles | All visual styling normally comes from global CSS except Shift Plan | A Next.js root error boundary can replace the root layout, so the normal global stylesheet is not guaranteed to be available when this boundary renders | Keep the inline style minimal, static, non-theme-specific, and limited to the root error boundary |

## Browser-specific exception: native date controls

The approved pattern is:

- retain a real native input;
- keep it focusable, interactive, labelled, and connected to form state;
- use it as an invisible interaction layer only where Safari’s internal text is unstable;
- render the visible date in a component-owned element;
- do not rely on fragile WebKit internal text alignment;
- do not clip the parent to hide overflow;
- use shrink-safe grid tracks and `min-inline-size: 0`;
- verify with iPhone Safari, keyboard navigation, zoom, and VoiceOver.

This is a documented workaround, not a general license to hide native controls.

## CSS exception rule

A browser workaround may use a narrowly scoped override when:

1. the browser defect is reproduced;
2. the root cause is documented;
3. the component owns the workaround;
4. the rule does not globally alter unrelated controls;
5. a focused regression guard exists;
6. physical-device verification is recorded.

Historical corrective overrides are not automatically intentional exceptions.

## Root error boundary styling exception

`app/global-error.tsx` is the only intentional styling exception to the global-CSS/Shift-Plan rule. The root error boundary replaces the root layout during a catastrophic render failure, so the normal global stylesheet cannot be treated as a reliable dependency. Its inline styles must remain minimal and must not evolve into a parallel design system.
