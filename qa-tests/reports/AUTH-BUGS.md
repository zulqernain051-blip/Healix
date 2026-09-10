# AUTHENTICATION BUGS

## BUG-AUTH-01: Case Sensitivity & Duplicate Accounts Failure
**Severity**: High
**Description**: Registration transformed the email to lowercase when storing to the DB, but didn't lowercase it when querying `findUserByEmail`. This led to Prisma `P2002` Unique Constraint Violations if users typed their emails with different casing. Similarly, `login` strictly checked the exact casing passed by the user, leading to "Invalid credentials" even if the account existed.
**Fix**: Patched `auth.service.ts` to explicitly lowercase `email` during registration validation and `emailOrPhone` during login, resendOtp, verifyOtp, forgotPassword, and resetPassword.
**Status**: FIXED

## BUG-AUTH-02: OTP Brute Force leading to Account Takeover
**Severity**: Critical
**Description**: There was no rate limiting on the `/reset-password` or `/verify-mfa-login` endpoints. An attacker could request a password reset for an Admin and brute force the 6-digit OTP (1 million combinations), successfully resetting the password and achieving Account Takeover (effectively a severe Role Escalation/Takeover). 
**Fix**: Implemented in-memory Maps to track failed attempts by `userId`. If a user fails the OTP verification 5 times, the request is rejected with a `429 Too Many Requests` error, blocking brute-force attacks.
**Status**: FIXED

## BUG-AUTH-03: Role Escalation via Mass Assignment
**Severity**: Low / Non-Exploitable
**Description**: Zod properly restricts the `role` field on registration to block `ADMIN`. I explicitly tested payload injection. It was properly handled and prevented by Zod's `nativeEnum` checks. No further fix required.
**Status**: VERIFIED SECURE
