# Module 3 — Nurse: workflow and implementation review

Status: **for user review, 2026-10-06**. This describes inspected code and the updated FYP proposal. It is not an approved workflow or a live test result. No nurse functionality was changed. Scenario design and supervised testing follow only after workflow review.

## Proposal baseline

Section 4.3 of `docs/product/FYP Proposal Healix Updated 2026.docx` describes nurse availability, care requests, visits, attendance verification and structured observations: blood pressure, heart rate, SpO2, temperature, glucose, respiratory rate, weight/BMI, symptoms and nurse comments. Section 4.8 describes patient request → nurse matched/accepts/is assigned → verified visit → observations → rule-based risk → possible doctor review. The proposal says scheduling, escalation and alert delivery still need integration testing.

## Current implementation

| Area | Current code path and behavior | Workflow decision needed |
| --- | --- | --- |
| Account onboarding | Public nurse signup is allowed under Module 1. Nurse profile, qualifications/specializations and verification documents have screens and API routes. Administrator reviews documents; pending nurses cannot accept care work. | Which documents and profile fields are mandatory, and is approval account-wide or per-specialty? |
| Home and navigation | Nurse has Home, Visits, Marketplace, Messages, Profile, plus a More menu for patients, schedule, offline drafts and assistant. Home loads profile, assigned visits, score and reviews. | Which sections are core to the nurse module versus separate marketplace, messaging and performance modules? |
| Availability and time off | Nurse can add/delete availability slots. A vacation screen calls separate time-off APIs and says new bookings are blocked. | How do availability, vacation, active contracts and already assigned visits interact? |
| Discovering work | Marketplace lists open requests, filters by disclosed city/service, and lets a nurse submit, update or withdraw an offer. Contract screens support subsequent acceptance/management. Assigned visits also have an accept action. | Decide whether all work uses bidding/contracts, admin assignment, direct acceptance, or a combination with explicit rules. |
| Performing a visit | Visit detail loads server state, accepts eligible visits, offers QR, GPS or manual arrival verification, then forms for vitals, symptoms and clinical remarks. The screen requires all three clinical sections before it calls complete. | Define when each verification method is valid, who confirms manual arrival, and which observations are mandatory for each service type. |
| Clinical follow-up | Nurse views patient summary, timeline, risk assessment, care plan and prescription. Backend stores clinical records and rule-based assessment through care/visit domains. | Clarify nurse visibility and editing rights after completion, and the exact doctor-escalation handoff. |
| Offline drafts | Vitals/symptoms can be stored as account-bound drafts on the device and synced later. Screen says verification, decisions and emergency escalation require connectivity, and drafts should sync before visit completion. | Decide whether fully offline visits are intended or only draft capture; define duplicate/conflict handling. |
| Performance and pay | Profile links to reviews, performance, earnings. Earnings screen says payout settlement is not connected. | Decide whether scoring, reviews and payment are in Module 3 or later modules. |
| Communication and assistant | Nurse chat screens and an assistant screen exist. The assistant screen uses the patient-oriented greeting/prompts and keyword emergency detection. | Decide whether nurse needs a general assistant at all, and prohibit presenting prototype advice as clinical decision support. |

## Source map

- Nurse screens: `mobile/src/app/(nurse)/`, especially `(tabs)/`, `visits/[id].tsx`, `profile/verification.tsx`, `sync/index.tsx`.
- Mobile API/hooks: `mobile/src/api/nurse.api.ts`, `visits.api.ts`, `clinical.api.ts`, `marketplace.api.ts`; matching `mobile/src/hooks/useNurse.ts`, `useVisits.ts`, `useClinical.ts`, `useMarketplace.ts`, `useContracts.ts`.
- Backend nurse account routes: `backend/src/domains/identity/nurse/nurse.routes.ts`, `nurse-assets.routes.ts`, `nurse.validation.ts`. Visit, clinical, marketplace and contract behavior crosses their respective backend domains and requires a later scenario-level trace.

## Points to resolve before scenarios

1. What exact steps make a self-registered nurse eligible for work: email verification, documents, profile, admin approval, specializations?
2. What is the preferred path from patient request to nurse assignment, and can a nurse refuse or withdraw after accepting?
3. What evidence must be captured at arrival and completion, including a fallback when QR or GPS fails?
4. Which vital signs and symptoms are required for every visit, and which depend on care type?
5. What happens when a rule-based risk result is medium/high: who receives it, by what channel, and what action closes the escalation?

## Potential discrepancies to verify later

- The nurse assistant greets the user as “Patient” when no name is available and reuses patient-oriented prompts. Its “AI/clinical support” labeling is stronger than the proposal's current general-guidance/keyword implementation.
- The visit screen requires at least one vital, one symptom and a clinical remark for every completed visit. That may be inappropriate for some requested services; confirm the clinical rule before changing it.
- The home screen's Emergency and Scan QR shortcuts both route to the generic Visits list. Check whether those actions need direct workflows.
- Offline capture is limited to drafts of vitals and symptoms; it does not establish an offline verified/completed visit.
- Earnings represent recorded care payments, not a connected payout system.
