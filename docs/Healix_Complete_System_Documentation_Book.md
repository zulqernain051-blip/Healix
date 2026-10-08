HEALIX

COMPLETE SYSTEM DOCUMENTATION BOOK

Architectural Specification, Screen-by-Screen Walkthrough,
End-to-End Workflows, and System Reference Manual

Department of Computer Science & Software Engineering

Final Year Project (FYP) Core Deliverable

PART I
PROJECT & ARCHITECTURAL SPECIFICATION

Theoretical Foundations, Requirements Engineering, Domain Architecture, Database Design, Security Governance, and Technical Infrastructure


# Chapter 1 — System Introduction & Overview


## 1.1 Clinical Background & Problem Domain

Modern healthcare ecosystems face a profound systemic bottleneck: the transitional gap between inpatient discharge and continuous home-based recovery. Post-operative patients, elderly citizens, and chronic disease sufferers (e.g., congestive heart failure, severe hypertension, type II diabetes) frequently experience life-threatening physiological deterioration within days of returning home. Traditional outpatient care models rely on unverified informal caregivers, fragmented home nursing agencies with opaque fee structures, and passive emergency dispatch systems that only activate after catastrophic collapse.

Three foundational structural failures characterize this crisis:
1. Decentralized & Unverified Home Nursing: Patients requiring skilled procedures (e.g., IV therapy, wound care, catheterization) struggle to verify professional licenses, leading to substandard clinical care and medication errors.
2. Clinical Deterioration Blind Spot: When a home nurse records abnormal vital signs, there is rarely an immediate, auditable pathway to a licensed physician. The delay between vital sign degradation and clinical intervention often spans hours or days, precipitating avoidable Emergency Department (ED) visits and 30-day hospital readmissions.
3. Fractured Emergency Tele-Triage: Ambulance services operate in clinical isolation. Paramedics dispatched to a decompensating patient typically lack access to the nurse's field vitals, longitudinal medical history, or the attending physician's orders.


## 1.2 The Healix Solution & Value Proposition

Healix is an enterprise-grade, decentralized home healthcare orchestration and real-time clinical tele-triage platform. Engineered as a mission-critical multi-tenant ecosystem, Healix directly bridges the gap between home-based patient care and centralized hospital oversight. The platform integrates five core user roles (Patient, Nurse, Doctor, Paramedic, Administrator) into a unified, reactive state machine governed by real-time event streaming and automated Clinical Decision Support Systems (CDSS).



| ■ CORE VALUE PROPOSITION Healix unifies care request marketplace bidding, verified digital contracting, bedside vital sign acquisition, multi-modal mathematical risk fusion, automated doctor escalation queues, and autonomous ambulance fleet dispatch into a single cohesive architecture. |
|---|



## 1.3 System Scope & Boundaries

The Healix ecosystem encompasses three client and server tiers:
• Mobile Cross-Platform Client: Built with React Native and Expo Router, providing role-adaptive native interfaces for Patients, Nurses, Doctors, and Administrators.
• Clinical Administration Web Portal: Built with React, Vite, and Tailwind CSS, tailored for hospital administrators and supervising physicians requiring wide-screen command-and-control views.
• Modular Monolith Backend: Built with Node.js, Express, TypeScript, and Prisma ORM, utilizing an outbox transactional event bus, WebSocket gateways, and PostgreSQL database storage.


## 1.4 Target User Personas



| Role Name | Key Responsibilities | Primary Interface | Clinical / Governance Scope |
|---|---|---|---|
| Patient / Caregiver | Requests home care, compares nurse offers, signs digital service contracts, tracks health records & longitudinal vitals, interacts with AI symptom checker. | Mobile App ((patient) routes) | Personal health record owner; consumer of clinical services. |
| Licensed Nurse | Browses local care requests, submits competitive bids, executes in-home clinical visits, administers medications, logs vital signs, and calculates CDSS risk scores. | Mobile App ((nurse) routes) | Field practitioner operating under state nursing board credentials. |
| On-Call Doctor | Monitors prioritized emergency review queues, examines escalated patient vitals, issues clinical orders, prescribes medications, and alters care plans. | Mobile App ((doctor) routes) & Web Portal | Licensed physician providing diagnostic and tele-triage oversight. |
| Emergency Paramedic | Receives automated ambulance dispatch orders, reviews field vital telemetry, communicates with field nurse/patient, transports patient to designated hospital. | Backend Architecture (Mobile UI in development) | Emergency medical responder; pre-hospital critical care provider. |
| System Administrator | Audits professional licenses, manages user accounts, monitors triage SLAs, oversees ambulance fleet, inspects immutable audit logs, configures system thresholds. | Mobile Admin & Web Admin Portal | Enterprise compliance, governance, and infrastructure overseer. |



# Chapter 2 — System Requirements & Specifications


## 2.1 Functional Requirements Matrix

The functional requirements of Healix are structured across core domain boundaries:



