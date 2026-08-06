# Employee Workspace Status

The dedicated employee workspace redesign is complete for the current employee portal surfaces in **v0.19.0-rc.4**.

## Redesigned surfaces

- Employee Home
- My Shifts
- Open Shifts
- Hours and clock state
- Availability
- Requests
- Notifications
- More sheet and mobile navigation
- Employee forms, loading, empty, success and error states

## Preserved operational behavior

- published-shift visibility;
- open-shift claims;
- schedule acknowledgements;
- shift transfers and notes;
- clock-in, breaks and clock-out;
- correction requests;
- availability rules;
- time-off requests;
- notifications;
- APIs, permissions and persistence.

A linked manager may intentionally use the employee workspace when the account has a linked employee profile. Employee self-service data remains scoped to that linked employee identity.

## Presentation ownership

`app/employee/EmployeeWorkspace.css` is the route-scoped presentation owner for the employee shell and employee pages. The earlier employee presentation block was removed from `app/completion-redesign.css` to avoid competing cascade owners.

## Verification still required

- real employee and linked-manager accounts;
- iPhone Safari at 320, 375, 390 and 430 px;
- software-keyboard interaction;
- native date, time, month and datetime pickers;
- VoiceOver and keyboard navigation;
- real API loading, error and empty states;
- Vercel preview acceptance.
