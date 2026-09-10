# Admin Module Feature Matrix

| Feature / Screen | Frontend Implementation | API Integration | Backend Controller | DB Schema | Status | Notes / Fixes Applied |
|-----------------|-----------------------|----------------|-------------------|-----------|--------|----------------------|
| **Dashboard** | index.tsx | dminApi.getDashboardStats | getDashboardStats | Multiple | **PASS** | Validated. |
| **User Mgmt** | users.tsx | dminApi.getUsers, updateUserStatus | getUsers, updateUserStatus | User | **PASS** | updateUserStatus payload updated to inject \eason\ field expected by backend schema validation. |
| **Nurse Mgmt** | 
urses.tsx, erification.tsx | dminApi.getNurses, pproveNurse, ejectNurse | getAllNurses, pproveNurse, ejectNurse | Nurse | **PASS** | Verified credentials governance. |
| **Doctor Mgmt** | doctors.tsx, erification.tsx | dminApi.getDoctors, pproveDoctor, ejectDoctor | getAllDoctors, pproveDoctor, ejectDoctor | Doctor | **PASS** | Verified credentials governance. |
| **Paramedics** | paramedics.tsx | dminApi.getUsers('PARAMEDIC') | getUsers | Paramedic | **PASS** | Reuses generic user endpoints filtering by role. |
| **Patients** | patients.tsx | dminApi.getUsers('PATIENT') | getUsers | Patient | **PASS** | Reuses generic user endpoints filtering by role. |
| **Care Ops** | care.tsx | getCareRequests, getContracts, getVisits | getCareRequests, getContracts, getVisits | CareRequest, Contract, Visit | **PASS** | Data fetch pathways aligned. |
| **Clinical Ops** | clinical.tsx | getClinicalCases, overrideCaseAssignment | getClinicalCases, overrideCaseAssignment | CaseAssignment | **PASS** | Endpoints align correctly. |
| **Marketplace** | care.tsx (Offers) | getMarketplaceOffers | getOffers | Offer | **PASS** | **Fixed**: Endpoint mismatched (\/admin/offers\ -> \/admin/marketplace/offers\). |
| **Emergency** | emergency.tsx | getActiveEmergencies, ssignEmergencyDoctor | getEmergencies, ssignEmergencyDoctor | EmergencyEvent | **PASS** | **Fixed**: \getActiveEmergencies\ URL mismatched. \ssignEmergencyDoctor\ changed from PUT to POST. \escalateEmergency\ identified as unsupported stub. |
| **Hospitals** | 
etwork.tsx | getHospitals, createHospital, updateHospital | getHospitals, createHospital, updateHospital | Hospital | **PASS** | **Fixed**: Frontend form fields (\location\, \capacity\) rewritten to match DB schema (\latitude\, \longitude\, \capacityStatus\, \ffordabilityTier\, \isCharity\). |
| **Ambulances** | 
etwork.tsx | getAmbulances, createAmbulance | **MISSING** | **MISSING** | **BLOCKED** | **Fixed**: Removed fake Ambulance feature from UI, Hooks, and API client. The backend only uses \AmbulanceDispatch\ linked to \Paramedic\. |
| **Reviews** | eviews.tsx | getReviews, moderateReview | getNurseReviews, moderateNurseReview | NurseReview | **PASS** | **Fixed**: Frontend destructured wrong keys (e.g., \ating\, \status\). Updated to use DB-aligned keys (\stars\, \lagged\). Fixed moderation payload (\ction\ -> \lagged: boolean\). |
| **Config** | config.tsx | getConfig, updateConfig | getConfig, updateConfig | PlatformConfig | **PASS** | Payload uses correct parameters and provides \changeReason\. |
| **Audit Logs** | udit.tsx | getAuditLogs | getAuditLogs, exportAuditLogs | AdminAuditLog | **PASS** | Logs track actions properly. |
