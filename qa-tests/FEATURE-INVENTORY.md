# Healix — Complete Feature Inventory
*Generated: 2026-09-03*

## Application Architecture
- **Frontend:** Expo Router (React Native Web) — `mobile/src/`
- **Backend:** Express + TypeScript — `backend/src/`
- **Database:** PostgreSQL via Prisma — `backend/prisma/schema.prisma`
- **Auth:** JWT-based with role selection
- **Roles:** PATIENT, NURSE, DOCTOR, ADMIN, PARAMEDIC

---

## AUTHENTICATION MODULE
| Screen | File | Features | Backend Endpoint | Status |
|--------|------|----------|-----------------|--------|
| Login | `auth/login.tsx` | Email/password, role select | POST /auth/login | PASS |
| Register | `auth/register.tsx` | Full registration form | POST /auth/register | FIXED |
| Forgot Password | `auth/forgot.tsx` | Email submission | POST /auth/forgot | PASS |
| Reset Password | `auth/reset.tsx` | Token-based reset | POST /auth/reset | PASS |
| Role Select | `auth/role-select.tsx` | Role picker after login | - | PASS |
| MFA Verify | `auth/mfa-verify.tsx` | MFA code entry | POST /auth/mfa-verify | PASS |
| Verify OTP | `auth/verify-otp.tsx` | OTP verification | POST /auth/verify-otp | PASS |
| Change Password | `auth/change-password.tsx` | Password change | POST /auth/change-password | PASS |

---

## PATIENT MODULE (28 screens)

### Dashboard
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Dashboard | `(patient)/home/index.tsx` | Summary cards, vitals, upcoming visits | PASS |

### Profile
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Profile View | `(patient)/profile/index.tsx` | View profile info | PASS |
| Edit Profile | `(patient)/profile/edit.tsx` | Edit name, phone, etc | PASS |
| Emergency Contacts | `(patient)/profile/emergency-contacts.tsx` | Add/edit contacts | PASS |
| Settings | `(patient)/profile/settings.tsx` | App settings | PASS |

### Health Records
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Health Hub | `(patient)/health/index.tsx` | Health overview | PASS |
| Medical History | `(patient)/health/medical.tsx` | Conditions, allergies, meds | PASS |
| Caregivers | `(patient)/health/caregivers.tsx` | Assigned caregivers | PASS |
| Care Plans | `(patient)/health/careplans.tsx` | Active care plans | PASS |
| Clinical Outcomes | `(patient)/health/clinical-outcomes.tsx` | Outcomes history | PASS |
| Prescriptions | `(patient)/health/prescriptions.tsx` | Prescription list | PASS |
| Recurring | `(patient)/health/recurring.tsx` | Recurring requests | PASS |

### Records
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Records Hub | `(patient)/records/index.tsx` | Records overview | PASS |
| Vitals History | `(patient)/records/vitals.tsx` | Historical vitals | PASS |
| Risk History | `(patient)/records/risk-history.tsx` | Risk assessments | PASS |

### Care Requests
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Request List | `(patient)/requests/index.tsx` | View all requests | PASS |
| New Request | `(patient)/requests/new.tsx` | Create care request | PENDING |
| Request Detail | `(patient)/requests/[id].tsx` | View/cancel request | PASS |

### Marketplace
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Marketplace | `(patient)/marketplace/index.tsx` | View listings | PASS |
| Offer Review | `(patient)/marketplace/[id].tsx` | Review nurse offers | PASS |
| Contracts List | `(patient)/marketplace/contracts/index.tsx` | View contracts | PASS |
| Contract Detail | `(patient)/marketplace/contracts/[id].tsx` | Approve/reject | PASS |

### Visits
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Visit List | `(patient)/visits/index.tsx` | View visits | PASS |
| Visit Detail | `(patient)/visits/[id].tsx` | Visit info | PASS |

### Communication
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Messages | `(patient)/messages/index.tsx` | Chat threads | PASS |
| Chat | `(patient)/messages/chat.tsx` | Send/receive messages | PASS |

