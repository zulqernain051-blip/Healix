# 3. Policy Layer

Date: 2026-08-10

## Status
Accepted

## Context
Complex decision-making algorithms (matching, ranking, compliance calculation) were previously embedded in Use Cases or Repositories, making them difficult to unit test and violating the Single Responsibility Principle.

## Decision
- Algorithms and business rules must be extracted into Policies.
- Policies contain pure algorithms.
- Policies never access Prisma.
- Policies are deterministic and stateless.

## Consequences
- Use Cases delegate decisions to Policies.
- Policies can be exhaustively unit-tested without mocks.
- Repositories remain completely devoid of business logic.
