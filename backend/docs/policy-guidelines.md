# Policy Standards

Policies contain pure business algorithms.

## Properties
- **Pure**: Input -> Decision -> Output.
- **Stateless**: No internal memory or caching.
- **Deterministic**: Same input always yields the same output.
- **No side effects**: Does not modify external state.

## Forbidden In Policies
Policies NEVER:
- access repositories
- access Prisma
- perform HTTP work

*Reference Implementations: `MatchingPolicy`, `CompliancePolicy`.*
