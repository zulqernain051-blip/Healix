# Naming Conventions

## Use Cases
Use Cases must follow a strict verb-noun format ending in `UseCase`.
- Commands: `CreateXUseCase`, `UpdateXUseCase`, `DeleteXUseCase`, `AcceptXUseCase`, `RejectXUseCase`
- Queries: `GetXUseCase`, `ListXUseCase`, `SearchXUseCase`, `FindXUseCase`
*Example: `CreateCareRequestUseCase`*

## Repositories
Repositories must end in `Repository` and reside in a file ending in `.repository.ts`.
*Example: `VisitRepository` (visit.repository.ts)*

## Policies
Policies must end in `Policy` and reside in a file ending in `.policy.ts`.
*Example: `MatchingPolicy` (matching.policy.ts)*

## Controllers
Controllers must end in `Controller` and reside in a file ending in `.controller.ts`.
*Example: `CareController` (care.controller.ts)*

## Other Elements
- Routes: `xxx.routes.ts`
- Schemas: `xxx.schemas.ts` or `xxx.validation.ts`
- Types: `xxx.types.ts`
- Mappers: `xxx.mapper.ts`
