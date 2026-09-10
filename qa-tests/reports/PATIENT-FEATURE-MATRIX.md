# Patient Module Feature Matrix

| Feature | Screen / Component | Audit Status | DB Persistence | Notes / Fixes Applied |
|---------|--------------------|--------------|----------------|------------------------|
| **Dashboard** | `/(patient)/home/index.tsx` | PASS | Verified | Data binding verified. No major bugs found. |
| **Profile** | `/(patient)/profile/index.tsx` | PASS | Verified | Synced address data for emergency usage. |
| **Settings** | `/(patient)/profile/settings.tsx` | PASS | N/A | Local UI state checked. |
| **Medical History** | `/(patient)/records/index.tsx` | PASS | Verified | Checked Prisma retrieval hooks. |
| **Vitals** | `/(patient)/health/index.tsx` | PASS | Verified | Ensured POST hooks are properly connected to API. |
| **Risk** | `/(patient)/health/risk.tsx` | PASS | N/A | Read-only view verified. |
| **Care Requests (One-Time)** | `/(patient)/requests/new.tsx` | PASS | Verified | Fixed `PAT-01 Location hardcoded`. Now uses user's profile address. |
| **Care Requests (Recurring)** | `/(patient)/requests/new.tsx` | PASS | Verified | Fixed `PAT-02 Recurring stub`. Added frequency and limit UI and payload logic. |
| **Marketplace** | `/(patient)/marketplace/index.tsx` | PASS | N/A | Products list rendering correctly. |
| **Contracts** | `/(patient)/requests/[id].tsx` | PASS | Verified | Accept/Reject flows verified. |
| **Visits** | `/(patient)/visits/index.tsx` | PASS | Verified | Status transitions render correctly. |
| **Outcomes** | `/(patient)/visits/[id].tsx` | PASS | Verified | Visit summary and outcome submission verified. |
| **Notifications** | `/(patient)/notifications/index.tsx` | PASS | Verified | Socket/Polling logic active. |
| **Communication** | `/(patient)/messages/index.tsx` | PASS | Verified | Chat rendering and API sending verified. |

## Overall Status: 
**100% COMPLETE** - All features audited and passed.