| Requirement ID | Functional Domain | Detailed Description | Priority |
|---|---|---|---|
| FR-AUTH-01 | Identity & Auth | The system shall authenticate users via dual-token JWT (access & refresh) with bcrypt password hashing, SMS/Email OTP, and MFA TOTP verification. | MANDATORY |
| FR-PAT-01 | Care Requests | Patients shall create geolocated care requests specifying care tier, budget range, scheduling, and specialized medical requirements. | MANDATORY |
| FR-MKT-01 | Care Marketplace | Licensed nurses shall view nearby care requests and place competitive bids; patients shall review offers and digitally execute binding contracts. | MANDATORY |
| FR-VIS-01 | Visit Execution | Nurses shall execute structured bedside visits, verifying care plans, recording e-MAR drug administration, and logging 7 core physiological vitals. | MANDATORY |
| FR-CDSS-01 | AI Risk Engine | The system shall fuse ML prediction, vital sign deviation, nurse confidence, and NLP symptom notes into a normalized 0-100 risk score and 4-tier triage tier. | MANDATORY |
| FR-DOC-01 | Emergency Triage | Critical (>=75) and High (50-74) risk assessments shall automatically escalate to on-call doctors via least-workload load balancing and 5-minute SLA timeouts. | MANDATORY |
| FR-EMG-01 | Ambulance Dispatch | Physicians ordering emergency transfer shall trigger automated ambulance assignment, hospital routing, and cross-party emergency tele-channels. | MANDATORY |
| FR-ADM-01 | Governance & Audit | Administrators shall verify nursing/medical licenses, inspect immutable audit logs, adjust system SLAs, and monitor healthcare network facilities. | MANDATORY |



## 2.2 Non-Functional Requirements (NFRs)

• Performance & Response Times: REST API endpoints must respond in < 200ms under standard loads. WebSocket event delivery across distributed clients must occur in < 100ms. CDSS mathematical fusion computation must execute in < 50ms.
• Security & Cryptographic Standards: All data in transit must enforce TLS 1.3 encryption. Passwords must be hashed using bcrypt with salt rounds >= 10. Sensitive authentication tokens must be stored in secure native storage (Expo SecureStore).
• Availability & Fault Tolerance: The system employs an Outbox Transactional Pattern ensuring zero event loss during network interruptions. Mobile nursing workflows include an offline mutation queue allowing bedside vital logging without internet connectivity.
• Regulatory Compliance: Architected in alignment with HIPAA Security and Privacy Rules (45 CFR Part 160/164), enforcing strict least-privilege Role-Based Access Control (RBAC), end-to-end data encryption, and immutable audit trails.


# Chapter 3 — System Architecture & Technical Design


## 3.1 Architectural Paradigm: Domain-Driven Modular Monolith

Healix is designed as a Domain-Driven Modular Monolith. Rather than introducing premature microservice network latency and distributed transaction hazards into life-critical clinical flows, the system encapsulates distinct bounded contexts within clean domain modules in a single high-performance TypeScript codebase. Inter-domain communication occurs through strictly typed service interfaces and an asynchronous Transactional Outbox Event Bus.


## 3.2 Full Technology Stack Inventory



| Tier / Component | Technologies & Frameworks | Architectural Purpose |
|---|---|---|
| Mobile Client | React Native 0.76, Expo SDK 52, Expo Router v4, React 19, TypeScript, Lucide Icons, NativeWind/Tailwind | Cross-platform iOS/Android app delivering role-based dynamic interfaces for Patients, Nurses, Doctors, and Admins. |
| Web Portal | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Axios | High-density command center for hospital administrators and supervising clinical physicians. |
| Backend Services | Node.js, Express, TypeScript, Zod Schema Validation, Jest, Supertest | Modular monolith backend providing 78 REST endpoints, authentication, business logic, and policy enforcement. |
| Data & Persistence | PostgreSQL 15+, Prisma ORM 5.x, Docker Containerization | Relational database maintaining 35 entity models, ACID transaction guarantees, and complex relational constraints. |
| Realtime & Async | Socket.io 4.x, Event Bus Outbox Worker, SLA Timeout Daemon | Bidirectional WebSocket pub/sub messaging, background cron escalation workers, and asynchronous event distribution. |



## 3.3 High-Level System Topology & Interaction Flow

The architecture is organized into four vertical tiers with horizontal event streaming:
1. Presentation Tier: React Native mobile application and React web dashboard.
2. API Gateway & Routing Tier: Express HTTP server handling rate limiting, CORS, JWT extraction, and role authorization.
3. Domain Logic Tier: Decoupled service layers (Auth, Care, Visit, Clinical, Emergency, Notification) enforcing clinical protocols.
4. Data & Realtime Tier: PostgreSQL relational database accessed via Prisma ORM and Socket.io room-based WebSocket engine.


# Chapter 4 — Database Architecture & Data Models


## 4.1 Relational Schema Architecture

The Healix database is modeled in Prisma ORM (`backend/prisma/schema.prisma`) comprising 35 strongly-typed models and 16 clinical/operational enumerations. The relational model enforces strict foreign key integrity, cascading delete policies for transient operational state, and immutable preservation for clinical audit records.


## 4.2 Core Entity Model Domains



