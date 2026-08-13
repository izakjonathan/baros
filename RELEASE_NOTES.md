# Bar Ops v0.19.0-rc.23 — Mobile/iPhone/iPad Micro-Polish

Baseline: v0.19.0-rc.22.

## Scope
This release performs a focused responsive polish pass across the shared interaction layer and employee workspace. It preserves the approved black/pastel direction, existing workflows, APIs, permissions, and feature behavior.

## Changes
- Prevents iOS text-size inflation from changing the intended interface hierarchy.
- Standardizes native date/time/month/datetime controls to a 16px mobile input size to avoid Safari focus zoom while retaining intrinsic-control containment.
- Adds scroll margin/padding so focused controls and validation content have clearance above the Safari keyboard/browser chrome.
- Reinforces `min-inline-size: 0` on paired and grid-based form fields so native controls cannot force mobile overflow.
- Improves mobile dialog/body overscroll containment and momentum scrolling.
- Adds extra employee-page bottom clearance for Safari toolbar/safe-area overlap.
- Tightens Employee Schedule action-row spacing without changing the 34px action-height contract.
- Adds an iPad/tablet gutter pass for manager and employee workspaces without changing desktop layout.

## Database
No migration required.
