# AUTHENTICATION TEST REGISTER

| Test ID | Feature | Description | Status |
|---|---|---|---|
| AUTH-001 | Registration | Register a new PATIENT account successfully | PASS |
| AUTH-002 | Role Escalation | Attempt to register with ADMIN role (bypassing restrictions) | PASS (Blocked by Zod validation) |
| AUTH-003 | Duplicate Accounts | Attempt to register with the same email using different casing | FAIL (Triggered Prisma P2002 Exception) -> FIXED |
| AUTH-004 | OTP Brute Force | Attempt to brute force OTP on `/reset-password` and `/verify-mfa-login` | FAIL (No rate limits allowed infinite guessing) -> FIXED |
| AUTH-005 | Login | Login with valid credentials (and different casing) | FAIL (Login failed with different casing) -> FIXED |
| AUTH-006 | Session Persistence | Verify Refresh token rotation properly revokes old tokens | PASS |
| AUTH-007 | Logout | Verify logout revokes the current session | PASS |
| AUTH-008 | Forgot Password | Request reset OTP for a registered email | PASS |
| AUTH-009 | Change Password | Authenticated user changes their own password | PASS |
| AUTH-010 | IDOR / Account Takeover | Attempt to reset another user's password without OTP rate limit | FAIL (Account Takeover possible) -> FIXED |