| Domain Boundary | Key Entity Models | Functional Scope & Responsibility |
|---|---|---|
| Identity & Access | User, Patient, Nurse, Doctor, Paramedic, Admin | Multi-role user authentication, professional credentials, license states, and specialization metadata. |
| Clinical Records & EHR | HealthRecord, MedicalHistory, VitalSign, Prescription, CarePlan | Longitudinal patient clinical profile, chronic condition tracking, vital histories, and active medication regimens. |
| Marketplace & Contracting | CareRequest, CareContract, ContractPayment | Geolocated care requests, nurse bids/offers, digital service contract execution, and escrow payouts. |
| Clinical Visits & Triage | Visit, ClinicalReview, DoctorSchedule, ShiftSchedule | In-home clinical visit scheduling, bedside execution checklists, CDSS risk score logging, and doctor review queues. |
| Emergency & Logistics | AmbulanceDispatch, Ambulance, Hospital | Critical tele-triage ambulance orders, vehicle telemetry tracking, nearest hospital routing, and handover tracking. |
| Communications & Audit | ChatSession, Message, Notification, AuditLog, AppConfig | Role-isolated chat rooms, real-time messaging, multi-channel notifications, and immutable audit logs. |



# Chapter 5 — Security, Authentication & Access Control


## 5.1 Dual-Token JWT Authentication Flow

Healix implements a dual-token cryptographic authentication strategy:
• Access Token: Short-lived (15 minutes), signed with HMAC SHA-256 (`JWT_SECRET`). Contains `{ id, email, role, status }` payload. Attached as a Bearer token in the HTTP `Authorization` header for all protected API calls.
• Refresh Token: Long-lived (7 days), signed with a distinct secret (`JWT_REFRESH_SECRET`). Stored in encrypted mobile device storage and utilized exclusively against `/api/v1/auth/refresh` to obtain new access tokens without re-prompting user credentials.


## 5.2 Role-Based Access Control (RBAC) Matrix

Healix enforces fine-grained authorization via `authenticate` and `authorizeRoles` middleware:



| Resource / Capability | Patient | Nurse | Doctor | Paramedic | Admin |
|---|---|---|---|---|---|
| Submit Care Request | ALLOW | DENY | DENY | DENY | DENY |
| Bid on Marketplace Requests | DENY | ALLOW | DENY | DENY | DENY |
| Execute Visit & Submit Vitals | DENY | ALLOW | DENY | DENY | DENY |
| Review Critical Triage & Prescribe | DENY | DENY | ALLOW | DENY | DENY |
| Dispatch Ambulance & Emergency | DENY | DENY | ALLOW | DENY | ALLOW |
| Audit Logs & License Approvals | DENY | DENY | DENY | DENY | ALLOW |



## 5.3 Tamper-Evident Audit Logging

All security-sensitive operations (e.g., authentication attempts, vital submissions, clinical orders, license status modifications) automatically trigger the creation of an immutable record in the `AuditLog` table. Each audit entry captures the action verb, actor ID, target entity, originating client IP address, user-agent string, and an arbitrary JSON snapshot of changes.


# Chapter 6 — Implementation & Deployment Overview


## 6.1 Codebase Monorepo Anatomy

The project is structured into three primary application tiers within a single unified workspace:
• `/backend`: Node.js Express server organized by domain (`/src/domains`), shared utilities (`/src/common`), Prisma database schema, and test suites.
• `/mobile`: React Native Expo application organized by file-based route hierarchy (`/src/app`), reusable UI components (`/src/components`), hooks, and Zustand state stores.
• `/web`: React Vite portal for administrative oversight and desktop clinical management (`/src/pages`, `/src/components`).


## 6.2 API Gateway & Service Organization

The backend exposes 78 RESTful endpoints mapped under `/api/v1/`. Each domain follows a strict architectural pattern: `Route -> Validation Middleware (Zod) -> Controller -> Service Layer -> Repository -> Database / Event Outbox`. This enforces complete separation of concerns and guarantees that business logic remains testable and decoupled from HTTP routing.

PART II
COMPLETE VISUAL SYSTEM WALKTHROUGH

Screen-by-Screen Reference, UI Architecture, Element Verification, and Backend Traceability


# Chapter 7 — Authentication & Session Module

The Authentication module serves as the primary secure ingress for all users, implementing dual-token JWT flow, RBAC routing, and Multi-Factor Authentication (MFA).


## Screen 7.1 — Welcome & Landing Gate

Source: mobile/src/app/index.tsx  |    [FULLY IMPLEMENTED]



| ■ INTERFACE WIREFRAME & LAYOUT TOPOLOGY +---------------------------+ |      [Healix Logo]        | |   Decentralized Care      | |                           | |  [ Login to Account ]     | |  [ Create New Account ]   | +---------------------------+ |
|---|


Purpose: Primary application entry point and local token hydrator.

Functionality: Checks for existing JWT tokens in SecureStore. If found, automatically hydrates global Zustand state and redirects to the appropriate role dashboard. If no token, renders Welcome UI.


### Interface Elements



| Element | Type | Label / Content | Action / Behavior | Validation / Rules |
|---|---|---|---|---|
| Login Button | Primary Action | Log In | Navigates to 7.2 | None |
| Register Button | Secondary Action | Create Account | Navigates to 7.3 | None |



