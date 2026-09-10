# Patient Navigation Map

- **Root Layout** (_layout.tsx): Defines Main Tabs and Sidebar for Large Screens.
  - Tab 1: Home/Dashboard
  - Tab 2: Requests
  - Tab 3: Marketplace
  - Tab 4: Visits
  - Tab 5: Profile
- **Home -> Notifications**: Pushes /notifications
- **Home -> Profile**: Pushes /profile
- **Home -> Records/Vitals**: Pushes /records/vitals or /records/risk-history
- **Home -> AI**: Pushes /ai
- **Home -> Prescriptions**: Pushes /health/prescriptions
- **Health Section**: Routes to health/vitals, health/medical, health/careplans, health/prescriptions, health/caregivers, health/recurring.
