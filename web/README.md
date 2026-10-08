# Healix Web

React and Vite dashboard for administrative and doctor workflows.

## Run

From the project root:

```sh
npm --prefix web ci
npm --prefix web run dev
```

Start the backend separately with `pnpm backend:dev`. See `vite.config.ts` for the development API proxy. This package uses its own npm lockfile and is separate from the backend/mobile pnpm workspace.

## Structure

- `src/pages/`: Login, administrative pages, and doctor workflows.
- `src/components/`: Shared dashboard components.
- `src/store/`: Authentication and role state.
- `src/styles/`, `src/assets/`: Styling and visual assets.

Build with `npm --prefix web run build` from the project root; preview the build with `npm --prefix web run preview`. Follow the [shared design system](../HEALIX_DESIGN_SYSTEM.md) for UI changes.