### User Workflow

1. App launches and RootLayout mounts.

2. useAuth store attempts token retrieval.

3. If token valid, silent router.replace to /(role)/(tabs)/home.

4. If no token, user taps Login or Register.

System Behavior: Executes local SecureStore read. No external API call unless token verification is needed.


### API & Backend Interaction



| Endpoint & Method | N/A  Local SecureStore |
|---|---|
| Request Payload | None |
| Response Schema | { token, user_data } |
| Error Codes | Missing/Expired Token |
| State Changes | None |


Validation Rules: JWT structural validation (exp claim).
Success Behavior: Immediate redirection to authenticated routes.
Error Handling: Remains on Welcome screen.

Entry Path: App Launch   |   Exit / Next Screens: Login (7.2), Register (7.3), or Role Dashboards



| ■ CLINICAL / ARCHITECTURAL RATIONALE: SCREEN 7.1 Prevents authenticated users from seeing the login screen on app restart. Enhances UX by eliminating redundant logins. |
|---|



## Screen 7.2 — User Sign-In / Login

Source: mobile/src/app/auth/login.tsx  |    [FULLY IMPLEMENTED]



| ■ INTERFACE WIREFRAME & LAYOUT TOPOLOGY +---------------------------+ | Welcome Back              | |                           | | [ Email Address       ]   | | [ Password            ]   | |                           | |      Forgot Password?     | |                           | | [    Secure Login     ]   | +---------------------------+ |
|---|


Purpose: Authenticates user identity against the backend and establishes a secure session.

Functionality: Captures credentials, POSTs to backend, handles MFA challenge, and persists tokens.


### Interface Elements



| Element | Type | Label / Content | Action / Behavior | Validation / Rules |
|---|---|---|---|---|
| Email Input | Text Input | Email | Captures email | Must be valid email format |
| Password Input | Secure Text | Password | Captures password | Must be >= 8 chars |
| Login Button | Primary Action | Secure Login | Triggers API call | Disabled if inputs invalid |



### User Workflow

1. User enters email and password.

2. User taps 'Secure Login'.

3. System shows loading spinner and POSTs credentials.

4. Upon success, system receives { accessToken, refreshToken, user }.

System Behavior: Backend hashes password, compares with DB. Generates JWTs. Logs AuditEvent(LOGIN).


### API & Backend Interaction



| Endpoint & Method | POST  /api/v1/auth/login |
|---|---|
| Request Payload | { email, password } |
| Response Schema | { token, refresh, user, mfaRequired? } |
| Error Codes | 401 Unauthorized, 403 Account Locked, 404 User Not Found |
| State Changes | None |


Validation Rules: Zod schema validation on client and server.
Success Behavior: Navigates to Role Dashboard (or MFA Verify if enabled).
Error Handling: Displays red error toast / inline message.

Entry Path: Welcome (7.1)   |   Exit / Next Screens: Role Dashboard, MFA Verify (7.5), Forgot Password (7.6)



| ■ CLINICAL / ARCHITECTURAL RATIONALE: SCREEN 7.2 Standard secure entry mechanism enforcing strict credential validation. |
|---|



# Chapter 8 — Patient Portal Module

The Patient module empowers users to broadcast care requests to the marketplace, manage their longitudinal health records, interact with the AI symptom checker, and establish verified care contracts.


## Screen 8.1 — Patient Home Dashboard

Source: mobile/src/app/(patient)/(tabs)/home.tsx  |    [FULLY IMPLEMENTED]



| ■ INTERFACE WIREFRAME & LAYOUT TOPOLOGY +---------------------------+ | Hi, John Doe     [Bell]   | |                           | | [ Active Care Request ]   | | 2 Offers Available!       | |                           | | Next Visit: Tomorrow      | | Provider: Jane Smith, RN  | |                           | | [ AI Symptom Check ]      | | [ Request Home Care ]     | +---------------------------+ |
|---|


Purpose: Aggregates critical alerts, active requests, upcoming visits, and primary call-to-actions.

Functionality: Fetches dashboard summary data, displays active contract status, and routes to deep features.


### Interface Elements



| Element | Type | Label / Content | Action / Behavior | Validation / Rules |
|---|---|---|---|---|
| Active Request Card | Widget | Request Status | Navigates to Request Detail | Visible if active request exists |
| Upcoming Visit Card | Widget | Next Visit Info | Navigates to Visit Detail | Visible if visit scheduled |
| AI Check Button | Action | AI Symptom Check | Navigates to 8.15 | None |
| New Request Button | Action | Request Home Care | Navigates to 8.4 | None |



### User Workflow

1. User arrives post-login.

2. Screen calls GET /patient/dashboard-summary.

3. Renders widgets based on current patient state (idle, requesting, matched, scheduled).

System Behavior: Aggregates data across CareRequest, Visit, and Contract domains via efficient SQL JOINs.


### API & Backend Interaction



| Endpoint & Method | GET  /api/v1/patient/dashboard |
|---|---|
| Request Payload | None (Bearer Token) |
| Response Schema | { activeRequests, upcomingVisits, unreadMessages } |
| Error Codes | 401 Unauthorized |
| State Changes | None |


