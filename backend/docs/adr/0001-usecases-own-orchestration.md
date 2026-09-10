# 1. Use Cases Own Orchestration

Date: 2026-08-10

## Status
Accepted

## Context
In early phases, business workflows were orchestrated by "God Services" or directly within Repositories. This caused massive coupling, testing difficulties, and blurred bounded contexts. Controllers were also tempted to chain repository calls directly.

## Decision
- Controllers never orchestrate. They only handle HTTP mapping.
- Repositories never orchestrate. They only persist data.
- Only Use Cases coordinate workflows. A Use Case represents a single business transaction or query.

## Consequences
- Controllers become thin and purely infrastructural.
- Repositories become pure data mappers for a single aggregate.
- Business logic is perfectly isolated, easy to test, and easy to locate.
