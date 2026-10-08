# Module 4 — Doctor: workflow and implementation review

Status: **for user review, 2026-10-06**. This describes proposal intent and inspected code, not approved behavior or live test results. No functionality was changed and no scenarios were designed.

## Proposal baseline and current onboarding decision

Section 4.4 of `docs/product/FYP Proposal Healix Updated 2026.docx` calls for reviewing cases, patient history, nurse observations, rule-based risk information, diagnoses, treatment recommendations, prescriptions, continued monitoring or higher-level care, and discharge. The proposal predates the Module 1 decision: **doctors are created or invited by an administrator and can log in immediately after account creation/acceptance, without a separate OTP or approval**. The final module documentation must update the proposal's outdated onboarding language.

## Current implementation

| Area | Current code behavior | Decision to review |
| --- | --- | --- |
| Entry and platforms | Admin-created/invited doctor uses the doctor web portal. Expo also contains doctor Case Queue, Messages and Profile tabs plus case-action screens. Backend doctor routes require authenticated role `DOCTOR` with verified professional status, which admin provisioning now sets. | Is the doctor workflow officially web-only, both web and mobile, or web-first with limited mobile coverage? |
| Case intake | Web dashboard polls assigned cases and high/critical broadcasts every 10 seconds. Doctor can view details, start review or accept an urgent broadcast. Backend has queue, high-risk queue, accept/start/resolve endpoints and assignment/SLA workers. | Define who initially assigns cases, broadcast eligibility, ownership, response deadline and what happens when no doctor accepts. |
| Case review | Web case page shows latest vitals, symptoms, nurse notes and available insight summary. Backend serves a consolidated review and patient relationship checks. | Confirm which longitudinal records are required, whether a doctor may view before accepting, and how to identify stale/missing observations. |
| Clinical actions | Web offers diagnosis, care plan, prescription, clinical decision and feedback forms. Backend has corresponding submit endpoints, prescription supersession, follow-up, second opinion and case resolution. Mobile has separate review/diagnosis/care-plan/action routes. | Define required sequence and whether a single clinical decision closes a case or additional resolution is required. |
| Doctor home visits | Patients can request a specific verified doctor; doctor web lists own visits, can also schedule for patients linked by prior assigned cases, and moves requests through REQUESTED → SCHEDULED → EN_ROUTE → ARRIVED → COMPLETED (or CANCELLED). Completion requires findings. | Clarify whether doctors may decline, reassign or reschedule a patient request and how patient consent/notification works. |
| Communication and emergency | Mobile doctor messaging and emergency transport screen exist; web portal includes emergency operations. | Decide whether these belong in Module 4 or separate communication/emergency modules. |

## Source map

- Proposal: `docs/product/FYP Proposal Healix Updated 2026.docx`, section 4.4 and section 4.8.
- Web portal: `web/src/pages/doctor/Dashboard.tsx`, `CaseReview.tsx`, `HomeVisits.tsx`; routing in `web/src/App.tsx`.
- Expo: `mobile/src/app/(doctor)/`, especially `(tabs)/home.tsx` and `reviews/[id].tsx`.
- Backend: `backend/src/domains/identity/doctor/doctor.routes.ts`, `home-visits.routes.ts`, `usecases/`; `backend/src/domains/care/clinical/`.

## Points to settle before scenarios

1. Which doctor platform is authoritative: web, mobile, or both?
2. What creates a case for doctor review, and which risk levels require a response?
3. When can a doctor accept, transfer, request a second opinion, or resolve a case?
4. Which actions and records must a doctor complete before a case is closed, and which results should reach the patient and nurse?
5. What is the exact lifecycle for a patient-requested doctor home visit?

## Potential discrepancies to verify later

- The portal labels the rule/keyword-based insight card “AI Clinical Decision Support,” while the proposal explicitly says there is no trained ML/RAG service. The wording should be reviewed for clinical accuracy.
- The portal shows a response deadline for cases and polls every 10 seconds; this is not proof of reliable real-time alert delivery. Worker behavior and notification handoff need scenario testing.
- The doctor portal's “View Details” opens a case without starting review, but the page makes clinical forms read-only until the case is assigned/in review. Check that backend access permits only appropriate previews.
- The proposal's statement that doctor admin verification/invitation is incomplete conflicts with the already approved Module 1 onboarding decision and current provisioning code.
