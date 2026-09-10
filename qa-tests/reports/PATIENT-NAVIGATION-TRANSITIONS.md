# PATIENT NAVIGATION TRANSITIONS

| Source Screen | Action | Destination Screen | Condition / Params |
|---------------|--------|--------------------|--------------------|
| home/index | Profile Press | /(patient)/profile | None |
| home/index | Notification Press | /(patient)/notifications | None |
| home/index | Risk Details | /(patient)/records/risk-history | isHighRisk == true |
| home/index | Upcoming Visit | /(patient)/requests | None |
| home/index | Quick Action: Request | /(patient)/requests/new | None |
| home/index | Quick Action: Records | /(patient)/records | None |
| home/index | Quick Action: AI | /(patient)/ai | None |
| home/index | Quick Action: Prescriptions | /(patient)/health/prescriptions | None |
| profile/index | Personal Info | /(patient)/profile/edit | None |
| profile/index | Emergency Contacts | /(patient)/profile/emergency-contacts | None |
| profile/index | Medical Info | /(patient)/health/medical | None |
| profile/index | Settings | /(patient)/profile/settings | None |
| health/index | Vitals | /(patient)/records/vitals | None |
| health/index | Medical Timeline | /(patient)/health/medical | None |
| health/index | Active Care Plans | /(patient)/health/careplans | None |
| health/index | Prescriptions | /(patient)/health/prescriptions | None |
| health/index | Family Caregivers | /(patient)/health/caregivers | None |
| health/index | Recurring Visits | /(patient)/health/recurring | None |
| records/index | Clinical Outcomes | /(patient)/health/clinical-outcomes | None |
| records/index | Vitals | /(patient)/records/vitals | None |
| records/index | Prescriptions | /(patient)/health/prescriptions | None |
| records/index | Care Visits | /(patient)/requests | None |
| records/index | AI Risk History | /(patient)/records/risk-history | None |
