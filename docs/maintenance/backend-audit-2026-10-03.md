# Backend audit and repairs ? 2026-10-03

## Implemented fixes

- Authentication: inactive accounts are rejected consistently; refresh-token rotation and OTP consumption use conditional writes to prevent reuse; password changes revoke sessions. OTPs use cryptographic randomness, purpose-bound hashes, issuance limits and failed-attempt limits. MFA and reset flows no longer accept another flow's code.
- Registration: paramedic profiles are created; invited registration is routed, validates professional details, claims invitations transactionally and leaves pending accounts awaiting approval.
- Authorization: patient records, compliance, medication logs, visit details/evidence and AI summaries require patient ownership or a care relationship. Nurse schedules and vacations require nurse ownership. Global care-request administration, scheduling and overdue listings require ADMIN. Dispatch/admission updates require assigned staff or ADMIN; escalation administration requires ADMIN.
- Medication and scheduling validation: a medication cannot be logged against another patient; rescheduling rejects invalid dates and reports missing visits clearly.
- Visit verification: coordinate checks accept valid zero coordinates and reject non-finite/out-of-range inputs. Controllers forward operational errors to the shared handler. Vacation persistence replaces placeholder behavior.
- Chat: socket authentication rejects inactive accounts; typing and delivery receipts require thread access; delivery acknowledgements cannot downgrade read messages. Chat creation uses the shared database client.
- Emergency workflow: the selected hospital is persisted; no fake hospital is created when configuration is missing. Dispatch creation uses a transaction, patient locking and conditional vehicle claims. Shortage alerts survive dispatch rollback. Terminal states cannot be reopened, concurrent transitions are guarded and repeat discharge does not duplicate follow-up care.
- Background work: clinical case creation queues assignment; a recovery worker processes pending cases in pages. Case assignment is serialized. Dispatch communication is queued for post-commit processing. Listener failures propagate to outbox retries. Maintenance jobs avoid overlap and isolate failures.
- Cleanup: removed 15 unused legacy methods after reference checks; inventory is in backend/docs/architecture/removed-unused-methods.json. Existing unrelated work was preserved.

## Verification

- TypeScript no-emit check passed.
- Production build (`npm.cmd run build`) passed.
- Full Jest run: 14 suites, 97 tests passed.
- Additional clinical regressions: 1 suite, 4 tests passed (101 passing tests across 15 suites in total).
- Backend source diff whitespace check passed. Unrelated existing mobile whitespace findings were left untouched.
- Regression coverage includes OTP purpose/reuse, account status, invitation/paramedic registration, ownership, GPS edge cases, vacation persistence, delivery receipts, emergency transaction/state behavior, worker failures, assignment retry/pagination and medication ownership.

## Operational notes and remaining scope

- Existing OTPs issued before the hash/purpose change are invalid; request a fresh code. No database migration was added or applied by this audit.
- Invited registration returns a pending user without login tokens. Clients should show approval-pending behavior. Generic scheduling/admin routes now return 403 to non-administrators.
- Failed-OTP attempt tracking is process-local; multiple API instances need a shared counter for a global limit.
- Existing mock OTP/notification delivery and simulated AI/clinical integrations remain. Real provider delivery, clinical accuracy, production load and deployment were not validated by these code tests.
- This is a targeted audit of confirmed defects, not proof that every backend path is defect-free. Schema and other application changes already present in the workspace remain outside this audit's authorship.
