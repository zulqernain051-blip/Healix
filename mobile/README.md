# Healix Mobile

Expo Router app for patient, nurse, doctor, and administrative workflows.

## Run

From the project root:

```sh
pnpm install --frozen-lockfile
pnpm mobile:start
```

From this directory, use `pnpm android`, `pnpm ios`, or `pnpm web` to select a target. Start the backend API separately with `pnpm backend:dev` from the root. API host selection is implemented in `src/api/client.ts`; devices must be able to reach the backend.

## Structure

- `src/app/`: Expo Router routes grouped by role, authentication, and administration.
- `src/components/`: Shared UI and feature components.
- `src/api/`, `src/hooks/`, `src/types/`: API clients, query hooks, and data contracts.
- `src/store/`, `src/services/`, `src/utils/`: App state, socket connections, and helpers.
- `src/theme.ts`: Shared design tokens.
- `assets/`: Images, icons, and app assets.
- `docs/history/`, `docs/reports/`: Planning notes and completion reports.

Follow [AGENTS.md](AGENTS.md) and the [design system](../HEALIX_DESIGN_SYSTEM.md) when changing screens. Run `pnpm lint` from this directory to check mobile code. The existing reset-project script restores a starter layout; it is not a routine cleanup command.
