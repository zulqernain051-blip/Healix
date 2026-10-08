# Antigravity Global Project Rules — Healix

## 1. Design System Adherence (MANDATORY)

- All UI development, refactoring, and screen redesigns across Healix (Mobile & Web) **MUST** strictly follow the authoritative specification defined in [`HEALIX_DESIGN_SYSTEM.md`](./HEALIX_DESIGN_SYSTEM.md).
- Do **not** hardcode random colors, arbitrary padding, or ad-hoc styling rules. Always import and use tokens from `mobile/src/theme.ts`:
  - `COLORS.navy` (`#0B4268`) for primary clinical branding and buttons.
  - `COLORS.navyDark` (`#06294B`) for dark headers and high-contrast containers.
  - `COLORS.accentBlue` (`#29A9F5`) for interactive accents, badges, and calendar highlights.
  - `COLORS.careEmerald` / `COLORS.emerald` (`#10B981`) for completed statuses and success indicators.
  - `COLORS.surface` (`#F8FAFC`) and `COLORS.surfaceCard` (`#FFFFFF`) for light-mode surfaces.
  - `COLORS.textDark` (`#1E293B`) and `COLORS.textBody` (`#475569`) for readable dark text on light backgrounds.
  - `COLORS.inputBorder` / `COLORS.dividerLight` (`#E2E8F0`) for borders and dividers.
- Whenever replacing or creating a screen, verify against `HEALIX_DESIGN_SYSTEM.md` before finalizing code.

## 2. Architecture & Data Integrity Preservations

- **Controlled Frontend Redesign Only:** Never perform unauthorized backend rewrites, database schema modifications, or endpoint alterations during UI tasks.
- **Zero API Breakage:** Keep existing API hooks (`useDashboardSummary`, `useVisits`, `useRecords`, `usePatient`, etc.) intact and active.
- **Navigation Invariants:** Preserve standard Expo Router paths (`/(patient)/(tabs)/...`, `/(patient)/requests/...`, etc.).
- **Backend Tests Invariant:** Always ensure `jest --runInBand` passes 100% after making changes.
