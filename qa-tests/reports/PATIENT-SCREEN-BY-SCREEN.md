# PATIENT SCREEN BY SCREEN

## PAT-SCR-001: /(patient)/home/index.tsx
- **Controls**: 
  - Profile avatar (DashboardHeader)
  - Notification icon (DashboardHeader)
  - HighRiskAlertCard
  - UpcomingVisitCard
  - QuickActionsGrid (Request, Records, AI, Prescriptions)
  - HealthSummaryCard
  - Pull-to-refresh ScrollView
- **Back Behavior**: Native app root (no back), uses tabs or closes app.
- **API/DB Effect**: 
  - Queries: `useDashboardSummary`, `useVitalsHistory`
  - Effect: Refreshes cache on Pull-to-refresh.

## PAT-SCR-002: /(patient)/profile/index.tsx
- **Controls**:
  - Personal Information menu card
  - Emergency Contacts menu card
  - Medical Information menu card
  - Insurance Information menu card
  - Account Settings menu card
  - Sign Out button
- **Back Behavior**: Tab root, no explicit back button rendered.
- **API/DB Effect**:
  - Queries: `useAuthStore` local state.
  - Mutations: `logout()` clears session.

## PAT-SCR-003: /(patient)/health/index.tsx
- **Controls**:
  - Risk Banner View button
  - Vitals & Risk Assessment card
  - Medical Timeline card
  - Active Care Plans card
  - Prescriptions card
  - Family Caregivers card
  - Recurring Visits card
- **Back Behavior**: Standard tab root.
- **API/DB Effect**: 
  - Queries: `useDashboardSummary`

## PAT-SCR-004: /(patient)/records/index.tsx
- **Controls**:
  - Clinical Outcomes & Diagnoses
  - Vitals & Biometrics
  - Prescriptions & Medications
  - Medical Timeline & Labs
  - Care Visits & History
  - Active Care Plans
  - AI Risk History
  - Medical Information & Allergies
- **Back Behavior**: Standard tab root.
- **API/DB Effect**: None directly.

## PAT-SCR-005: /(patient)/messages/index.tsx (Inferred)
- **Controls**: Message threads list
- **Back Behavior**: Tab root.

## PAT-SCR-006: /(patient)/requests/new.tsx (Inferred)
- **Controls**: Form fields, Submit button
- **Back Behavior**: `router.back()` or navigation to history
- **API/DB Effect**: Mutations for new requests.
