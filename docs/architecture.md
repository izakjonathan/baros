# Operation architecture

## Reachable product surfaces

| Surface | Purpose | Access |
| --- | --- | --- |
| `/login` | Account sign-in | Public |
| `/activate/[token]` | Single-use invitation acceptance | Invitation token |
| `/operation` | Home, Handbook, Tasks, Reminders, Count and owner settings | Authenticated account |
| `/operation/public/[accessToken]` | Staff Operation workspace | Active shared token |
| `/api/health/*` | Deployment health | Public, no business data |

The root redirects to `/operation`; authentication redirects unauthenticated users to `/login`.

## Roles

- **Owner**: full Operation content, tasks, UI Studio, shared-link, history and user management.
- **Manager**: authenticated operational task/reminder/count permissions without owner settings.
- **Employee**: authenticated staff access.
- **Shared link**: employee-equivalent Operation access without an individual identity; audit entries remain attributed to the shared link.

## Task body storage and presentation

Task bodies reuse the Handbook Tiptap editor and content renderer. The task form opens the existing full-screen editor in body-only mode; the reader renders the complete body and the card shows a two-line plain-text preview. Handbook links retain the selected task while opening the article reader, allowing return navigation.

`content.ts` owns the versioned `baros:task-body:v1\\n` storage envelope in the existing task/template `description` text column and API field. The shared codec reads unprefixed legacy instructions as body text and validates/normalizes rich bodies through the same supported-content parser as Handbook articles. Create, edit and template writes enforce a 96,000-character rich-body limit within the existing request-size boundary. The schema and recurrence/completion queries are unchanged; no migration is required. Old app versions cannot edit this envelope correctly, so open clients should reload after deployment before editing tasks.

News cards now use the shared safe rich-content renderer instead of flattening saved formatting. The date bar retains a labelled native date input, avoiding a second custom calendar dialog and its keyboard/focus responsibilities. Reference: [CFPB native date-picker pattern](https://cfpb.github.io/design-system/components/date-picker) and [WAI date-picker interaction guidance](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/).

## Data boundary

All Operation queries are scoped by organization and, where the current model provides one, location. Legacy migrations remain in sequence because deleting them would not remove existing database objects safely and would prevent clean migration of established environments.

## Account invitations

Owners create an invitation in Operation Settings. The server stores a SHA-256 token hash, role, organization, optional location and seven-day expiry. Activation runs in one transaction, creates or links the account, creates membership and employee/location records where needed, marks the invitation accepted, writes an audit record and starts the session.