Validation Rules: None (Read-only view)
Success Behavior: Displays populated dashboard.
Error Handling: Displays 'Failed to load dashboard' with retry button.

Entry Path: Login (7.2)   |   Exit / Next Screens: New Request (8.4), AI Checker (8.15), Messages (8.16)



| ■ CLINICAL / ARCHITECTURAL RATIONALE: SCREEN 8.1 Reduces cognitive load by pushing critical actionable items to the surface. |
|---|



## Screen 8.3 — Care Request Detail & Offer Comparison

Source: mobile/src/app/(patient)/requests/[id].tsx  |    [FULLY IMPLEMENTED]



| ■ INTERFACE WIREFRAME & LAYOUT TOPOLOGY +---------------------------+ | Request Details           | | Tier: Post-Operative      | | Status: BROADCASTING      | |                           | | --- Nurse Offers (2) ---  | | [ RN Jane Smith | $50/hr] | | [ LPN Mark Lee  | $40/hr] | |                           | | [ Cancel Request ]        | +---------------------------+ |
|---|


Purpose: Allows the patient to review the status of an active request and inspect competitive bids from local nurses.

Functionality: Displays request parameters. Lists incoming nurse offers. Replaces 'Compare offers' with 'See Offers'.


### Interface Elements



| Element | Type | Label / Content | Action / Behavior | Validation / Rules |
|---|---|---|---|---|
| Status Badge | Indicator | BROADCASTING | None | Colors map to status |
| Offer List Item | Card | Nurse Name, Price | Navigates to Offer Detail 8.5 | None |
| Cancel Button | Action | Cancel Request | Triggers DELETE / cancel API | Confirmation modal required |



### User Workflow

1. User clicks on active request from dashboard.

2. System fetches request details and associated bids.

3. User reviews bids.

4. User taps a bid to view nurse profile and contract terms.

System Behavior: Fetches relations `CareRequest` <- `CareContract` (status=PROPOSED).


### API & Backend Interaction



| Endpoint & Method | GET  /api/v1/care/requests/:id |
|---|---|
| Request Payload | None |
| Response Schema | { requestDetails, offers: [...] } |
| Error Codes | 404 Not Found |
| State Changes | None |


Validation Rules: Validates request ownership via JWT.
Success Behavior: Renders details and bids.
Error Handling: Shows error toast.

Entry Path: Dashboard (8.1) or Requests Tab (8.2)   |   Exit / Next Screens: Offer Detail (8.5), Dashboard



| ■ CLINICAL / ARCHITECTURAL RATIONALE: SCREEN 8.3 Decentralizes care by allowing patients to choose their provider based on price, ratings, and credentials. |
|---|



# Chapter 9 — Licensed Nurse Module

The Nurse module is engineered for field operations, offering marketplace bidding, structured clinical visit execution, multi-modal vital sign logging, and offline queue synchronization.


## Screen 9.3 — Clinical Visit Execution Console

Source: mobile/src/app/(nurse)/visits/[id].tsx  |    [FULLY IMPLEMENTED]



| ■ INTERFACE WIREFRAME & LAYOUT TOPOLOGY +---------------------------+ | Visit: John Doe           | | Time: 10:00 AM - 11:00 AM | | Status: IN PROGRESS       | |                           | | [ Patient Summary ]       | | [ Care Plan Checklist ]   | | [ e-MAR / Medications ]   | |                           | | [ ENTER VITAL SIGNS ]     | |                           | | [ Complete Visit ]        | +---------------------------+ |
|---|


Purpose: The primary operational hub for a nurse during an active home visit.

Functionality: Provides access to clinical summaries, checklists, and the vital signs entry gateway. Manages visit state (Scheduled -> In Progress -> Completed).


### Interface Elements



| Element | Type | Label / Content | Action / Behavior | Validation / Rules |
|---|---|---|---|---|
| Vitals Button | Action | Enter Vital Signs | Navigates to 9.7 | Highlights if missing |
| Complete Button | Action | Complete Visit | Triggers POST completion | Disabled if vitals/checklist incomplete |



### User Workflow

1. Nurse arrives at patient location.

2. Taps 'Start Visit' (status -> IN_PROGRESS).

3. Performs care, checks off care plan items.

4. Enters vital signs.

5. Taps 'Complete Visit'.

System Behavior: Updates `Visit` status. Emits state changes via Outbox. Checks offline sync queue if network drops.


### API & Backend Interaction



| Endpoint & Method | PATCH  /api/v1/visit/:id/status |
|---|---|
| Request Payload | { status: 'IN_PROGRESS' | 'COMPLETED' } |
| Response Schema | { visit } |
| Error Codes | 400 Invalid Transition, 403 Forbidden |
| State Changes | None |


Validation Rules: Cannot complete visit if required vitals are missing per SLA.
Success Behavior: Visit marked completed, returns to schedule.
Error Handling: Caches action in OfflineQueue if network unavailable.

Entry Path: Visits Hub (9.2)   |   Exit / Next Screens: Vitals Entry (9.7), Care Plan (9.5)



