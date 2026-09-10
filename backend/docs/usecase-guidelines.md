# Use Case Standards

Each Use Case must follow these rules:
- Has exactly one `execute()` method.
- Has exactly one responsibility.
- Orchestrates repositories.
- May call Policies to make decisions.
- Never imports Prisma.
- Never imports Express.
- Never performs Zod HTTP validation.
- Never returns HTTP responses.

*Recommended Size: Use Cases should be short. If a Use Case exceeds 100 lines, its decision logic likely needs extraction into a Policy.*
