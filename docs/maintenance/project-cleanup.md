# Project cleanup — 2026-10-02

The cleanup preserves the existing application source, database schema, navigation, design system, dependencies, lockfiles, and work in progress.

- Grouped root documents into `docs/product`, `docs/notes`, `docs/learning`, and `docs/audits`.
- Archived one-off root tools and backend source patch scripts without executing them.
- Moved backend seeds, database tools, audits, and manual checks into `backend/scripts`; updated their relative source imports.
- Moved maintenance scripts and the architecture audit out of `backend/src` so production builds contain application code.
- Grouped mobile planning notes and completion reports into `mobile/docs`.
- Preserved historical screenshots and generated test snapshots; ignored future test output and TypeScript build metadata.
- Added project, documentation, QA, and script guides plus root development/check commands.
- Kept web and QA as separately locked npm packages; removed the nonexistent `ai-service` workspace entry and replaced the unresolved build-permission placeholder with `false`.
- Limited Jest discovery to backend runtime source and excluded tests from production TypeScript output. Jest continues to typecheck tests through ts-jest.
- Made the QA report generator derive paths from its own location.

The full old-to-new mapping is in [file-moves.json](file-moves.json). Unchanged file contents were verified during relocation; the only content adjustments during moves were relative backend script imports. Historical reports and exported documents retain their original text and may mention previous paths.

Before cleanup: backend TypeScript checking succeeded; all 7 Jest suites (43 tests) passed. Maintenance scripts and live database/browser flows were not executed during cleanup.

After cleanup:

- All 7 Jest suites and 43 tests passed.
- Backend TypeScript checking and production build passed.
- Web TypeScript/Vite production build passed.
- Playwright successfully discovered all 6 tests in 6 files; live browser flows were not run.
- Verified all 66 relocation destinations and every relative source import in relocated backend scripts.
- Checked package JSON parsing, QA report-generator syntax, and generated-output ignore rules.

This machine did not expose `pnpm` directly on PATH, so validation used the installed local Node tools and `npm.cmd` scripts. Mobile runtime and lint validation were not performed; mobile application source was not changed by this cleanup.
