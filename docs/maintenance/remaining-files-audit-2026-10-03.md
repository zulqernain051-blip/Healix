# Remaining files and folders audit — 2026-10-03

The repository was scanned outside dependency trees and generated export folders. The tracked project now has a clear separation between runtime code, maintenance scripts, documentation, QA, and historical material.

## Cleanup completed during this pass

- Removed the unused Expo starter component set from `mobile/src/components/` (`app-tabs`, animated splash/icon, themed wrappers, hint row, web badge, external link, and unused collapsible UI).
- Removed the unreferenced Vite starter assets `web/src/assets/react.svg` and `web/src/assets/vite.svg`.
- Removed the stale root `package-lock.json`. The root is a pnpm workspace; the web and QA packages retain their own npm lockfiles as documented in the root README.
- Renamed the reconstructed nurse offer variable from `mockExistingOffer` to `existingOffer`; the value is derived from the listing response and is not mock data.
- Fixed care-request coordinate fallback logic to use nullish checks, preserving valid latitude/longitude values of `0` instead of replacing them with the patient fallback location.

## Intentional files and folders to keep

- `archive/`, `backend/archive/`, `docs/archive/`, and `mobile/docs/history/` contain historical tools, exports, screenshots, and notes. They are outside runtime discovery and are referenced by the relocation manifest.
- `backend/public/uploads/chat/` is an empty runtime upload directory and should remain available for chat attachments.
- `mobile/.expo/`, `mobile/dist-audit/`, `mobile/dist-audit-final/`, `.eslint-audit.json`, and `.unused-audit.txt` are ignored local output. They are disposable and should be removed from a developer machine when no longer needed.
- `web/package-lock.json` and `qa-tests/package-lock.json` are package-local locks and match the separate npm install instructions.

## Remaining cleanup candidates

- Empty source directories remain under `backend/src/domains/care/requests/usecases/assignment` and `backend/src/domains/care/visit/shared/{constants,types,validation}`, plus an empty mobile patient route directory. They contain no tracked files and do not affect builds; removing them is a cosmetic follow-up.
- Twenty feature components currently have no static imports from routes or other components. They are legacy/planned UI candidates, not proven defects; confirm product coverage before deleting them: `mobile/src/components/{nurse,patient}/` cards/forms and `mobile/src/components/marketplace/OfferStatusBadge.tsx` are the main group.
- The learning documents under `docs/learning/` contain absolute `file:///f:/...` links. They render on the original machine but should be converted to repository-relative links if the documents are intended to be portable.
- Backend source still contains planned domain-event/CQRS TODOs and intentionally simulated integrations. Prescription creation still stores a placeholder PDF URL, and the clinical risk endpoint exposes a timeout simulation query for test workflows. These are functional follow-ups rather than file-organization issues.

## Verification

- Mobile TypeScript check passed after removing the starter files.
- Backend TypeScript check passed and all 101 Jest tests passed after the coordinate fix.
- Web production build passed after removing the unused SVG assets.
- No remaining imports reference the removed mobile starter components or web SVGs.
