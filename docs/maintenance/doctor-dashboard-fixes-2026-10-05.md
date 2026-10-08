# Doctor dashboard and connected-screen repairs

## Dashboard

- Rebuilt the mobile dashboard with Healix navy/light design tokens and responsive case cards.
- Both dashboards separate assigned cases from eligible HIGH/CRITICAL broadcasts and refresh every ten seconds.
- Deadline displays use the actual SLA timestamp, including overdue status. The obsolete web `remainingMinutes` assumption is removed.
- Case actions distinguish acceptance, starting review, continuing review, and viewing details. Failed requests show actionable errors instead of a misleading empty queue.
- The backend verifies professional-broadcast eligibility and verified doctor access. Accepting through start-review advances the case into IN_REVIEW.

## Connected screens

- Mobile profile loads the account's actual PMDC number, verification state, bio, and emergency availability from the authenticated profile endpoint. Removed a hard-coded license, specialty, and verification claim.
- Mobile case review retains vitals, symptoms, nurse assessment, adherence, decision support, and second opinions, with readable styling, retry controls, and submission feedback.
- Clinical actions and the standalone diagnosis/care-plan screens require an active assigned case. Closed/broadcast cases do not expose writable clinical tools.
- Diagnosis, care plan, prescription, and follow-up forms use shared colors. Care-plan dates are serialized correctly; a milestone is required. Prescription duration/frequency and follow-up day inputs are validated without silently substituting a duration.
- Removed nursing scheduling controls that discarded their values; nursing follow-up uses the existing Clinical Actions follow-up form.
- Second-opinion creation checks current case ownership, active status, and the colleague's verification inside the case lock.
- Patient–doctor chat recognizes ASSIGNED/IN_REVIEW instead of obsolete ACCEPTED. Broadcast acceptance creates the care chat using the shared Prisma client. Removed unsupported compliance/encryption claims from doctor UI text.
- Mobile doctor navigation includes emergency transport and uses a light Paper theme; the wide sidebar and bottom tabs follow the same colors.
- Web sidebar navigation clears an open case review when choosing another page. Narrow layouts retain navigation and sign-out. Expired API sessions return to login.

## Doctor home visits

The web page previously called absent endpoints. It now uses authenticated GET/POST/PUT endpoints backed by the existing doctor_home_visits table. Patients are selected from the doctor's assigned cases. Scheduling requires a future time and a valid care relationship. Only the owning verified doctor can advance a visit through SCHEDULED → EN_ROUTE → ARRIVED → COMPLETED, or cancel an active visit. Completion requires clinical findings; outcome notes are recorded with the visit.

No schema migration was needed for home visits or profile credentials.

## Verification

- Backend and mobile TypeScript checks passed.
- Backend regression suite: 16 suites / 116 tests passed.
- Mobile regression suite: 15 tests passed.
- Web production build and Expo web export passed.
- Real HTTP/PostgreSQL fixture test passed doctor profile fields, queues, restricted broadcast viewing/acceptance, starting review, automatic care-chat creation, second-opinion authorization, home-visit patient scoping, scheduling validation, ownership, transitions, and completion notes. Existing emergency workflow checks also pass. Only UUID-scoped fixtures were created and cleaned up.
- Browser verification used the existing development doctor account: dashboard filters, empty states, Home Visits, responsive navigation, and expired-session recovery render correctly. Its live queues were empty; populated clinical interactions were checked through the isolated HTTP/database workflow, not a physical phone.

The existing decision-support content remains a symptom-template implementation; this update does not claim a new AI model or independently verified medical guidance.

![Actual doctor dashboard](screenshots/doctor-dashboard-2026-10-05.png)
