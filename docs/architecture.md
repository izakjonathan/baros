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

## Data boundary

All Operation queries are scoped by organization and, where the current model provides one, location. Legacy migrations remain in sequence because deleting them would not remove existing database objects safely and would prevent clean migration of established environments.

## Account invitations

Owners create an invitation in Operation Settings. The server stores a SHA-256 token hash, role, organization, optional location and seven-day expiry. Activation runs in one transaction, creates or links the account, creates membership and employee/location records where needed, marks the invitation accepted, writes an audit record and starts the session.
