# Module 1 Authentication Scenarios

Drafted 2026-10-06 before the next implementation review and supervised live run. This is the **expected behavior** to judge Healix against, not a claim that the app currently passes. Existing historical AUTH-001–010 results are reference material only.

## Scope and prerequisites

Use disposable development identities and a local test database. Prepare one patient, one nurse awaiting approval, one active nurse, one doctor and one paramedic created directly by an administrator, an invited doctor and paramedic, and an administrator. Use separate browser profiles for concurrent users. Keep Google credentials, passwords, OTPs, and invitation tokens out of screenshots and reports. For Google cases, configure the same web OAuth client ID in the backend, Expo web, and web portal, and allow the local origins in Google Cloud. SMTP must be available for cases that send email.

The requested registration rule is fixed: public signup is patient/nurse only; administrators create or invite doctors/paramedics; doctors/paramedics can sign in after account creation without email OTP or further approval. Google login should authenticate an existing Healix account and must not create a role or change its status. The extent of native Android/iOS Google login remains to be decided separately from the visible browser run.

## Signup and provisioning

| ID | Action and starting state | Expected result |
| --- | --- | --- |
| AUTH-R01 | Open public signup from the Expo login page. | Only Patient and Nurse choices appear. Doctor, Paramedic, and Admin are absent. |
| AUTH-R02 | Submit a valid new patient account. | Account is pending; email OTP is sent; no session is created yet. Valid OTP activates account; patient can then log in. |
| AUTH-R03 | Submit a valid new nurse account with PNC number. | Email OTP is required. After verification, nurse can sign in only to complete verification/profile tasks; admin approval grants full nurse access. |
| AUTH-R04 | Send crafted public registration requests for DOCTOR, PARAMEDIC, or ADMIN, including valid-looking credentials. | API rejects each role and creates no user or role profile. |
| AUTH-R05 | Admin directly creates doctor with name, email, phone, CNIC, PMDC, and initial password. | Active doctor and verified professional profile are created once; doctor can immediately log in with the initial password. No OTP or approval queue. |
| AUTH-R06 | Admin directly creates paramedic with name, email, phone, CNIC, certification number, and initial password. | Active paramedic and verified professional profile are created once; paramedic can immediately log in. No OTP or approval queue. |
| AUTH-R07 | Admin invites doctor/paramedic; recipient accepts a valid one-use token and sets password. | Role comes from invitation; active account and verified professional profile are created; recipient can log in immediately, with no email OTP or second approval. Token cannot be reused. |
| AUTH-R08 | Accept expired, reused, wrong-email, or wrong-phone invitation; submit missing professional credential. | Action fails without creating a usable account or consuming an otherwise valid invitation for a corrected retry. |
| AUTH-R09 | Reuse an email, phone, CNIC, or professional number, including email case changes. | Clear conflict response; no duplicate user or partial professional profile. |
| AUTH-R10 | Leave required form fields blank or enter invalid phone/CNIC/password. | Client and API reject the input with understandable field feedback. |

## Login and Google identity

| ID | Action and starting state | Expected result |
| --- | --- | --- |
| AUTH-L01 | Log in with correct email or phone/password, including mixed-case email. | One valid Healix session is issued and the user reaches the route for their role. |
| AUTH-L02 | Use wrong password, unknown email, deleted account, or suspended account. | No session; error does not disclose password or token data. |
| AUTH-L03 | Try logging in as unverified patient or unverified nurse. | No normal access; user is directed to email verification. |
| AUTH-L04 | Log in as verified but unapproved nurse and attempt unrelated patient, marketplace, and admin actions. | Nurse reaches only permitted onboarding/profile tasks; API denies other operations. |
| AUTH-L05 | Sign in as doctor/admin on web portal; try patient/nurse/paramedic there; visit a wrong-role URL directly. | Doctor/admin reaches only the permitted portal; other roles are refused; API role checks hold even if UI navigation is bypassed. |
| AUTH-G01 | On configured Expo web and web portal, select Continue with Google using a Google account whose verified email matches an active Healix account. | Google identity is checked by backend; Healix issues its normal session and routes by existing role. |
| AUTH-G02 | Use a Google account with no matching Healix account, or one matching a suspended/deleted/pending account. | No Healix account is created or activated; no session is issued. |
| AUTH-G03 | Send malformed, expired, wrong-audience, wrong-issuer, or wrong-signature Google ID token directly to the API. | API rejects the token; no session is issued. |
| AUTH-G04 | Use Google login for an existing account with Healix email MFA enabled. | Healix MFA challenge is required before a session is issued. Invalid or expired MFA code cannot complete login. |
| AUTH-G05 | Open browser login with missing OAuth configuration or blocked Google script. | The page remains usable for password login and clearly reports why Google sign-in is unavailable. |

## Email codes, MFA, and recovery

| ID | Action and starting state | Expected result |
| --- | --- | --- |
| AUTH-O01 | Enter valid, wrong, expired, reused, and wrong-purpose OTPs. | Only a valid unused code for the requested purpose succeeds once. |
| AUTH-O02 | Resend account verification code repeatedly. | New code is delivered until the configured hourly limit; subsequent request is rate limited. |
| AUTH-O03 | Submit six incorrect OTP attempts within the lock period. | First five fail; subsequent attempt is rate limited. |
| AUTH-M01 | Enable email MFA from an authenticated account, then sign out and sign back in. | Enabling needs email confirmation; later password or Google login needs a new email code before session issuance. |
| AUTH-M02 | Disable email MFA with valid and invalid codes. | Only valid code disables it; login thereafter follows the single-factor path. |
| AUTH-P01 | Request password reset for known and unknown email. | Both requests show a non-enumerating message; known account receives a code. |
| AUTH-P02 | Reset with valid code and strong password, then try old password and existing sessions. | New password works; old password and all earlier sessions fail. |
| AUTH-P03 | Change password while signed in using correct/incorrect old password. | Correct old password changes it and ends all sessions; incorrect password leaves account unchanged. |

## Sessions and access control

| ID | Action and starting state | Expected result |
| --- | --- | --- |
| AUTH-S01 | Refresh an active session. | New access and refresh tokens are issued; previous refresh token cannot be reused. |
| AUTH-S02 | Log out, then reuse old access/refresh token. | Session is revoked; protected API calls and refresh fail. |
| AUTH-S03 | Reload app/portal with valid or expired access token. | Valid session is restored; expired access token follows the intended refresh policy without changing user identity. |
| AUTH-S04 | Suspend or delete an account while its session is open. | Further protected operations and refresh are blocked. |
| AUTH-S05 | Access another user's profile, doctor case, nurse onboarding, or admin route using a valid token for a different identity. | API denies access; no cross-account data is returned. |

## Execution record rule

For every live case, record date/time, build or commit, browser/app, test account label, setup data, actions, actual result, evidence location, and PASS/FAIL/BLOCKED. A failed case becomes an issue with reproduction and a linked retest. Browser cases do not prove native Android/iOS behavior.
