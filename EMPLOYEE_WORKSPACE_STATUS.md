# Employee Workspace Status

## Current status — v0.19.0-rc.10

The employee workspace has now received its dedicated redesign and shell-unification pass.

### Shared application system

The employee workspace now reuses the same application chrome as owner/manager workspaces:

- shared top bar;
- shared side navigation / mobile drawer;
- shared dark shell foundation;
- shared location presentation;
- shared theme control;
- shared search and notification popovers;
- shared focus and interaction contracts.

Employee-only navigation chrome, bottom navigation and More-sheet presentation have been retired.

### Role-aware employee modules

Employee navigation exposes only employee self-service modules:

- Home;
- Schedule;
- Clock;
- Requests;
- Availability;
- Notifications.

Managers with a linked employee profile retain intentional employee-portal access through the existing `employee.self_service` capability and remain scoped to their linked employee identity.

### Remaining verification

The exact RC still requires physical iPhone Safari testing, VoiceOver acceptance, full TypeScript/build validation and staging verification.
