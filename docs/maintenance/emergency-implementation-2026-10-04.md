# Emergency workflow implementation — 4 October 2026

This update connects the implemented emergency services to usable doctor, admin, patient, and paramedic screens. It covers Healix fleet dispatch and staff-recorded hospital admission. It does not connect Healix to a hospital's own dispatch system or the external 1122 service.

## Implemented capabilities

| Capability | Implementation and user journey |
| --- | --- |
| Doctor emergency decision | Open a patient case, choose Dispatch Ambulance, enter a clinical justification, search destinations, select a hospital, and confirm. Dispatch creation, the recorded decision, and case resolution commit together. Failed dispatch leaves the case open. |
| Destination selection | Search using patient coordinates and LOW/MEDIUM/HIGH budget. Charity hospitals remain eligible. Results prefer non-full hospitals and nearby destinations; capacity information older than 30 minutes is marked stale. Full hospitals cannot be selected for dispatch. |
| Emergencies without visits | Admin can assign an active verified doctor to a standalone emergency. The doctor's Emergency screen shows assigned events awaiting transport and supports a justified dispatch without creating an imaginary nurse visit. Dispatch reuses the emergency event. |
| Admin ambulance dashboard | Web: Emergency & Ambulance Fleet. Mobile: Admin → Ambulance Fleet. Register/edit vehicles, view availability and trip records, replace a vehicle, assign a verified paramedic, and advance or cancel a trip. |
| Hospital network | Admin can add/edit hospitals, record location, charity/budget level, and update capacity. Capacity updates get a server timestamp. Hospitals and vehicles with dispatch history cannot be deleted. |
| Resource allocation | Transactions protect vehicle allocation, reassignment, completion, and cancellation. A busy vehicle or paramedic cannot be assigned to a second active trip. A reserved ambulance without a driver remains PENDING. Advancing a trip requires both resources. |
| Tracking and ETA | Patient, assigned doctor, admin, and assigned paramedic receive role-scoped trip data. Paramedics can share device GPS while their mobile emergency screen is open and enter an ETA estimate. Other roles see timestamps, stale-location warnings, destination, vehicle, driver, and a map link. |
| Admissions and discharge | Staff request admission, confirm ADMITTED, then record DISCHARGED with notes. Requests are idempotent, transitions are validated, and discharge creates one follow-up care draft. Patients see admission progress but cannot modify it. |
| Escalation operations | Admin can see open events and breached deadlines, assign/change a verified doctor, increase severity, resolve an event, and assign unowned broadcast cases. Existing clinical SLA broadcast rules are preserved. |

## Important fixes

- Removed a blanket admin-only middleware check that incorrectly blocked doctor, patient, and paramedic emergency endpoints.
- Removed the invalid temporary visit reference in standalone doctor assignment.
- Corrected web doctor review data paths and the start-review endpoint.
- Added hospital selection and the actual decision payload to mobile and web doctor action forms.
- Corrected hospital capacity/budget values previously inconsistent with backend behavior.
- Rechecked trip ownership and state during guarded updates, rather than relying on stale resource assignments.
- Preserved clinical justification on dispatch records and limited user data returned in dispatch responses.
- Corrected the socket import used when accepting a broadcast case through start-review.

## Verification

| Check | Result |
| --- | --- |
| Backend TypeScript | Passed |
| Backend Jest | 16 suites, 116 tests passed |
| Mobile TypeScript | Passed |
| Mobile regression tests | 15 tests passed |
| Web production build | Passed |
| Expo web export | Passed, including new emergency and paramedic routes |
| Real HTTP + PostgreSQL workflow | Passed |
| Browser review | Admin fleet page loads existing vehicles/hospital/emergencies; registration and hospital-capacity forms render correctly |

The integration script uses UUID-scoped test users, vehicles, hospital, visit, and case. It exercises real authentication and HTTP routes, hospital validation and access, doctor dispatch, duplicate rejection, patient isolation, driver GPS/ETA, vehicle replacement, concurrent admission requests, discharge replay, vehicle release, and standalone emergency assignment/dispatch. Resource selection is restricted to the script's own fixtures. Cleanup removes those fixtures and their outbox records.

The integration test is `backend/scripts/manual-tests/test-emergency-operations.ts`. Backend regression tests are under `backend/src/domains/care/emergency/__tests__` and the admin consistency suite. Real device GPS permission and background behavior were not tested on a physical phone.

## Database update

The Prisma schema adds nullable latitude, longitude, locationUpdatedAt, and etaUpdatedAt to dispatches. The additive SQL upgrade is `backend/scripts/database/emergency-tracking-upgrade.sql`; it also normalizes old hospital values. This upgrade was applied to the development database and the Prisma client regenerated.

For another existing database, apply the upgrade and regenerate the client from the backend directory:

```powershell
npx prisma db execute --file scripts/database/emergency-tracking-upgrade.sql --schema prisma/schema.prisma
npx prisma generate
```

## Operational limits

- Capacity and admission status are entered by authorized Healix staff; the app does not independently verify a hospital bed or admission.
- This dispatches registered Healix vehicles. Sending requests to hospital-owned fleets or 1122 requires a separate provider agreement and integration. Existing external-emergency logging does not dispatch a real external ambulance.
- GPS sharing uses the assigned paramedic's device while the screen is open. Background tracking is not implemented. Location is marked stale after two minutes without an update.
- ETA is an initial or paramedic-entered estimate with a countdown; it is not a traffic-aware routing prediction.
- Notifications/chat creation use the existing event outbox and listener infrastructure. Run the normal backend server/workers for delivery. The browser review used a local API preview, without starting background delivery workers.

## Real browser screenshot

![Admin emergency and ambulance fleet dashboard](screenshots/emergency-admin-2026-10-04.png)
