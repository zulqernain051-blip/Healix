# Planned Domain Events

## CareRequestCreatedEvent
- **Purpose**: To generate secondary entities asynchronously when a care request is created.
- **Producer**: CareRepository (or CreateCareRequestUseCase via EventBus)
- **Consumers**: PaymentModule (creates Payment), MarketplaceModule (creates MarketplaceListing), VisitModule (creates Visit)
- **Current TODO location**: `src/domains/care/requests/care.repository.ts:createCareRequest`
- **Future replacement transaction**: The massive Prisma `$transaction` currently wrapping CareRequest, Visit, Payment, and MarketplaceListing creation.

## VisitCompletedEvent
- **Purpose**: To trigger downstream billing, notifications, or milestones when a visit ends.
- **Producer**: VisitRepository
- **Consumers**: PaymentModule (finalize invoice), NotificationModule
- **Current TODO location**: `src/domains/care/visit/visit.repository.ts:completeVisit`
- **Future replacement transaction**: Replaces the synchronous `CareRequest` status update inside `completeVisit`.

## VisitStartedEvent
- **Purpose**: To notify tracking systems when a visit begins.
- **Producer**: VisitRepository
- **Consumers**: TrackingModule, NotificationModule
- **Current TODO location**: `src/domains/care/visit/visit.repository.ts:startVisit`
- **Future replacement transaction**: Replaces the synchronous `CareRequest` status update inside `startVisit`.

## HighRiskDetectedEvent
- **Purpose**: To escalate critical clinical alerts to doctors.
- **Producer**: ClinicalRepository
- **Consumers**: DoctorModule (creates CaseAssignment)
- **Current TODO location**: `src/domains/care/clinical/clinical.repository.ts:createRiskAssessmentAndEscalate`
- **Future replacement transaction**: Replaces the cross-domain write to `CaseAssignment`.

## AttendanceLoggedEvent
- **Purpose**: To track nurse performance and calculate payroll based on shift completion.
- **Producer**: NurseSchedulingRepository
- **Consumers**: FinanceModule, NursePerformanceModule
- **Current TODO location**: Implicit in upcoming Nurse Module decomposition.
- **Future replacement transaction**: Standardizing shift management.
