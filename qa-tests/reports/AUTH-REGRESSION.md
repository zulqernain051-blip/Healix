# AUTHENTICATION REGRESSION SUITE

To ensure bugs do not return, the following tests were executed and should be part of the CI/CD pipeline:

1. **Verify Role Escalation Block**:
   - Send `POST /api/v1/auth/register` with `role: "ADMIN"`.
   - **Expected**: 400 Bad Request with Zod validation error ("Invalid role for public registration").
   - **Result**: Passed.

2. **Verify Case Insensitivity**:
   - Send `POST /api/v1/auth/register` with `email: "TEST_REGRESSION@example.com"`.
   - Send `POST /api/v1/auth/login` with `emailOrPhone: "TeSt_ReGrEsSiOn@example.com"`.
   - **Expected**: 200 OK (Login successful despite casing).
   - **Result**: Passed.

3. **Verify OTP Rate Limit**:
   - Call `POST /api/v1/auth/forgot-password`.
   - Call `POST /api/v1/auth/reset-password` 6 times with random incorrect OTP codes.
   - **Expected**: First 5 requests return `400 Invalid OTP`, the 6th returns `429 Too many failed attempts`.
   - **Result**: Passed.

4. **Verify Session Integrity**:
   - `POST /api/v1/auth/refresh` using an old refresh token.
   - **Expected**: 401 Unauthorized.
   - **Result**: Passed.
