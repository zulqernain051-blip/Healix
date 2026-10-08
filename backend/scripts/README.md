# Backend maintenance scripts

Run these tools from the **backend directory** so that environment loading and working-directory paths remain consistent:

```sh
cd backend
pnpm exec tsx scripts/database/check-db.ts
```

| Folder | Purpose |
| --- | --- |
| `database/` | Seeds, database inspection, data cleanup, and listing repairs |
| `audit/` | Historical phase audits that exercise the database and domain workflow |
| `manual-tests/` | Live API, marketplace, emergency, chat, and socket checks |

Use `pnpm seed:users` for the role seed and `pnpm seed:demo` for the demo patient/nurse/doctor seed. JavaScript tools can be run with `node scripts/<folder>/<file>.js`.

These are manual development tools, not the isolated Jest suite. Several audits and manual checks create or delete records; `clear-db.ts` and `clean_data.ts` delete data. Review a tool before using it on a disposable development database. The cleanup did not execute these tools or seed data.

The historical `manual-tests/test_socket.js` still references a machine-specific socket.io-client installation. It needs its dependency path reviewed before reuse.

Previously applied source patches are in `../archive/patches/`. They retain their original working-directory assumptions and are historical reference, not routine commands. The old test patchers refer to `test_e2e.ts`, now under `scripts/manual-tests/`.
