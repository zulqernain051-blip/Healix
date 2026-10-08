# Module 1 Authentication and Access Control

Review status: **registration policy corrected from the user's 2026-10-06 direction; other behavior awaiting review**. No live behavior has been verified and no new live test scenarios have been designed.

## Agreed registration rule

- Only **patients and nurses** use the public signup page and endpoint.
- **Doctors and paramedics** are provisioned by an administrator, either through direct account creation or an invitation that lets the recipient enter details and set a password.
- After direct creation or invitation acceptance, doctor and paramedic accounts are active and can log in without email OTP or a second approval. Admins can still suspend or revoke accounts later.

This rule supersedes older proposal and audit descriptions where they conflict. The implementation was changed on 2026-10-06; live behavior remains unverified.

## What the module currently does

The Expo app exposes registration, email-code verification, login, password recovery, password change, invitation acceptance, and email two-step verification. It routes authenticated users to role-specific areas. The separate web portal offers sign-in for administrators and doctors, plus email two-step verification. The Express API owns credential checks, account state, token sessions, and authorization; PostgreSQL stores users, role profiles, OTP hashes, and sessions.

| Area | Current implementation | Source |
| --- | --- | --- |
| Public registration | Only patients and nurses may register on Expo signup or through its public API. Both supply name, email, phone, password, and CNIC; nurses add PNC. Password needs 8+ characters, a digit, and a symbol. The API accepts several Pakistan phone formats; the Expo form accepts only `03` plus nine digits. | `mobile/src/app/auth/role-select.tsx`, `register.tsx`; `backend/src/domains/identity/auth/auth.validation.ts` |
| Admin provisioning | Admins can directly create doctor and paramedic accounts as active with verified professional status, or issue a seven-day, one-use invitation. An invited doctor/paramedic enters identity and credential details, chooses a password, and can then sign in. The first admin can be bootstrapped from environment settings. | `backend/src/domains/identity/admin/usecases/create-doctor.usecase.ts`, `create-paramedic.usecase.ts`, `invite-user.usecase.ts`; `auth/invitation.repository.ts`; `mobile/src/app/auth/invited.tsx` |
| Email verification | Public patient/nurse registration sends a six-digit SMTP email code valid for 10 minutes. Codes are purpose-bound hashes and consumed once. Patient verification activates the account; nurse verification leaves it pending administrator review. Invited doctors/paramedics skip this step. | `backend/src/domains/identity/auth/auth.service.ts`, `auth.repository.ts`, `otp.ts`, `otp-delivery.ts` |
| Professional onboarding | A verified pending nurse may sign in only to complete their own profile and submit verification documents. Doctors and paramedics can sign in after admin creation or invitation acceptance. | `backend/src/domains/identity/auth/auth.service.ts`, `common/middleware/authMiddleware.ts`, `domains/identity/admin/admin.service.ts`; `mobile/src/utils/authRouting.ts` |
| Login | API accepts email or phone plus password. It checks password, email verification, account state, and optional MFA. Successful login creates a database session and returns a short-lived JWT access token plus a random refresh token. The web portal accepts only ADMIN and DOCTOR accounts. | `backend/src/domains/identity/auth/auth.service.ts`; `mobile/src/app/auth/login.tsx`; `web/src/store/auth.ts` |
| Google login on web | Expo web and the administrator/doctor web portal display a Google sign-in button when configured. The backend verifies Google's signed ID token, audience, issuer, expiry, and verified Gmail/Workspace address, then signs in an existing Healix account with the same email. It does not create a Healix account or change its role/status. Existing Healix email MFA still applies. Native Android/iOS Google sign-in requires a separate provider build and is not implemented by this web button. | `backend/src/domains/identity/auth/google-id-token.ts`, `auth.service.ts`; `mobile/src/components/auth/GoogleSignInButton.web.tsx`; `web/src/components/GoogleSignInButton.tsx` |
| Two-step verification | A signed-in user can enable or disable email MFA by confirming a separate six-digit email code. When enabled, login sends another code and issues tokens only after it is verified. | `backend/src/domains/identity/auth/mfa.service.ts`, `mfa-login.service.ts`; `mobile/src/app/auth/security.tsx`, `mfa-verify.tsx`; `web/src/pages/Login.tsx` |
| Password recovery | Forgot password returns a generic success response for unknown accounts. For known accounts it emails a 10-minute reset code. Reset changes the password and revokes all sessions. Authenticated change password requires the old password and also revokes all sessions. | `backend/src/domains/identity/auth/auth.service.ts`, `auth.repository.ts`; `mobile/src/app/auth/forgot.tsx`, `reset.tsx`, `change-password.tsx` |
| Session handling | Access tokens default to 15 minutes; database refresh sessions expire after 30 days. Refresh rotates the refresh token and session. Protected API requests check the token signature, current user status, email verification, and active session. Logout revokes the submitted refresh session. The Expo client retries a 401 after refresh and persists tokens in native SecureStore or browser localStorage. | `backend/src/common/config/index.ts`, `common/middleware/authMiddleware.ts`, `domains/identity/auth/auth.service.ts`; `mobile/src/api/client.ts`, `utils/secureStorage.ts` |
| Role access | The backend restricts routes by roles and, on some routes, ownership and configurable feature permissions. Expo also redirects between role areas; the web portal guards admin and doctor pages. Server checks are the authority. | `backend/src/common/middleware/authMiddleware.ts`, `feature-permissions.ts`; `mobile/src/utils/authRouting.ts`; `web/src/App.tsx` |

## Account states and consequences

| Account | After registration | After email code | Can sign in while pending? |
| --- | --- | --- | --- |
| Patient | Pending verification | Active | No |
| Nurse | Pending verification | Pending administrator review | Yes, limited to own verification/profile area |
| Doctor, direct admin creation | Active; professional verified | No code | Yes |
| Paramedic, direct admin creation | Active; professional verified | No code | Yes |
| Doctor/paramedic, admin invitation | Active when invitation accepted | No code | Yes |
| Invited administrator | Pending verification | Active | No |

The account status above is distinct from the professional profile's `verificationStatus`. A suspended or deleted account is refused by login and protected API requests.

## Source review findings that need a decision or live confirmation

1. **Admin activation:** invited administrators become active after email verification without a second administrator approving them. Confirm whether possession of an admin-created invitation is sufficient.
4. **Email delivery:** current code uses SMTP, so the October PBD audit's console-delivery description is outdated. We need a configured development SMTP service before live patient/nurse registration, recovery, or MFA tests. A failed delivery can leave a newly created account pending; resend is the recovery path.
5. **Web session lifetime:** the web portal stores the refresh token but does not call the refresh endpoint. With the default 15-minute access-token lifetime, its next API request after expiry signs the user out. Confirm whether automatic refresh is expected.
6. **Code limits:** stored OTP issuance is limited to five codes per user per hour across purposes. Failed-code attempts are limited to five per purpose for ten minutes in server memory, so restarting or using multiple API processes resets that attempt count. Confirm the desired policy for a deployed system.
7. **Phone formatting:** API and Expo public-registration form allow different valid Pakistan mobile formats. Confirm the canonical saved format and whether the UI should accept international forms.
8. **Password recovery message:** the API protects account existence with a generic response, but the Expo screen tells every requester that a code was sent. Confirm the wording shown to users.
9. **Web role tabs:** the administrator and doctor tabs change their visual selection, but both submit the same login request and redirect according to the returned account role. Confirm whether the tabs should select or enforce a role, or be removed.

These are source findings and product decisions, not yet confirmed live bugs. Once the desired behavior is approved, the next phase will define scenarios and pass criteria for each path, then execute them under supervision.
