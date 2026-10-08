# Healix supervised test run log

Record observed results separately from expected scenarios in [Module 1 Authentication Scenarios](MODULE-01-SCENARIOS.md). A passing source test does not count as a live browser pass.

## 2026-10-06 — Module 1, first browser review

Environment: local backend on `localhost:3000`, Expo web on `localhost:8081`, and portal on port `5173`. Browser actions were limited to viewing and navigation; no account was created or modified.

| Scenario | Result | Evidence / next step |
| --- | --- | --- |
| AUTH-R01 | PASS, visible browser | Expo login → Sign Up displayed Patient and Nurse Practitioner only. Doctor, Paramedic, and Admin were absent. |
| AUTH-G05 | PASS, visible browser | Expo login and admin/doctor portal login both displayed Continue with Google disabled and the message “Google sign-in is not configured yet.” |
| AUTH-G01–G04 | BLOCKED | No Google Cloud OAuth Web client ID is configured. Create the client and apply the three environment variables in [Google sign-in setup](GOOGLE-SIGN-IN-SETUP.md), then test with an existing development account. |
| AUTH-R02–R03, email delivery/MFA cases | NOT RUN | These require disposable accounts and working development email delivery. |
| Other live scenarios | NOT RUN | Await supervised test data and the sequence in the scenario document. |

Automated checks completed before this browser run: 27 backend authentication regression and Google token verification tests passed; Expo TypeScript check and web production build passed. These checks do not establish that a real Google login or email delivery works.