| ■ CLINICAL / ARCHITECTURAL RATIONALE: SCREEN 9.3 Enforces strict clinical protocol adherence during field operations. |
|---|



## Screen 9.7 — Vital Signs & CDSS Risk Assessment

Source: mobile/src/app/(nurse)/visits/risk-assess.tsx  |    [FULLY IMPLEMENTED]



| ■ INTERFACE WIREFRAME & LAYOUT TOPOLOGY +---------------------------+ | Heart Rate: [ 95 ] bpm    | | BP Sys: [ 140 ] mmHG      | | BP Dia: [  90 ] mmHG      | | SpO2:   [  94 ] %         | | Temp:   [ 38.1 ] C        | |                           | | Nurse Confidence (1-10):  | | [ 4 - Patient looks bad]  | |                           | | [ Calculate Risk Score ]  | +---------------------------+ |
|---|


Purpose: Captures 7 core physiological parameters and triggers the multi-modal AI Risk Fusion Engine.

Functionality: Validates inputs against biological limits. POSTs to backend for FusedScore calculation. Immediate UI feedback on risk tier.


### Interface Elements



| Element | Type | Label / Content | Action / Behavior | Validation / Rules |
|---|---|---|---|---|
| Numeric Inputs | Fields | HR, BP, SpO2, Temp, RR, Glucose | Input | Hard biological boundary limits (e.g., HR 20-300) |
| Calculate | Primary Action | Submit Vitals | POST /vitals | All required fields filled |



### User Workflow

1. Nurse records metrics.

2. Submits payload.

3. Backend CDSS engine computes FusedScore.

4. If score > 50 (HIGH/CRITICAL), triggers Doctor Escalation.

System Behavior: Saves `VitalSign`. Evaluates `FusedScore = (ML*0.45) + (VitalsDev*0.3) + (NurseConf*4) + (NLP*0.1)`. If >= 75, creates `ClinicalReview` and starts SLA Timeout Worker.


### API & Backend Interaction



| Endpoint & Method | POST  /api/v1/clinical/vitals |
|---|---|
| Request Payload | { visitId, hr, bpSys, bpDia, spo2, temp, rr, glucose, notes, confidence } |
| Response Schema | { vitals, cdssResult: { score, tier, escalated } } |
| Error Codes | 400 Validation Error |
| State Changes | None |


Validation Rules: Biological limits enforced by Zod.
Success Behavior: Displays Risk Tier Badge. Highlights if doctor escalated.
Error Handling: Highlights invalid fields.

Entry Path: Visit Execution (9.3)   |   Exit / Next Screens: Back to Visit Execution



| ■ CLINICAL / ARCHITECTURAL RATIONALE: SCREEN 9.7 Bridges the gap between field observation and computational risk tracking. Automates emergency escalation. |
|---|



# Chapter 10 — On-Call Doctor Tele-Triage Module

The Doctor module operates as an emergency tele-triage center. Doctors receive prioritized escalations from the CDSS engine and possess authority to modify care plans or dispatch ambulances.


## Screen 10.2 — Escalated Case Review

Source: mobile/src/app/(doctor)/reviews/[id].tsx  |    [FULLY IMPLEMENTED]



| ■ INTERFACE WIREFRAME & LAYOUT TOPOLOGY +---------------------------+ | URGENT REVIEW REQUIRED    | | Patient: John Doe         | | Risk Tier: CRITICAL (82)  | |                           | | Vitals: HR 120, BP 160/95 | | Nurse Notes: Chest pain.  | |                           | | [ Take Clinical Action ]  | | [ Message Field Nurse  ]  | +---------------------------+ |
|---|


Purpose: Displays critical patient vitals that triggered an escalation, requiring physician sign-off.

Functionality: Shows FusedScore breakdown. Allows doctor to 'Resolve', 'Change Care Plan', or 'Dispatch Ambulance'.


### Interface Elements



| Element | Type | Label / Content | Action / Behavior | Validation / Rules |
|---|---|---|---|---|
| Risk Banner | Alert | CRITICAL | None | Red background for critical |
| Action Button | Action | Take Clinical Action | Navigates to 10.3 | None |



### User Workflow

1. Doctor receives push notification/SLA alert.

2. Opens case.

3. Reviews vitals.

4. Taps 'Take Clinical Action' to prescribe or escalate.

System Behavior: Clears SLA timeout lock for this case once the doctor acts.


### API & Backend Interaction



| Endpoint & Method | GET  /api/v1/clinical/reviews/:id |
|---|---|
| Request Payload | None |
| Response Schema | { reviewDetails, patientHistory } |
| Error Codes | 404 Not Found |
| State Changes | None |


Validation Rules: Doctor ID must match assigned doctor.
Success Behavior: Loads case data.
Error Handling: Error toast.

Entry Path: Doctor Dashboard (10.1)   |   Exit / Next Screens: Clinical Action Form (10.3)



| ■ CLINICAL / ARCHITECTURAL RATIONALE: SCREEN 10.2 Replaces fragmented phone calls with a structured, auditable tele-triage escalation protocol. |
|---|



# Chapter 11 — Enterprise Administrator Module

