# Repository Standards

Repositories own persistence only.

## Allowed In Repositories
- ? Prisma
- ? Database queries

## Forbidden In Repositories
Repositories NEVER:
- import other repositories
- import use cases
- import controllers
- contain business algorithms
- contain HTTP logic
- return Express objects

Repositories are split based on **Aggregate Ownership**—not line count. A repository should manage exactly one Domain Aggregate.
