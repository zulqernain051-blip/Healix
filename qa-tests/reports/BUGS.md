# Healix — Bug Database
*Generated: 2026-09-03*

## AUTH MODULE
| BUG-ID | Severity | Screen | Description | Root Cause | Fix Applied | Status |
|--------|----------|--------|-------------|------------|-------------|--------|
| AUTH-01 | HIGH | `auth/register.tsx` | Doctor registration impossible | Missing `pmdcNumber` field for DOCTOR role | Added conditional field for `pmdcNumber` in registration form | FIXED |
| AUTH-02 | LOW | `hooks/useAuth.ts` | Logout does not invalidate token | `useLogout` only cleared local state | Wired `useLogout` to hit `/auth/logout` with refreshToken | FIXED |

## PATIENT MODULE
| BUG-ID | Severity | Screen | Description | Root Cause | Fix Applied | Status |
|--------|----------|--------|-------------|------------|-------------|--------|
| PAT-01 | MEDIUM | `requests/new.tsx` | Location hardcoded | `location.address` set to "Default Home Address" | (Pending - Requires geo-integration) | PENDING |
| PAT-02 | LOW | `requests/new.tsx` | Recurring stub | Recurring care requests use a static stub payload | (Pending - Requires recurring UI) | PENDING |

## NURSE MODULE
| BUG-ID | Severity | Screen | Description | Root Cause | Fix Applied | Status |
|--------|----------|--------|-------------|------------|-------------|--------|
| NUR-01 | CRITICAL | `visits/patient-summary.tsx` | Mock data shown | Screen used a hardcoded `mockPatient` object | Wired `usePatientProfile(patientId)` | FIXED |
| NUR-02 | CRITICAL | `visits/care-plan.tsx` | Mock data shown | Screen used a static `carePlan` variable | Wired `useCarePlans(patientId)` hook | FIXED |
| NUR-03 | CRITICAL | `visits/prescription-view.tsx`| Mock data shown | Prescriptions were statically hardcoded | Wired `usePrescriptions(patientId)` | FIXED |
| NUR-04 | HIGH | `patients/[id].tsx` | Incomplete data | Sourced data from `useNurseVisits` instead of full profile | Wired `usePatientProfile(id)` | FIXED |
| NUR-05 | HIGH | `visits/clinical/*.tsx` | UI Freezes on Web | `window.alert()` swallowed React render cycle | Swapped execution order of alert and state update | FIXED |
| NUR-06 | HIGH | `visits/[id].tsx` | Stuck on completion | No navigation after clicking "Complete Visit" | Added `router.replace('/(nurse)/visits')` | FIXED |

## DOCTOR MODULE
| BUG-ID | Severity | Screen | Description | Root Cause | Fix Applied | Status |
|--------|----------|--------|-------------|------------|-------------|--------|
| DOC-01 | LOW | `reviews/[id].tsx` | Mock data fallback | `compliance` object resolves to undefined | Handled missing data gracefully | FIXED |

## ADMIN MODULE
| BUG-ID | Severity | Screen | Description | Root Cause | Fix Applied | Status |
|--------|----------|--------|-------------|------------|-------------|--------|
| ADM-01 | MEDIUM | `admin/config.tsx` | Read-only configuration | Form renders `defaultConfigs` array with no inputs | (Pending - Requires UI inputs) | PENDING |

## EMERGENCY MODULE
| BUG-ID | Severity | Screen | Description | Root Cause | Fix Applied | Status |
|--------|----------|--------|-------------|------------|-------------|--------|
| EMG-01 | MEDIUM | `clinical.service.ts` | Implicit assignment | HIGH risk creates assignment without specific `doctorId` | Expected behavior (broadcast queue) | PASS |