The Administrator module provides total ecosystem oversight. Accessed via the Mobile Admin Hub and Web Portal, it handles credential verification, system configuration, SLA tracking, and audit logging.


## Screen 11.1 — Mobile Command Center / Admin Dashboard

Source: mobile/src/app/admin/index.tsx  |    [FULLY IMPLEMENTED]



| ■ INTERFACE WIREFRAME & LAYOUT TOPOLOGY +---------------------------+ | System Command            | |                           | | Active Users: 1,402       | | Pending Approvals: 12     | |                           | | [ User Management ]       | | [ Credential Audits ]     | | [ Triage Overseer ]       | | [ System Audit Logs ]     | +---------------------------+ |
|---|


Purpose: Provides high-level system metrics and navigation to all governance domains.

Functionality: Fetches global stats and renders the administrative grid.


### Interface Elements



| Element | Type | Label / Content | Action / Behavior | Validation / Rules |
|---|---|---|---|---|
| Grid Item | Navigation | Audit Logs | Navigates to 11.13 | None |



### User Workflow

1. Admin logs in.

2. Sees health of system.

3. Taps specifically into pending credential audits.

System Behavior: Fetches aggregated counts via SQL COUNT() queries.


### API & Backend Interaction



| Endpoint & Method | GET  /api/v1/admin/dashboard |
|---|---|
| Request Payload | None |
| Response Schema | { totalUsers, pendingVerification, criticalCases } |
| Error Codes | 403 Forbidden |
| State Changes | None |


Validation Rules: Strict RBAC check: role === 'ADMIN'.
Success Behavior: Loads command grid.
Error Handling: Force logout if unauthorized.

Entry Path: Login (7.2)   |   Exit / Next Screens: Users (11.2), Verification (11.3), Config (11.12)



| ■ CLINICAL / ARCHITECTURAL RATIONALE: SCREEN 11.1 Ensures platform integrity and clinical compliance by putting governance tools in a single hub. |
|---|



# Chapter 12 — Emergency Paramedic Module



| ■ STATUS: BACKEND ONLY IMPLEMENTATION AUDIT FINDING: The Paramedic module is functionally implemented at the BACKEND DATABASE and API level (Ambulance, Hospital, AmbulanceDispatch, Socket.io channels). However, the dedicated MOBILE UI `(paramedic)` routes are currently missing from the frontend repository. If a user logs in with the PARAMEDIC role, the mobile app experiences a routing fallback loop. |
|---|


The Paramedic module architecture handles the extreme end of the clinical escalation ladder. When an On-Call Doctor issues a `REQUEST_EMERGENCY_AMBULANCE` command, the backend engine executes the following logic:
1. Locates the nearest available `Ambulance` via geolocation approximation.
2. Generates an `AmbulanceDispatch` record linking the `Visit`, `Doctor`, and `Paramedic`.
3. Provisions specialized emergency WebSocket chat rooms (`PATIENT_PARAMEDIC`, `NURSE_PARAMEDIC`).
4. Streams the patient's critical vitals directly to the paramedic.


# Chapter 13 — Clinical AI & Decision Support System (CDSS)

Healix removes the subjectivity from home-based clinical decline through its Multi-Modal CDSS Risk Fusion Engine.


## 13.1 The Fused Risk Scoring Algorithm

The system calculates a single `FusedScore` (0-100) combining statistical deviations, subjective nurse observations, and historical context:

FusedScore = (ML_Prediction × 0.45) + (VitalsDeviation × 0.30) + (NurseConfidence × 4) + (NLP_Notes × 0.10)

Vitals Deviation is calculated against established biological baselines:

• Heart Rate: Normal 60-100 bpm
• Systolic BP: Normal 90-120 mmHg
• SpO2: Normal 95-100% (critical below 90%)
• Temperature: Normal 36.5-37.5°C


## 13.2 Autonomous SLA Escalation Worker

When a score enters HIGH (50-74) or CRITICAL (75-100), the system assigns an On-Call Doctor and initializes a 5-minute Service Level Agreement (SLA) timer. The background `sla-timeout.worker.ts` sweeps the database via node-cron. If the assigned doctor has not acted within 5 minutes, the worker strips the assignment and broadcasts the critical case to ALL available network doctors simultaneously to ensure rapid intervention.


# Chapter 14 — Messaging and Notifications

Real-time communications are powered by Socket.io, creating strict, role-isolated event channels ensuring patient privacy.



| Channel Type | Participants | Trigger Mechanism |
|---|---|---|
| PATIENT_NURSE | Patient & Matched Nurse | Automatically created upon CareContract execution. |
| NURSE_DOCTOR | Field Nurse & On-Call Doctor | Automatically created upon CRITICAL risk escalation. |
| EMERGENCY | Nurse, Patient & Paramedic | Created when Doctor dispatches Ambulance. |


PART III
END-TO-END WORKFLOWS & CROSS-ROLE JOURNEYS


# Chapter 15 — Core Operational Workflows


## Workflow 1: Home Care Request & Marketplace Bidding

Objective: Allow a patient to broadcast a care need and receive competitive bids from verified nurses.
Actors: Patient, Nurse
Preconditions: Patient is authenticated; Nurse is verified and online.

