# 2. Single Aggregate Repositories

Date: 2026-08-10

## Status
Accepted

## Context
Previously, repositories like CareRepository touched multiple aggregates simultaneously (e.g., Visit, Payment, Marketplace) through massive transactions. This violated Bounded Contexts and created circular dependencies.

## Decision
- Every repository owns exactly one aggregate.
- Repositories never own foreign tables.
- Repositories never import other repositories.
- Cross-domain writes will become Domain Events (Eventual Consistency) in Phase 6.

## Consequences
- Repositories cannot execute cross-domain atomic transactions.
- We must rely on Domain Events for cross-domain orchestration.
- The data access layer is strictly isolated by domain.
