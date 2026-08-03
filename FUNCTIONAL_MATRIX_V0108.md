# Bar Ops v0.10.8 — Functional Verification Matrix

| Workflow | Source-level regression | Real database | Browser/UI | Audit status |
|---|---:|---:|---:|---|
| Login, logout and explicit dev login | Passed | Not executed | Not executed | Partially verified |
| Employee invitation and activation | Passed | Not executed | Not executed | Partially verified |
| Employee/profile/location linkage | Passed | Not executed | Not executed | Partially verified |
| Shift create, edit, delete and persistence | Passed | Not executed | Not executed | Partially verified |
| Recurrence and series editing | Passed | Not executed | Not executed | Partially verified |
| Copy and publish schedule ranges | Passed | Not executed | Not executed | Partially verified |
| Open shifts, claims and transfers | Passed | Not executed | Not executed | Partially verified |
| Employee published schedule | Passed | Not executed | Not executed | Partially verified |
| Clock in/out and current clock restoration | Passed | Not executed | Not executed | Partially verified |
| Employee hours summary | Passed | Not executed | Not executed | Partially verified |
| Timesheet corrections and approvals | Passed | Not executed | Not executed | Partially verified |
| Payroll export and period locking | Passed | Not executed | Not executed | Partially verified |
| Products, stock counts and adjustments | Passed | Not executed | Not executed | Partially verified |
| Orders, receiving and daily operations | Passed | Not executed | Not executed | Partially verified |
| Multi-location manager context | Passed | Not executed | Not executed | Partially verified |
| Notifications and search interactions | Passed | Not executed | Not executed | Partially verified |
| PWA manifest/service-worker configuration | Passed | N/A | Not executed | Configuration verified only |
| Responsive/Safari/safe-area behavior | Static assertions passed | N/A | Not executed | Unverified visually |
| Fresh migration sequence | Static assertions passed | Not executed | N/A | Unverified at runtime |
| Authorization and tenant isolation | Static assertions passed | Not executed | Not executed | Partially verified |

“Passed” in the source-level column means the repository’s existing Node regression scripts completed successfully. It must not be interpreted as end-to-end certification.