[ Patient ] --(POST /request)--> [ API Gateway ]
                                     |
                               [ DB: CareRequest ]
                                     |
[ Nurse 1 ] <--(SSE / Poll)----------+
[ Nurse 2 ] <--(SSE / Poll)----------+
                                     |
[ Nurse 1 ] --(POST /offer)--------> [ DB: Contract (PROPOSED) ]
                                     |
[ Patient ] <--(Notification)--------+


### Step-by-Step Process

1. Patient navigates to 'New Request', sets schedule, tier, and budget.
1. System creates `CareRequest` with status BROADCASTING.
1. Local nurses view the request in the Marketplace feed.
1. Nurse submits a bid via `POST /api/v1/care/requests/:id/offer`.
1. System creates a `CareContract` with status PROPOSED and notifies the Patient.


| ■ Failure & Recovery Mode If no nurse bids within 24 hours, the request status is automatically downgraded and patient is notified to adjust the budget. |
|---|



## Workflow 2: Clinical Visit & CDSS Escalation

Objective: Execute a visit, log vitals, and automatically alert a doctor if the patient is deteriorating.
Actors: Nurse, CDSS Engine, Doctor
Preconditions: Active contract; Visit status is IN_PROGRESS.

[ Nurse ] --(Submit Vitals)--> [ CDSS Engine ]
                                     |
                              [ Math Fusion >= 75 ]
                                     |
[ SLA Worker ] <--(Lock 5 Min)-------+---> [ DB: ClinicalReview ]
                                     |
[ Doctor ] <---(Push Alert)----------+


### Step-by-Step Process

1. Nurse records HR, BP, SpO2, Temp at bedside.
1. Nurse taps 'Submit Vitals'.
1. CDSS Engine computes FusedScore.
1. Score evaluates to 82 (CRITICAL).
1. System generates `ClinicalReview`, assigns an On-Call Doctor via load balancer, and starts the SLA timer.
1. Doctor receives a critical push notification and opens the Case Review console.


| ■ Failure & Recovery Mode If the assigned doctor does not open the review within 5 minutes, `sla-timeout.worker.ts` re-assigns the review to 'SYSTEM' and broadcasts to all doctors. |
|---|



# Chapter 16 — Cross-Role Collaboration Journeys

The following matrix maps the complete lifecycle of a chronic patient suffering from acute deterioration, demonstrating the multi-actor handoffs through the Healix system.



| Phase | Active Actor | System State & Action |
|---|---|---|
| 1. Initiation | Patient | Creates Request for post-op cardiac monitoring. |
| 2. Match | Nurse | Bids $45/hr; Patient accepts; Contract Executed. |
| 3. Execution | Nurse | Arrives, checks vitals. SpO2 is 88%, BP 180/110. |
| 4. CDSS Triage | System (AI) | Computes Critical Score (88); Triggers Escalation. |
| 5. Intervention | Doctor | Reviews case; Orders Emergency Ambulance transfer. |


PART IV
SYSTEM REFERENCES & TECHNICAL INDICES


# Chapter 17 — Complete Screen Index

Comprehensive matrix of all mobile and web user interfaces implemented in the Healix ecosystem.



| Screen ID & Name | Source Path | Implementation Status |
|---|---|---|
| 7.2 - User Sign-In | mobile/src/app/auth/login.tsx | Fully Implemented |
| 8.1 - Patient Dashboard | mobile/src/app/(patient)/(tabs)/home.tsx | Fully Implemented |
| 8.3 - Request Detail | mobile/src/app/(patient)/requests/[id].tsx | Fully Implemented |
| 9.3 - Visit Execution | mobile/src/app/(nurse)/visits/[id].tsx | Fully Implemented |
| 10.2 - Case Review | mobile/src/app/(doctor)/reviews/[id].tsx | Fully Implemented |



# Chapter 18 — Complete API Endpoint Directory

Healix backend exposes 78 RESTful endpoints. The following is a sample of the core critical path endpoints:



| Method & Path | Authorized Role | Purpose |
|---|---|---|
| POST /api/v1/auth/login | Public | Authenticates user and returns dual JWTs. |
| POST /api/v1/care/requests | Patient | Creates a new localized home care request. |
| POST /api/v1/care/requests/:id/offer | Nurse | Submits a competitive bid/offer. |
| POST /api/v1/clinical/vitals | Nurse | Records vitals and triggers CDSS fusion math. |
| POST /api/v1/emergency/dispatch | Doctor | Generates AmbulanceDispatch and provisions emergency chat. |



# Chapter 19 — Database Schema Reference

The PostgreSQL database utilizes Prisma ORM spanning 35 tables. Key entities include:



| Model Name | Primary Key / Foreign Keys | Description |
|---|---|---|
| User | id (UUID) | Root identity, credentials, and RBAC role. |
| CareRequest | id (UUID), patientId (FK) | Service request broadcasting criteria. |
| CareContract | id (UUID), requestId, nurseId | Legally binding agreement status mapping. |
| Visit | id (UUID), contractId, nurseId | Execution container for a clinical encounter. |
| VitalSign | id (UUID), visitId (FK) | Immutable record of 7 physiological metrics. |

