# Phase D — Complete Visual Redesign

## Core design-system principle

The visual redesign uses a layered design-system architecture consisting of primitive tokens, semantic tokens, foundation styles, shared UI primitives and feature-specific product components. Design decisions are globalised through tokens, while component implementation remains locally scoped through CSS Modules. Components control their internal presentation, while parent layouts control external spacing and placement.


## Approved visual brief

The detailed visual source of truth is `docs/phase-d-visual-design-system.md`. All Phase D product components must use its semantic palette, typography, surface, card, icon and spacing rules while preserving the stable contracts below.

## Stable contracts

Phase D preserves APIs, database schemas, permissions, tenant boundaries, authentication, operational terminology, URLs and existing business workflows unless a separate change is explicitly approved.

## Planned sequence

1. v0.18.0 Design System Foundation
2. v0.18.1 Application Shell & Navigation
3. v0.18.2 Dashboard & Overview
4. v0.18.3 Scheduling
5. v0.18.4 Employees & Team
6. v0.18.5 Time & Attendance
7. v0.18.6 Payroll
8. v0.18.7 Inventory & Orders
9. v0.18.8 Daily Operations & Settings
10. v0.18.9 Employee Workspace
11. v0.18.10 Responsive, Accessibility & Interaction Polish
12. v0.18.11 Visual Consistency & Regression
13. v0.18.12 Redesign Stabilization & Release Candidate
