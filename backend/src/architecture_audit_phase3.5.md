# Phase 3.5 — Repository Architecture Validation & Audit Report

## 1. Repository Audit
- **Single Responsibility:** Because repositories were extracted 1:1 alongside their corresponding services, they inherited the bloated nature of the services. For instance, `MarketplaceRepository` handles listings, offers, visits, contracts, and audit logs.
- **God Repository:** Yes, `MarketplaceRepository` is acting as a God Repository. The `selectOffer` method executes a massive multi-entity transaction.
- **Business Logic Leakage:** Business logic has leaked into the repository layer to preserve transactional atomicity. 
  - In `ClinicalRepository.createRiskAssessmentAndCase`, there is conditional logic (`if (shouldCreateCase)`) determining whether to create a `CaseAssignment`.
  - In `MarketplaceRepository.selectOffer`, the entire workflow (accept offer, reject others, assign nurse to visit, generate contract, audit log) is hardcoded into the data access layer.
- **Only DB Operations:** While mostly restricted to database operations, the sequence and conditions of those operations are heavily dictated by embedded business rules.

## 2. Transaction Audit
- **Atomicity:** Maintained successfully. All multi-step operations are wrapped in `prisma.$transaction`.
- **Accidental Splits:** None detected. Operations that need to be atomic remain atomic.
- **Spanning Multiple Repositories:** To avoid splitting transactions across repositories, we crammed cross-domain operations into single repository methods. This preserves DB atomicity but violates domain boundaries.
- **Race Conditions:** `MarketplaceRepository.selectOffer` does not use explicit row-level locking (e.g., `SELECT ... FOR UPDATE`), which could theoretically lead to race conditions if two patients select an offer simultaneously.

## 3. Duplicate Query Audit
Significant duplication exists for generic entity lookups across domains:
- `ChatRepository`: `findPatientUser`, `findNurseUser`, `findDoctorUser`, `findPatientUserId`
- `EscalationRepository`: `findDoctor`, `findNurse`
- `DispatchRepository`: `findPatientById`
- **Recommendation:** These should be centralized in the `Identity` domain (`UserRepository`, `PatientRepository`, `NurseRepository`, `DoctorRepository`). They should remain separate for now, but be consolidated when cross-domain communication is formalized.

## 4. Service Audit
- **Business Logic Only:** Yes, services now primarily orchestrate calls and handle business rules.
- **No Prisma Import:** Verified. A workspace-wide search confirmed that no `import { prisma }` statements exist outside of `*.repository.ts` files in the core domains.
- **Repository Bypass:** None detected.

## 5. Cross-Domain Dependency Audit
Cross-domain violations are currently occurring at the **Database/Repository Layer**:
- **Marketplace -> Care:** `MarketplaceRepository.selectOffer` directly mutates `Visit` and `CareRequest` (Care domain). This is a severe DB-level cross-domain violation.
- **Communication -> Identity:** `ChatRepository` directly fetches `Patient`, `User`, `Nurse`, and `Doctor`.
- **Care -> Identity:** `EscalationRepository` fetches `Doctor` and `Nurse`.
- **Recommendation:** Repositories should only query/mutate their own domain's tables. Cross-domain data needs should be handled at the Service/Use-Case layer or via an Event Bus.

## 6. Repository Naming Audit
- **Consistency:** Excellent. The `[Name]Repository` class naming convention and `[name].repository.ts` file naming convention are followed uniformly across all refactored modules.

## 7. Barrel Export Audit
- **Exporting Internals:** Modules like `src/domains/care/visit/index.ts` use `export * from './visit.repository';`. 
- **Issue:** Repositories are internal data-access implementation details. Exporting them publicly encourages other domains or controllers to bypass the service layer and use repositories directly.

## 8. Performance Review
- **Repeated Lookups:** Repeated fetching of user roles and patient IDs across different domain requests.
- **N+1 Query Risks:** In `EscalationService.broadcastCase`, the system loops through all doctors and dispatches notifications sequentially. While not a DB N+1, it is a network/dispatch N+1.
- **Missing Eager Loading:** Some repositories fetch an entity, and then the service requests a related entity in a subsequent call instead of using Prisma's `include`.

## 9. Testing Readiness
- **Barrier to Mocking:** All repositories are currently implemented using **`static` methods**. Static methods are notoriously difficult to mock in standard testing frameworks (like Jest) without obtrusive workarounds. 
- **Recommendation:** To achieve true enterprise-grade testability and Dependency Injection (DI), repositories must be instantiated and injected into services/use-cases rather than called statically.

## 10. Readiness Score
**Score: 70 / 100**
*Reasoning:* Phase 3 successfully achieved its primary objective: isolating Prisma from the business logic. However, because we strictly avoided redesigning the services, we were forced to implement repositories using `static` methods, and we had to leak business logic into the data-access layer to maintain transactional atomicity. Cross-domain DB mutations are also a significant concern.

## 11. Recommendations Before Phase 4
- **What should stay:** The physical separation of Prisma into `*.repository.ts` files.
- **What should change:** 
  1. We must transition from `static` repository methods to instantiated classes to support Dependency Injection and mocking.
  2. Barrel files (`index.ts`) should stop exporting repositories to enforce encapsulation.
- **What should be postponed:** Fixing the massive cross-domain transactions (like `selectOffer`). If we split them now, we lose atomicity. We must wait until Phase 5 (Event Bus) to replace these with eventual consistency / Sagas.

## 12. Final Recommendation & Phase 4 Next Steps
**Should Phase 4 Proceed?** Yes. The foundation is solid enough to begin slicing the God Services.

**Which God Service should be refactored first?**
We should begin with the **`VisitService`** (in `src/domains/care/visit/visit.service.ts`). 
*Why?* `VisitService` is the absolute core of the Healix platform. It interacts with Clinical, Verification, Requests, and Identity. By breaking `VisitService` into granular Use Cases (e.g., `CreateVisitUseCase`, `CompleteVisitUseCase`) and injecting the repositories, we will establish the standard design pattern for the rest of Phase 4.
