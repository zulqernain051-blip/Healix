# Module 2 — Patient: workflow and implementation review

Status: **for user review, 2026-10-06**. This records the current code and proposal; it does not approve the intended behavior or claim live test results. No patient functionality was changed for this review. After workflow decisions, write scenarios, then run supervised tests.

## Proposal baseline

The updated 2026 FYP proposal, section 4.2, describes patient access, personal and medical profile, nurse visit requests, rule-based risk status when clinical records exist, doctor prescriptions and notes, a general-guidance chatbot, and in-app status/message updates. It explicitly treats patient-specific RAG, reliable push notifications, and broader emergency/billing features as unfinished.

## Current path through the app

| Area | Current implementation | Review point |
| --- | --- | --- |
| Entry and home | Patient signs in through Module 1, then reaches five tabs: Home, Care, Records, Messages, Profile. Home reads a dashboard summary and prescriptions, with links to requests, visits, risk, doctor home visits, payments, notifications and emergency. | Decide which services belong in the core patient workflow versus later modules. |
| Personal profile | Patient can view/edit name, birth date, gender, address/city and location; manage emergency contacts. Backend validates updates and contacts. | Proposal also names weight; it is not present in the inspected profile update schema. Decide whether weight belongs in profile or measured vitals. |
| Medical information | Patient can view medical history and add chronic conditions, allergies and medications. Visit-recorded vitals, risk history, clinical outcomes, prescriptions and care plans have separate views. | Clarify which entries patients may self-report and which only clinicians may create/correct. |
| Nurse care request | New request is fixed to `NURSE_VISIT`; form gathers care description, requirements, duration, one-time/recurring schedule, time/window and geocoded address. API has create/list/detail/cancel/reschedule. | Define exact status transitions, cancellation/reschedule cutoffs, and whether the selected time window represents a real appointment time. |
| Nurse discovery and contracts | Marketplace shows offers for listed requests, favorites and contract screens; patient can select/reject offers and approve/reject/cancel contracts. Visit screens show assigned visit details, arrival confirmation/QR and post-visit nurse review. | Confirm whether bidding/contracts are part of Module 2 or reviewed with Marketplace/Nurse modules. |
| Doctor home visits | A separate patient screen lists active verified doctors and allows a future home-visit request; backend stores `REQUESTED` and allows cancellation from `REQUESTED` or `SCHEDULED`. | Confirm whether patient chooses a specific doctor or requests any available doctor; define acceptance and scheduling handoff. |
| Messages and guidance | Patient has conversation list, phone lookup, text/media chat and Socket.IO hooks. AI screen calls a chatbot endpoint and includes an emergency action. | Proposal describes general guidance only; personalized advice and emergency escalation need explicit boundaries. |
| Updates, payment, emergency | Notification screen derives cards from current requests and latest risk, with read state held in screen memory. Payment screen lists records. Emergency screen exposes a separate workspace. | These screens should not imply confirmed push delivery, payment processing, or public emergency dispatch until those are validated. |

## Source map

- Proposal: `docs/product/FYP Proposal Healix Updated 2026.docx`, section 4.2.
- Patient navigation and screens: `mobile/src/app/(patient)/`.
- Patient hooks/API: `mobile/src/hooks/usePatient.ts`, `mobile/src/hooks/useCareRequests.ts`, `mobile/src/hooks/useHealth.ts`, `mobile/src/api/patient.api.ts`.
- Patient API: `backend/src/domains/identity/patient/patient.routes.ts`, `patient-workflows.routes.ts`, `patient.controller.ts`, `patient.validation.ts`.
- Access check: `backend/src/domains/identity/patient/usecases/profile/assert-patient-access.usecase.ts`; route-level ownership also needs scenario testing.

## Items to decide before scenario design

1. Is Module 2 the entire patient experience, including marketplace/contracts, doctor home visits, messages, chatbot, payments and emergency, or should some be reviewed as separate modules?
2. Should patients enter their own conditions, allergies and medications, and how should these be distinguished from clinician-verified records?
3. For nurse visits, what exact booking, offer/contract, scheduling, cancellation and rescheduling flow do you want?
4. Should doctor home visits let the patient choose a doctor, or should Healix assign one?

## Potential discrepancies to verify later

- The Records menu calls risk history “AI fusion risk assessment,” while the proposal says the current risk assessment is rule-based. That wording could mislead patients.
- Records promises “Medical Timeline & Labs,” but the linked route is medical information/history; a lab-results flow has not been established by this review.
- Notification cards and read state are derived locally from records, so the screen is not yet evidence of persistent in-app notifications or device push delivery.
- The nurse request form uses end-of-day as its saved time when a broad time window is selected; verify that backend matching and display preserve the patient's actual preference.
