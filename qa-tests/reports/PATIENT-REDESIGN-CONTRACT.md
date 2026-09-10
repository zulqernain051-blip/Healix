# PATIENT REDESIGN CONTRACT

| Screen/Component | Classification | Reason |
|------------------|----------------|--------|
| `home/index` | Safe to change | Presentation layer; data fetched via hooks can be mapped to new UI easily. |
| `profile/index` | Safe to change | Static list of links. `logout` logic is simple and portable. |
| `health/index` | Safe to change | Mostly static navigation links and top-level risk score display. |
| `records/index` | Safe to change | Purely presentation navigation grid. |
| `utils/navigation` | Must preserve | Centralized navigation facade used by all patient screens. Changes here break all links. |
| `useDashboardSummary` | Change with caution | Drives high-risk alerts and UI logic. Any changes to data shape break `home` and `health`. |
| `useAuthStore` | Must preserve | Core state management. |
