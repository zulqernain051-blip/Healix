# AUTHENTICATION FEATURE INVENTORY

## Mobile Screens
- Registration (Role Selection: Patient, Nurse, Doctor, Paramedic)
- OTP Verification Screen
- Login Screen
- Forgot Password & OTP Recovery
- Change Password

## Backend Routes (`/api/v1/auth`)
- `POST /register`: Registers user and generates OTP.
- `POST /verify-otp`: Validates OTP and updates status.
- `POST /resend-otp`: Resends OTP with rate limits.
- `POST /login`: Authenticates user, issues JWT and Refresh token.
- `POST /refresh`: Rotates Refresh Token.
- `POST /logout`: Revokes Refresh Token.
- `POST /forgot-password`: Generates reset OTP.
- `POST /reset-password`: Validates OTP and sets new password.
- `POST /verify-mfa-login`: Secondary OTP for MFA enabled users.
- `GET /me`: Fetches profile.
- `POST /change-password`: Changes password for logged-in user.

## Prisma Schema Models
- `User`: Base identity (email, phone, passwordHash, role, status).
- `OtpCode`: Tracks issued OTPs, expiry, and consumption status.
- `Session`: Tracks refresh tokens, device info, IP, and revocation status.
- `PasswordResetToken`: Legacy model or alternative to OtpCode for resets.
- `Administrator`, `Patient`, `Doctor`, `Nurse`, `Paramedic`: Role-specific relational tables.
