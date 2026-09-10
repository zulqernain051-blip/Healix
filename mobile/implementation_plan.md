# Implementation Plan: Phase 10D (Visit & Clinical Data)

## Goal

Refactor the Visit and Clinical Data frontend architecture. We will migrate away from Zustand server state, remove massive monolithic screens (e.g., the 774-line `verification.tsx`), and align the frontend strictly with the frozen backend API and data models using TanStack Query.

## Current State Audit & Key Findings

1. **Backend Verification:**
   The backend routes have been verified.
   - Core Visit: `GET /nurses/:id/visits`, `GET /visits/:id`, `PUT /visits/:id/complete`.
   - Verification: `PUT /visits/:id/check-in`, `POST /visits/:id/verify-qr`, `POST /visits/:id/verify-gps`, `POST /visits/:id/verify-manual`.
   - Clinical: `POST /visits/:id/vitals`, `POST /visits/:id/symptoms`, `POST /visits/:id/clinical-remarks`.

2. **Frontend State (The Problem):**
   - `src/store/nurse.ts` contains massive amounts of server state and raw `fetch` calls for visits (e.g., `fetchAssignedVisits`, `startVisit`, `verifyQr`, `submitVitals`).
   - `src/store/clinical.ts` also contains raw `fetch` calls.

3. **Frontend UI (The Problem):**
   - The Nurse Visit flow is fractured into many huge or redundant files (`verification.tsx`, `verify.tsx`, `check-in.tsx`, `vitals.tsx`, `symptoms.tsx`, `remarks.tsx`).
   - Patient QR logic (`qr.tsx`) uses a raw `apiClient.get` on mount.

## Proposed Changes

### 1. Domain Foundations (Types, API, Hooks)
- **[NEW]** `src/types/visit.ts`: Define Zod schemas and TypeScript interfaces matching the Prisma schema (`Visit`, `VisitVerification`, `VitalsRecord`, `VisitSymptom`, `ClinicalRemark`).
- **[NEW]** `src/api/visits.api.ts`: Centralize all backend API calls using `apiClient`.
- **[NEW]** `src/hooks/useVisits.ts`: Implement TanStack React Query hooks (`useNurseVisits`, `usePatientVisits`, `useVisitDetail`, `useVerifyQr`, `useSubmitVitals`, etc.).

### 2. UI Components Extraction
Dismantle the massive monolithic screens into focused, reusable components under `src/components/visits/`:
- **General**: `VisitStatusBadge.tsx`, `VisitSummaryCard.tsx`
- **Verification**: `QrScanner.tsx` (for nurses to scan), `GpsVerification.tsx`, `ManualVerification.tsx`
- **Clinical**: `clinical/VitalsForm.tsx`, `clinical/SymptomsForm.tsx`, `clinical/ClinicalRemarksForm.tsx`

### 3. Screen Re-implementation (Nurse)
- **[MODIFY]** `src/app/(nurse)/visits/index.tsx`: List assigned visits using `useNurseVisits`.
- **[MODIFY]** `src/app/(nurse)/visits/[id].tsx`: The Visit Detail Hub. This will orchestrate the verification and clinical components based on the backend Visit status (`SCHEDULED` -> `IN_PROGRESS` -> `COMPLETED`).
- **[DELETE]** Obsolete standalone screens: `verification.tsx`, `verify.tsx`, `check-in.tsx`, `vitals.tsx`, `symptoms.tsx`, `remarks.tsx`, `visit-complete.tsx`.

### 4. Screen Re-implementation (Patient)
- **[MODIFY]** `src/app/(patient)/visits/index.tsx`: List patient visits.
- **[MODIFY]** `src/app/(patient)/visits/[id].tsx`: Display visit details, including the QR code for the nurse to scan.
- **[DELETE]** `src/app/(patient)/visits/qr.tsx` (logic moved to `[id].tsx`).

### 5. Legacy Cleanup
- **[MODIFY]** `src/store/nurse.ts`: Remove all visit-related server state arrays, objects, and raw `fetch` actions.
- **[MODIFY]** `src/store/clinical.ts`: Document/cleanup as necessary if it interferes, keeping unrelated legacy debt isolated.

## User Review Required

> [!WARNING]
> This refactor will delete large amounts of legacy visit code (including `verification.tsx`) in favor of a component-driven architecture powered by React Query. This strict alignment ensures the frontend respects the backend's state machine.

> [!IMPORTANT]
> Payment integration is explicitly OUT OF SCOPE for this phase, as requested.

## Verification Plan

1. **Automated Validation:**
   - Run `npx tsc --noEmit` and isolate remaining TypeScript errors. Legacy unrelated errors in `health` or `profile` will be noted and left for future phases.
2. **Manual Inspection:**
   - Patient can view upcoming visits and generate a QR token.
   - Nurse can view their assigned visits.
   - Nurse can open a Visit detail screen, verify arrival (mock/simulate), transition state to `IN_PROGRESS`, submit clinical data, and mark the Visit as `COMPLETED`.
