# Healix Backend Architecture Rules

This document defines the strict, mandatory architectural rules for the Healix backend. These rules ensure a clean, decoupled, and maintainable Vertical Slice architecture.

## 1. Single Direction Dependency Rule

Dependencies always point downward. No lower layer may depend on a higher layer.

```text
Routes
  ↓
Controllers
  ↓
Use Cases
  ↓
Repositories
  ↓
Prisma
```

## 2. Allowed Dependencies

- **Routes** → Controllers only
- **Controllers** → Use Cases only
- **Use Cases** → Repositories, Policies, Helpers
- **Repositories** → Prisma, Shared Infrastructure
- **Policies** → Types, Helpers
- **Helpers** → Pure utility modules only

## 3. Forbidden Dependencies

- Controller → Repository
- Repository → Repository
- Repository → Controller
- Repository → Use Case
- Policy → Repository
- Policy → Controller
- Helper → Repository

## 4. Permanent Orchestration Rules
- Controllers own HTTP only.
- Use Cases own orchestration only.
- Policies own business rules only.
- Helpers own pure utility logic only.
- Repositories own persistence only.
- Only Use Cases may coordinate multiple repositories.
- Repositories must never import or call other repositories.
- Controllers must never import repositories.
- Repositories must never import controllers or use cases.

## 5. Core Layer Responsibilities

- **Controllers own HTTP only.** They receive requests, validate input via Zod schemas, call a single Use Case, and return the response. They contain absolutely zero business logic.
- **Use Cases own orchestration only.** They coordinate multiple repositories or services to fulfill a specific business capability. They are strictly single-responsibility.
- **Repositories own persistence only.** They are the only layer allowed to interact with the database. They encapsulate data access and represent exactly one Aggregate Root.
- **Policies own business rules only.** They contain pure functions that evaluate business conditions or calculations. They have zero side effects.
- **Helpers own pure utility logic only.** They provide stateless utilities (e.g., date formatting, mathematical calculations) that do not belong to any specific domain.

## 6. Permanent Aggregate Ownership

Every Repository owns exactly one Aggregate Root. A Repository may only directly read or write tables that belong to its Aggregate. Cross-Aggregate workflows must be orchestrated by a Use Case.

### PatientRepository
- **Aggregate Owned**: Patient Identity & Profile
- **Authorized Tables**: `Patient`, `User`, `EmergencyContact`, `CaregiverLink`
- **Forbidden Tables**: `CareRequest`, `Visit`, `Diagnosis`, `Prescription`
- **Future Phase**: Stable

### VisitRepository
- **Aggregate Owned**: Care Visit Lifecycle
- **Authorized Tables**: `Visit`, `VisitVerification`, `AttendanceRecord`
- **Forbidden Tables**: `DoctorHomeVisit`, `CareRequest`, Clinical notes
- **Future Phase**: Stable

### DoctorRepository
- **Aggregate Owned**: Doctor Workflow & Assignments
- **Authorized Tables**: `Doctor`, `DoctorHomeVisit`, `CaseAssignment`, `SecondOpinion`, `ClinicalDecision`, `AiFeedback`
- **Forbidden Tables**: `Diagnosis`, `Prescription`, `CarePlan`
- **Future Phase**: Stable

### ClinicalRepository
- **Aggregate Owned**: Clinical History & Prescriptions
- **Authorized Tables**: `MedicalHistory`, `Diagnosis`, `Prescription`, `Allergy`, `ChronicCondition`, `VitalsRecord`, `RiskAssessment`, `ClinicalRemark`, `VisitSymptom`
- **Forbidden Tables**: `Patient` (writes), `CareRequest`, `Visit` (writes)
- **Future Phase**: Candidate for decomposition into `DiagnosisRepository`, `PrescriptionRepository`, `MedicalHistoryRepository`

### CareRepository
- **Aggregate Owned**: Care Management & Planning
- **Authorized Tables**: `CareRequest`, `CarePlan`, `Payment`, `RecurringPattern`
- **Forbidden Tables**: `Visit`, `Patient`, `ClinicalDecision`
- **Future Phase**: Stable

### VerificationRepository
- **Aggregate Owned**: Field Verification
- **Authorized Tables**: `VisitVerification`, `AttendanceRecord`
- **Forbidden Tables**: `Visit`, `DoctorHomeVisit`
- **Future Phase**: Stable

### NursePerformanceRepository
- **Aggregate Owned**: Nurse Metrics & Reviews
- **Authorized Tables**: `NurseScore`, `NurseReview`, `NurseBadge`
- **Forbidden Tables**: `Nurse` (Identity)
- **Future Phase**: To be defined in Phase 5E

### NurseSchedulingRepository
- **Aggregate Owned**: Nurse Availability
- **Authorized Tables**: `AvailabilitySlot`, `NurseVacation`
- **Forbidden Tables**: `Visit`
- **Future Phase**: To be defined in Phase 5E

## 7. ClinicalRepository Shared Infrastructure Rule

**ClinicalRepository is shared infrastructure.**
It may only contain persistence for clinical entities.
No Care entities. No Patient entities. No Doctor entities.
Any future additions require architecture review.

## 8. Dashboard Rules
- Dashboards are Read Models.
- Repositories never own dashboard queries.
- Repositories expose only aggregate-specific queries.
- Dashboard Use Cases compose multiple repositories.
- Complex dashboards will migrate to CQRS Read Models in Phase 6.

## 9. Repository Growth Rule

- Repositories are split when **cohesion decreases**, not when line count increases.
- A 500-line cohesive repository is preferable to five unrelated 100-line repositories.
- Responsibility is the metric, not file size. Meaningless refactors to arbitrarily shrink files are forbidden.

## 10. Architecture Validation Checklist

Every future phase must satisfy this checklist before completion:

- [ ] Controller handles HTTP only
- [ ] Use Case owns orchestration
- [ ] Repository owns a single aggregate
- [ ] Repository imports Prisma only
- [ ] Policy contains only pure business rules
- [ ] Repository imports no repositories
- [ ] Controller imports no repositories
- [ ] API contracts unchanged
- [ ] Zod schemas unchanged
- [ ] `npx tsc --noEmit` passes

Violating any of these rules introduces technical debt and compromises the integrity of the architecture.

## 11. Policy vs Repository Boundary

Repositories never contain:
- matching
- ranking
- eligibility
- assignment
- priority
- business algorithms

Repositories only persist data.
Policies make decisions.
UseCases orchestrate.
