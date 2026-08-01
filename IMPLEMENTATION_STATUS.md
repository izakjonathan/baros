# v0.8.9 implementation status

Implemented:
- Functional Settings navigation and workspace
- PostgreSQL-backed time-clock configuration per location
- Persistent mobile clock-in, break and clock-out
- Active timesheet and break restoration after refresh
- Published-shift association for clock-in
- PostgreSQL-backed scheduled/approved hour summaries
- Persistent employee correction requests and manager notifications
- Role-aware clock eligibility based on a linked employee profile

Still staged:
- Dedicated shared-device kiosk screen
- Browser geolocation capture and full radius enforcement in mobile clock UI
- Background missed-clock-out worker
- Automatic approval engine using tolerance settings
- Full organization/location creation and editing UI
- MFA enrollment and managed backup controls
