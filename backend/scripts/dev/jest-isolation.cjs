const expected = process.env.HEALIX_TEST_SCHEMA;
let configured;
try { configured = new URL(process.env.DATABASE_URL).searchParams.get('schema'); } catch {}
if (!expected || !/^healix_test_[a-f0-9]{32}$/.test(expected) || configured !== expected) {
 throw new Error('Jest requires an isolated test schema. Run npm test; do not run Jest directly against the application database.');
}
