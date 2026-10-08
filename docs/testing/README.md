# Healix functionality and testing record

This folder is the working record for the current Healix review. It connects the proposal and PBD requirements to the implemented behavior, then to reproducible tests and any decisions made while testing. A feature is **verified** only after a dated run with an observable result; older QA reports remain historical evidence.

## Review sequence

1. **Functionality review:** inspect the proposal, PBD, current source, and existing reports. Record what each role can do, what is partial or missing, and where the intended behavior is unclear.
2. **Workflow and test design:** write the expected state transitions, actor actions, prerequisites, and pass criteria for each flow. Mark differences between the proposal and current product for a decision.
3. **Execution:** run the backend, Expo web app, and web portal; exercise workflows in a visible browser using development data. Record results and evidence. Browser checks do not verify native Android or iOS behavior.
4. **Repair and regression:** link each confirmed bug to a fix and rerun its failing case plus affected nearby flows. Update this record and the final module documentation when a decision changes the intended behavior.

## Source priority and evidence

| Source | Use in this review |
| --- | --- |
| `docs/product/FYP Proposal Healix Updated 2026.docx` | Project purpose, declared current state, and intended scope |
| `docs/product/Healix – Product Breakdown Document (PBD) v2.0.docx` | Detailed functional requirements |
| `docs/maintenance/pbd-completion-audit-2026-10-03.md` | Starting requirement-to-code comparison, not a live test result |
| `backend/src`, `mobile/src`, `web/src` | Current implementation evidence |
| `qa-tests/reports` and `qa-tests/e2e` | Historical claims and reusable test ideas; rerun before claiming current pass |

## Current functionality baseline

The October 2026 proposal describes an Expo patient and nurse app, doctor and administrator workflows, an Express API, PostgreSQL, and Socket.IO messaging. It explicitly describes current clinical risk assessment as rule based and chatbot responses as templated; trained ML and RAG remain planned. It also says doctor case management, care plans, prescriptions, production notifications, payments, and paramedic/ambulance integration are incomplete or need validation.

The PBD audit counted 314 named requirements across 15 modules: 163 complete by source review, 121 partial, and 30 missing. No module met every requirement. These counts are a **review starting point**, not current test results. The table below identifies the modules and the first behavior to inspect. Individual requirement IDs and prior assessments are in the PBD audit.

| Module | Initial behavior to inspect | PBD audit complete / total |
| --- | --- | ---: |
| Authentication and access | Registration, login, recovery, MFA, role boundaries | 12 / 16 |
| Patient | Profile, medical data, requests, records, care visibility | 25 / 28 |
| Nurse | Availability, bidding, visits, observations, offline behavior | 33 / 52 |
| Doctor | Case queue, clinical decision, diagnosis, prescription, plan | 13 / 29 |
| Care management | Request lifecycle, scheduling, cancellation, recurring care | 14 / 18 |
| Marketplace and bidding | Listing, offers, selection, competing offers | 12 / 19 |
| Contracts | Patient and nurse approval, activation, cancellation | 12 / 13 |
| Clinical intelligence | Risk rules, escalation, decision support boundaries | 3 / 18 |
| Communication | Chat, in-app notifications, external delivery | 10 / 15 |
| Emergency response | High/critical risk, dispatch, timeout, escalation | 2 / 13 |
| Visit verification | QR, location, manual fallback, auditability | 7 / 12 |
| Billing and payment | Charges, invoices, settlement, provider integration | 3 / 26 |
| Analytics and reporting | Role dashboards, metrics, exports | 2 / 18 |
| Administrator | Verification, users, overrides, configuration | 13 / 22 |
| Security and compliance | Authorization, privacy, audit, retention | 2 / 15 |

## Known discrepancies to resolve before test design

- `qa-tests/reports/FINAL-QA-REPORT.md` says all 28 end-to-end scenarios passed and calls the system production ready. The newer proposal and PBD audit describe substantial partial and missing functionality. We will use fresh evidence and avoid carrying that sign-off forward.
- `qa-tests/FEATURE-INVENTORY.md` labels many screens PASS, but a screen or API response does not prove an end-to-end user journey. Some listed paths reflect an older route layout.
- `qa-tests/reports/BUGS.md` still lists pending patient request and admin configuration issues. Their current status must be reproduced against this checkout.
- The existing Playwright suite contains one visible-browser normal-care test with fixed localhost URL and development account assumptions. It does not cover the full scenario register and may select existing records rather than the records it just created.

## Living records

| Record | Purpose |
| --- | --- |
| `MODULE-01-AUTHENTICATION.md` | Current authentication behavior, implementation evidence, and decisions awaiting approval |
| `WORKFLOWS.md` | Expected actor flows and state transitions, once functionality review is agreed |
| `TEST-CASES.md` | Reproducible cases with prerequisites and pass criteria |
| `RUN-LOG.md` | Dated command/browser runs, environment, result, and evidence |
| `ISSUES.md` | Confirmed bugs, severity, reproduction, fix, and retest |
| `DECISIONS.md` | Changes to intended functionality and rationale |

When a record is first needed, create it here and link it to the relevant requirement ID, code path, and test case. Do not place secrets or real patient information in these files.
