// Every Jest run gets a new PostgreSQL schema. Never run integration cleanup on app data.
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
require('dotenv').config({ path: path.join(root, '.env') });
const { PrismaClient } = require('@prisma/client');
async function main() {
 const args = process.argv.slice(2);
 const workflow = args[0] === '--workflow' ? args[1] : null;
 if (args[0] === '--workflow' && (!workflow || args.length !== 2 || !/^[a-z0-9-]+\.ts$/.test(workflow))) throw new Error('Supply one manual workflow filename.');
 if (!process.env.DATABASE_URL) throw new Error('Configure the local database before running tests.');
 const original = new URL(process.env.DATABASE_URL);
 const schema = 'healix_test_' + randomUUID().replaceAll('-', '');
 if (!/^healix_test_[a-f0-9]{32}$/.test(schema)) throw new Error('Invalid isolated test schema');
 const db = new PrismaClient({ datasources: { db: { url: original.toString() } } });
 let created = false;
 try {
  await db.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`); created = true;
  const isolated = new URL(original); isolated.searchParams.set('schema', schema);
  const env = { ...process.env, DATABASE_URL: isolated.toString(), NODE_ENV: 'test', HEALIX_TEST_SCHEMA: schema };
  const prepare = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'db', 'push', '--skip-generate', '--schema', path.join(root, 'prisma/schema.prisma')], { cwd: root, env, encoding: 'utf8' });
  if (prepare.status !== 0) throw new Error('Could not prepare isolated test schema: ' + (prepare.stderr || prepare.stdout));
  console.log('Running tests in an isolated, temporary PostgreSQL schema.');
  const command = workflow
   ? [path.join(root, 'scripts/dev/run-typescript.cjs'), path.join(root, 'scripts/manual-tests', workflow)]
   : [require.resolve('jest/bin/jest'), '--runInBand', ...args];
  const result = spawnSync(process.execPath, command, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
 } finally {
  // Only this run's freshly created, validated schema can be removed.
  if (created) {
   const evidenceRoot = path.resolve(root, 'private/visit-evidence');
   const evidencePath = path.resolve(evidenceRoot, schema);
   if (!evidencePath.startsWith(evidenceRoot + path.sep)) throw new Error('Invalid test evidence cleanup path');
   await require('node:fs/promises').rm(evidencePath, { recursive: true, force: true });
  }
  if (created) await db.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
  await db.$disconnect();
 }
}
void main().catch(error => { console.error(error.message); process.exitCode = 1; });
