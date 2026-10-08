# Module 6 — Emergency: provisional workflow review

Status: **provisional, 2026-10-07**. The workspace read tool failed before this module's source files could be inspected. This note uses the FYP proposal and emergency-related routes/screens already observed during the Patient, Doctor and Admin reviews. It must be completed by tracing the emergency backend and UI before approval, scenario design or live testing. No emergency functionality was changed.

## Proposal baseline

The updated FYP proposal describes rule-based risk from nurse observations, possible medium/high-risk doctor review, and a recommendation for higher-level care when appropriate. It explicitly says reliable urgent alert delivery and public emergency dispatch integration are not validated; Rescue 1122 or a live fleet is outside the demonstrated scope. A risk score is not a diagnosis or a substitute for emergency services.

## Current visible architecture, based on prior reviews

| Area | Previously observed implementation | Still to inspect |
| --- | --- | --- |
| Patient | A patient emergency screen/workspace and dashboard link to transport/admission tracking exist. | Trigger permissions, whether a patient can create an emergency, status timeline and safety instructions. |
| Nurse | The nurse dashboard has an Emergency shortcut that currently leads to the generic Visits list. Visit clinical observations can produce rule-based risk. | Whether nurse can raise an emergency directly, how escalation is acknowledged, and what happens offline. |
| Doctor | Doctor mobile and web surfaces include emergency/urgent case views. Doctor case routes have high-risk queue and accept-emergency actions. | Assignment/broadcast rules, response SLA, clinical decisions, admission referral and reassignment. |
| Admin | Admin APIs previously inspected expose emergency listing, doctor/paramedic/ambulance assignment, resolution and escalation. Web and Expo have emergency operations screens. | Dispatch state machine, fleet availability, audit trail, notification delivery and error handling. |
| Fleet/network | Admin routes include ambulance and hospital registry management; paramedic accounts are admin-created/invited. | Whether any live location, hospital capacity, public service integration or actual transport exists. |

## Intended handoff to review with the user

1. What starts an emergency: patient SOS, nurse observation, doctor decision, admin action, or several distinct pathways?
2. Who is responsible for immediate human response at each step, and what must the app say when no responder is available?
3. Does Healix coordinate an internal ambulance/paramedic team, only track referrals, or simply show a prototype workflow for the FYP?
4. What statuses and proof are required for dispatch, arrival, transport, hospital handover, admission and closure?
5. Which notifications are mandatory, and what fallback applies when push, network, GPS or an external service fails?

## Source tracing still required

Inspect `backend/src/domains/care/emergency/`, `web/src/pages/EmergencyOperations.tsx`, `mobile/src/components/emergency/`, patient/doctor/admin emergency screens, and the corresponding API hooks. Confirm authorization and state transitions before treating any screen as a working dispatch flow.
