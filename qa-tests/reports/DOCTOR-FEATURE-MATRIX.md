# DOCTOR MODULE - FEATURE QA MATRIX

| Feature | Screen / Path | Status | Notes / Bug Fixes Applied |
|---------|---------------|--------|---------------------------|
| **Authentication & Profile** | `mobile/src/app/(doctor)/profile/index.tsx` | **PASS** | UI renders correctly, fetches `user` state, logout logic implemented correctly with confirmation alerts. |
| **Dashboard (Queue)** | `mobile/src/app/(doctor)/home/index.tsx` | **PASS** | Fetches `useDoctorQueue` and `useDoctorHighRiskQueue`. SLA calculation properly filters. |
| **Case Review** | `mobile/src/app/(doctor)/reviews/[id].tsx` | **PASS** | **BUG FIXED**: Fixed hardcoded stub for `compliance` metrics. Connected `useComplianceMetrics` hook and implemented backend endpoint for `getComplianceMetrics`. Fixed patient ID mapping error (`request.patient.id`). |
| **Clinical Actions** | `mobile/src/app/(doctor)/action/[id].tsx` | **PASS** | Renders sub-forms correctly. Uses `useResolveCase`. |
| **Diagnosis** | `mobile/src/app/(doctor)/diagnosis/[id].tsx` | **PASS** | `useSubmitDiagnosis` mapped correctly to API. Auditing & corrections supported via `parentId`. |
| **Prescription** | `mobile/src/components/doctor/PrescriptionForm.tsx` | **PASS** | **BUG FIXED**: Added robust allergy conflict bypass logic. When API returns `409 Conflict`, it prompts the doctor to override or cancel. Also fixed event propagation issue on submit button. |
| **Care Plan** | `mobile/src/app/(doctor)/careplan/[id].tsx` | **PASS** | **BUG FIXED**: Hook integration bypass fixed. Component previously skipped `useSubmitCarePlan` cache invalidation logic by directly calling API client. Refactored to use the React Query mutation. |
| **Messages (Chat List)** | `mobile/src/app/(doctor)/messages/index.tsx` | **PASS** | **BUG FIXED**: Fixed severely broken mapping. Data mapping was incorrectly mapped to `participantName` instead of `otherParticipant.name`. Navigation destination was also routing to `/(nurse)/messages/chat` which crashed the app. Updated to map to `otherParticipant` and route to `/(doctor)/messages/chat` passing `threadId`. |
| **Messages (Chat UI)** | `mobile/src/app/(doctor)/messages/chat.tsx` | **PASS** | **BUG FIXED**: File was missing from doctor module. Migrated and adapted it. Also fixed API client `post` signature missing empty data body object `{}` which caused TypeScript crashes. |
| **API Client (`messages`)** | `mobile/src/api/messages.api.ts` | **PASS** | **BUG FIXED**: `markAsRead` PUT request failed TS compilation because `apiClient.put` requires a body argument. Added `{}` to resolve TS error. |
| **API Client (`clinical`)**| `mobile/src/api/clinical.api.ts` | **PASS** | **BUG FIXED**: Missing `getComplianceMetrics` endpoint definition added to allow frontend to fetch adherence metrics. |
| **Backend Controller** | `backend/src/domains/care/clinical.controller.ts` | **PASS** | **BUG FIXED**: Added missing `getComplianceMetrics` handler. Linked it correctly to the `GetComplianceMetricsUseCase`. |
| **Backend Routes** | `backend/src/domains/care/clinical.routes.ts` | **PASS** | **BUG FIXED**: Exposed `/patients/:patientId/compliance` route. |

*Overall the module is functionally sound and now fully integrated end-to-end with Prisma and caching.*