### Other
| Screen | File | Features | Status |
|--------|------|----------|--------|
| AI Assistant | `(patient)/ai/index.tsx` | AI chat | PASS |
| Notifications | `(patient)/notifications/index.tsx` | Notification list | PASS |

---

## NURSE MODULE (24 screens)

### Dashboard
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Dashboard | `(nurse)/home/index.tsx` | Summary, scores, schedule | PASS |

### Marketplace
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Available Jobs | `(nurse)/marketplace/index.tsx` | Browse listings | PASS |
| Job Detail | `(nurse)/marketplace/[id].tsx` | Submit offer | PASS |
| Contracts List | `(nurse)/marketplace/contracts/index.tsx` | View contracts | PASS |
| Contract Detail | `(nurse)/marketplace/contracts/[id].tsx` | Approve contract | PASS |

### Visits
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Visit List | `(nurse)/visits/index.tsx` | View visits | PASS |
| Visit Detail | `(nurse)/visits/[id].tsx` | Start/complete visit | FIXED |
| Care Plan | `(nurse)/visits/care-plan.tsx` | View care plan | FIXED |
| Patient Summary | `(nurse)/visits/patient-summary.tsx` | Patient info | FIXED |
| Prescription View | `(nurse)/visits/prescription-view.tsx` | View prescriptions | FIXED |
| Risk Assessment | `(nurse)/visits/risk-assess.tsx` | AI risk assessment | PASS |

### Patients
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Patient List | `(nurse)/patients/index.tsx` | View patients | PASS |
| Patient Detail | `(nurse)/patients/[id].tsx` | Patient info | FIXED |
| Patient Timeline | `(nurse)/patients/[id]/timeline.tsx` | Visit history | PASS |

### Profile
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Profile | `(nurse)/profile/index.tsx` | View profile | PASS |
| Availability | `(nurse)/profile/availability.tsx` | Set availability | PASS |
| Earnings | `(nurse)/profile/earnings.tsx` | View earnings | PASS |
| Performance | `(nurse)/profile/performance.tsx` | Performance stats | PASS |
| Reviews | `(nurse)/profile/reviews.tsx` | View reviews | PASS |
| Verification | `(nurse)/profile/verification.tsx` | Upload docs | PASS |

### Communication
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Messages | `(nurse)/messages/index.tsx` | Chat threads | PASS |
| Chat | `(nurse)/messages/chat.tsx` | Send/receive messages | PASS |

### Other
| Screen | File | Features | Status |
|--------|------|----------|--------|
| Schedule | `(nurse)/schedule/index.tsx` | Schedule calendar | NOT_IMPLEMENTED |
| Sync | `(nurse)/sync/index.tsx` | Offline sync | NOT_IMPLEMENTED |

---

## DOCTOR MODULE (7 screens)

| Screen | File | Features | Status |
|--------|------|----------|--------|
| Dashboard | `(doctor)/home/index.tsx` | Case queue, alerts | PASS |
| Action (Case) | `(doctor)/action/[id].tsx` | Clinical actions | PASS |
| Diagnosis | `(doctor)/diagnosis/[id].tsx` | Create diagnosis | PASS |
| Care Plan | `(doctor)/careplan/[id].tsx` | Create care plan | PASS |
| Reviews | `(doctor)/reviews/[id].tsx` | Case reviews | FIXED |
| Messages | `(doctor)/messages/index.tsx` | Chat threads | PASS |
| Profile | `(doctor)/profile/index.tsx` | View profile | PASS |

---

## ADMIN MODULE (5 screens)

| Screen | File | Features | Status |
|--------|------|----------|--------|
| Dashboard | `admin/index.tsx` | Admin overview | PASS |
| Users | `admin/users.tsx` | User management | PASS |
| Nurses | `admin/nurses.tsx` | Nurse management | PASS |
| Doctors | `admin/doctors.tsx` | Doctor management | PASS |
| Config | `admin/config.tsx` | System config | PENDING |
