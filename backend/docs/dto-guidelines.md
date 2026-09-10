# DTO & Mapping Standards

Mapping rules are strict to prevent Prisma models from leaking into API responses.

## Correct Flow
`Repository` -> `Entity (Prisma Model)` -> `Mapper` -> `DTO` -> `Controller` -> `JSON`

## Forbidden Flow
Repositories NEVER expose Prisma models directly to the HTTP response stream.
`Repository` -> `JSON` (ILLEGAL)
