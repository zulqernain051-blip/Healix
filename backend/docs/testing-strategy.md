# Testing Strategy

## Ownership
- **Policies**: Unit Tests (100% coverage expected due to purity).
- **Use Cases**: Unit Tests (Mocking repositories).
- **Repositories**: Integration Tests (Testing against test database).
- **Controllers**: API Tests (Supertest).

## Folder Structure
Tests should reside adjacent to the files they test, named `*.spec.ts` or `*.test.ts`.
