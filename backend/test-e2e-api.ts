import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000';

async function runE2E() {
  console.log('--- STARTING HEALIX API E2E VERIFICATION ---');
  
  // 1. Authenticate Patient
  console.log('1. Authenticating Patient...');
  const patientRes = await fetch(\\/auth/login\, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone: 'patient1@gmail.com', password: 'abc123$%' })
  });
  if (!patientRes.ok) throw new Error('Patient login failed: ' + await patientRes.text());
  const patientData: any = await patientRes.json();
  const patientToken = patientData.accessToken;
  console.log('Patient authenticated.');

  // 2. Authenticate Nurse
  console.log('2. Authenticating Nurse...');
  const nurseRes = await fetch(\\/auth/login\, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone: 'nurse1@gmail.com', password: 'abc123$%' })
  });
  if (!nurseRes.ok) throw new Error('Nurse login failed: ' + await nurseRes.text());
  const nurseData: any = await nurseRes.json();
  const nurseToken = nurseData.accessToken;
  console.log('Nurse authenticated.');

  // 3. Create ONE-TIME Request
  console.log('3. Creating ONE-TIME request...');
  const createOneTimeRes = await fetch(\\/care-requests\, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': \Bearer \\ },
    body: JSON.stringify({
      type: 'NURSE_VISIT',
      scheduleType: 'ONE_TIME',
      durationMinutes: 60,
      preferredDate: new Date(Date.now() + 86400000).toISOString(),
      preferredTimeWindow: 'FLEXIBLE',
      notes: 'E2E ONE TIME TEST',
      address: '123 Main St',
      latitude: 40.7128,
      longitude: -74.0060,
      requirements: ['WOUND_CARE']
    })
  });
  if (!createOneTimeRes.ok) throw new Error('Create one-time request failed: ' + await createOneTimeRes.text());
  const oneTimeReq: any = await createOneTimeRes.json();
  console.log('ONE-TIME Request created: ' + oneTimeReq.id);

  // 4. Create RECURRING Request
  console.log('4. Creating RECURRING request...');
  const createRecurringRes = await fetch(\\/care-requests\, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': \Bearer \\ },
    body: JSON.stringify({
      type: 'NURSE_VISIT',
      scheduleType: 'RECURRING',
      durationMinutes: 60,
      recurringPattern: {
          frequency: 'DAILY',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          occurrencesRemaining: 3
      },
      preferredTimeWindow: 'FLEXIBLE',
      notes: 'E2E RECURRING TEST',
      address: '123 Main St',
      latitude: 40.7128,
      longitude: -74.0060,
      requirements: ['WOUND_CARE']
    })
  });
  if (!createRecurringRes.ok) throw new Error('Create recurring request failed: ' + await createRecurringRes.text());
  const recurringReq: any = await createRecurringRes.json();
  console.log('RECURRING Request created: ' + recurringReq.id);

  console.log('API E2E Setup completed successfully.');
}

runE2E().catch(console.error).finally(() => prisma.\$disconnect());
