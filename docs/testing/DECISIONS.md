# Healix product decisions

| Date | Module | Decision | Implementation and verification |
| --- | --- | --- | --- |
| 2026-10-06 | Authentication | Public signup is for patients and nurses only. Administrators provision doctors and paramedics by invitation or direct account creation. Both paths let doctors and paramedics sign in without email verification or a second approval. | Signup role selector and API validation restricted; admin invitation acceptance creates active, professionally verified doctor/paramedic accounts; direct creation remains active and is exposed in the web admin directory. Backend/mobile/web typechecks passed. Existing auth regression suite passed in an isolated test schema. Live behavior awaits the later supervised testing phase. |
| 2026-10-06 | Authentication | Add Google login for existing Healix accounts in the browser login screens. Google identity does not create a Healix role or account. | Signed Google ID token verification and web buttons added. OAuth client configuration and supervised live verification remain; native Android/iOS sign-in is a separate integration. |

The detailed current behavior and remaining review questions are in [Module 1 Authentication and Access Control](MODULE-01-AUTHENTICATION.md).
