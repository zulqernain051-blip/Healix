# 4. Domain Events Roadmap

Date: 2026-08-10

## Status
Accepted

## Context
With Single Aggregate Repositories enforced, cross-domain mutations (e.g., CareRequest creating a Payment) are no longer permitted within atomic Prisma transactions.

## Decision
Phase 6 will introduce an Event Bus to replace cross-aggregate transactions with eventual consistency.

## Planned Events
- `VisitCompletedEvent`
- `HighRiskDetectedEvent`
- `CareRequestCreatedEvent`
- `AttendanceLoggedEvent`

These will replace existing `// TODO Phase 6` markers.
