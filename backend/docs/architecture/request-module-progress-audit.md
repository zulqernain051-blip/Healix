# Care Request Module – Phase 7 Progress Audit

## Executive Summary
This document provides a Read-Only Audit of the current Care Request implementation in the Healix backend, assessing its readiness against the new Marketplace matching model. 

### Readiness Score: 60 / 100 (Partially Working, High Architectural Debt)
The basic functionality for creating requests, submitting offers, and generating contracts exists. However, it severely violates Vertical Slice Architecture (VSA) principles and Domain-Driven Design (DDD) boundaries by heavily coupling the `Care`, `Marketplace`, and `Finance` domains using synchronous transactions within repositories.

---

## 1. Architectural Flow & Current State

### Request Creation Flow (Patient → Care)
**Path**: `patient.routes.ts` → `patient.controller.ts` → `patient/usecases/care/create-care-request.usecase.ts` → `care.repository.ts`
- **State**: The patient identity domain handles the use case to create a care request, which delegates to the Care Repository.
- **Architectural Violation**: The `CareRepository.createCareRequest()` method synchronously creates a `CareRequest`, `Visit`, `Payment`, and `MarketplaceListing` in a single monolithic transaction. This strongly couples the Care domain to the Finance and Marketplace domains.

### Bidding & Matching Flow (Marketplace)
**Path**: `marketplace.routes.ts` → `marketplace.controller.ts` → `marketplace.service.ts` → `marketplace.repository.ts`
- **State**: Bidding is managed in a legacy "Service" layer (`marketplace.service.ts`), bypassing the new Use Case structure.
- **Architectural Violation**: When an offer is selected (`selectOffer` in `marketplace.repository.ts`), the transaction synchronously modifies the `MarketplaceListing`, `Offer`, `Visit`, `CareRequest`, and creates a `Contract`. This crosses module boundaries directly in the data access layer.

### Contracting Flow (Contracts)
**Path**: `contract.routes.ts` → `contract.controller.ts` → `contract.service.ts` → `contract.repository.ts`
- **State**: Dual-approval logic (`patientApproved`, `nurseApproved`) is in place.
- **Architectural Violation**: When dual approval is reached, `updateApproval` directly updates the `Visit` state to `ACCEPTED` and generates a `VisitQrToken`.

---

## 2. Gap & Bug Analysis

| Issue Type | Description | Impact |
| --- | --- | --- |
| **Domain Leakage** | `Patient` domain houses use cases for `CareRequests`. | High (VSA violation) |
| **Monolithic Transactions** | `care.repository.ts` and `marketplace.repository.ts` modify foreign aggregates (Payments, Listings, Visits, Contracts). | Critical (Prevents microservice/event extraction) |
| **Missing Use Cases** | Marketplace domain still uses `MarketplaceService` instead of segregated Use Cases. | Medium (Tech Debt) |
| **Duplicate Logic** | There are duplicate/unused Use Cases in `domains/care/requests/usecases/requests`. | Low (Confusion/Clutter) |
| **Priority Hack** | `updateRequestPriority` appends priority as a `[PRIORITY:VALUE]` string inside the `notes` field instead of a dedicated schema column. | Medium (Data integrity) |

---

## 3. Action Matrix (KEEP / MODIFY / FIX / REMOVE / ADD / MOVE)

| Component | Target Action | Reasoning |
| --- | --- | --- |
| **`patient/usecases/care/*`** | **MOVE** | All care request orchestration use cases should be moved out of the `Patient` domain into the `Care` domain. |
| **`care/requests/care.repository.ts`** | **MODIFY** | Rip out synchronous creation of `MarketplaceListing`, `Payment`, and `Visit`. These should be handled via Domain Events (e.g. `CareRequestCreatedEvent`). |
| **`marketplace.service.ts`** | **REMOVE / ADD** | Remove the legacy service and replace it with granular Use Cases (`SubmitOfferUseCase`, `SelectOfferUseCase`, etc.). |
| **`marketplace.repository.ts`** | **MODIFY** | `selectOffer` must stop mutating `CareRequest` and `Visit` aggregates directly. It should emit an `OfferAcceptedEvent` instead. |
| **`contract.repository.ts`** | **MODIFY** | `updateApproval` must stop mutating the `Visit` aggregate. The Care domain should listen for `ContractActivatedEvent`. |
| **Prisma Schema (`CareRequest`)** | **ADD** | Needs a dedicated `priority` column instead of packing it into the `notes` field. |
| **`domains/care/requests/usecases/requests/*`**| **REMOVE** | Clean up unused or duplicate logic to prevent fragmentation. |

---

## 4. Next Steps & Recommendations

1. **Schema Update**: Add missing fields (like `priority` on `CareRequest`) to the Prisma schema.
2. **Refactor Marketplace**: Adopt the VSA Controller → Use Case → Repository structure for the Marketplace domain.
3. **Event Bus Implementation**: Introduce an internal Event Bus or EventEmitter. Replace monolithic repository transactions with domain events to decouple the Care, Marketplace, and Finance contexts (addressing the Phase 6 TODOs).
4. **Relocate Patient Care Use Cases**: Move the care-specific use cases out of the Identity/Patient domain and into the Care domain.
