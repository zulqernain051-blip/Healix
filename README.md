# Healix

Healthcare project with a backend API, an Expo mobile app, a web dashboard, and browser QA tests.

## Project map

| Folder | Purpose |
| --- | --- |
| `backend/src/` | Runtime API code: domain modules, shared infrastructure, and routes |
| `backend/prisma/` | Database schema |
| `backend/scripts/` | Explicitly run database tools, audits, and manual integration checks |
| `backend/docs/` | Backend architecture, conventions, and decisions |
| `mobile/src/` | Expo Router screens, components, API clients, hooks, and types |
| `mobile/assets/` | App images and icons |
| `mobile/docs/` | Implementation history and completion reports |
| `web/src/` | Web dashboard |
| `qa-tests/` | Playwright suites, fixtures, and curated reports |
| `docs/` | Product documents, design references, audits, and learning material |
| `archive/` | Historical tools and test snapshots |
| `backend/archive/` | One-off backend patches retained for reference |

The shared [design system](HEALIX_DESIGN_SYSTEM.md) and agent instructions remain at their existing locations.

## Install and run

Use Node.js and pnpm for the root workspace (`backend` and `mobile`):

```sh
pnpm install --frozen-lockfile
pnpm backend:dev
pnpm mobile:start
```

If pnpm is accessed through Corepack on your machine, use `corepack pnpm` in place of `pnpm`.

The web dashboard and QA package currently have separate npm lockfiles. Install them from the root with:

```sh
npm --prefix web ci
npm --prefix qa-tests ci
pnpm web:dev
```

Configure `backend/.env` before starting the API. Its required variables are `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`; see `backend/src/common/config/index.ts` for validation and optional settings. Prisma uses PostgreSQL. Generate the client with `pnpm --filter healix-backend prisma:generate` and apply development migrations with `pnpm --filter healix-backend prisma:migrate` against your development database.

## Checks

```sh
pnpm backend:test
pnpm backend:typecheck
pnpm backend:build
pnpm mobile:lint
pnpm web:build
pnpm qa:list
pnpm qa:test
```

Browser QA needs the app and API running, suitable test data, and Playwright's Chromium installed. Check [QA setup](qa-tests/README.md) before running it.

## Maintenance

Start with the [documentation index](docs/README.md) and [backend script guide](backend/scripts/README.md). Historical scripts can patch source files or change database data; they are kept outside runtime source and automated test discovery.

Keep runtime code in each app's `src/`, reusable maintenance tools in `scripts/`, written references in `docs/`, and generated output out of Git. See the [cleanup record](docs/maintenance/project-cleanup.md) for relocation details.
