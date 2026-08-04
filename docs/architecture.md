# Bar Ops Architecture

## Current boundary

Bar Ops uses Next.js App Router. Route files in `app/` own routing, metadata and HTTP handlers. Reusable server concerns live in `lib/`; reusable interface primitives live in `components/ui/`; operational domain contracts and pure workspace logic live in `features/`.

## Redesign-safe layers

- `app/`: routes, layouts, route handlers and page composition.
- `features/workspace/`: shared workspace domain contracts and pure schedule calculations.
- `components/ui/`: reusable interaction and workspace primitives.
- `components/`: composed feature/workspace interfaces.
- `lib/auth`, `lib/security`, `lib/db`, `lib/services`: production infrastructure and business safeguards.
- `app/mono-tokens.css`: canonical visual tokens for the current design and the Phase D redesign.

## Stability boundaries for Phase D

The redesign may change component presentation, tokens, responsive composition and motion. It must preserve routes, API contracts, role permissions, organization/location scoping, persisted data and workflow semantics unless separately approved.

## Refactoring rule

Move code only when it has a clear domain owner or genuine reuse. Avoid mechanical file splitting that adds indirection without reducing responsibility.


## Phase D design-system principle

The visual redesign uses a layered design-system architecture consisting of primitive tokens, semantic tokens, foundation styles, shared UI primitives and feature-specific product components. Design decisions are globalised through tokens, while component implementation remains locally scoped through CSS Modules. Components control their internal presentation, while parent layouts control external spacing and placement.
