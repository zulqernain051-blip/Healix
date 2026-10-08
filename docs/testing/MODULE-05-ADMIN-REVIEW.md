# Module 5 — Administrator: workflow and implementation review

Status: **for user review, 2026-10-06**. This is a source review, not an approved workflow or live test result. No admin functionality was changed and no test scenarios were designed.

## Proposal baseline and decisions already made

Section 4.7 of `docs/product/FYP Proposal Healix Updated 2026.docx` gives the administrator system-wide oversight: staff accounts and permissions, operational data, and platform configuration. It describes credential verification and analytics as incomplete. The Module 1 decision supersedes its old doctor/paramedic onboarding assumptions: public signup is patient/nurse only; admins create or invite doctors/paramedics, and these accounts can log in immediately without OTP or a second approval. Nurse self-registration still requires an approval workflow.

## Current implementation

| Area | Current code behavior | Workflow decision needed |
| --- | --- | --- |
| Entry and platforms | Admin has a protected web portal with dashboard, user directory, operations, nurse/doctor verification, marketplace, config, audit, emergency and analytics. Expo also has an admin dashboard and detailed operations screens. Backend `/admin` routes enforce authentication and ADMIN role. | Is admin officially web-only, mobile-only or both? Which UI is authoritative? |
| Accounts and invitations | Web user directory searches/views users; can suspend/reactivate or soft-delete with a reason. It can create active doctor/paramedic accounts and generate invitations for ADMIN, DOCTOR, PARAMEDIC, NURSE or PATIENT. It displays a seven-day invitation token for private sharing. | Which roles may admins invite? Should invitation delivery be in-app/email rather than copying a token? Who may create another admin? |
| Professional verification | Nurse queue has approval/rejection/revocation; nurse documents are reviewed. A separate doctor queue still exposes approve/reject/revoke controls and pending-doctor metrics. | Doctor approval conflicts with the approved no-second-approval flow. Decide whether to remove that queue, retain only credential revocation/audit, or redefine it for legacy accounts. |
| Care and clinical oversight | Admin routes list requests, contracts, visits, unassigned/assigned/high-risk cases; dashboard exposes escalated cases and manual doctor assignment override. Marketplace monitor can remove offers. | Define what admins may override, required reasons, and what patients/clinicians are told. |
| Emergency/network operations | APIs and mobile/web screens cover emergency assignment/escalation, paramedics, ambulances and hospitals. | Specify which actions are operational prototypes versus a real dispatch workflow; public emergency-service integration is not validated. |
| Platform operations | Config page edits registry keys with a reason. Operations page manages role-feature overrides, user profile edits, support/refund cases, recorded payments and externally settled commissions; monitor shows API/database/outbox health. | Define which config/permission changes are safe for a single admin and which need review or rollback controls. Payment screens record external settlement rather than moving money. |
| Governance | Audit log view/export, moderation of nurse reviews, and analytics/reports screens exist. | Define audit retention/access/export, review moderation policy and which analytics are reliable enough to report. |

## Source map

- Proposal: `docs/product/FYP Proposal Healix Updated 2026.docx`, section 4.7.
- Web: `web/src/App.tsx`, `web/src/components/Sidebar.tsx`, `web/src/pages/admin/` and `web/src/pages/EmergencyOperations.tsx`.
- Expo: `mobile/src/app/admin/`.
- API: `backend/src/domains/identity/admin/admin.routes.ts`, `admin-operations.routes.ts`, `support.routes.ts`, `admin.service.ts`; emergency and analytics routes are in their own domains.

## Points to settle before scenario design

1. Which admin platform do we treat as primary, web or Expo? Are some tasks restricted to one?
2. Which roles can an admin create directly or invite, especially other administrators, patients and nurses?
3. What should replace the doctor approval queue now that doctor/paramedic onboarding needs no second approval?
4. What actions can an admin take on a live case, visit, offer or emergency, and what audit/notification is required?
5. Which operational areas belong in Module 5 versus separate marketplace, emergency, payment and analytics modules?

## Potential discrepancies to verify later

- “Doctor Verification” and pending-doctor counts remain prominent in web and Expo, contrary to the approved onboarding rule. The underlying approve/reject/revoke API endpoints also still exist.
- The web invitation form offers PATIENT and NURSE as well as staff roles, although the public signup and admin-provisioning policy previously discussed focused on patient/nurse self-signup and doctor/paramedic admin provisioning.
- The web directory role filter omits PARAMEDIC even though admins can create paramedics.
- Invitation tokens are displayed on the admin page for copying; reliable invitation email delivery is not established by this review.
- Refund/commission screens explicitly record actions completed outside Healix. They are not evidence of integrated payment or bank settlement.
- The dashboard describes doctor pending verification and urgent case telemetry; those labels should be checked against the final workflow and actual alert delivery.
