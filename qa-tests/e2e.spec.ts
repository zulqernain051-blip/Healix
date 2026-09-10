import { test, expect } from '@playwright/test';

test('Healix End-to-End Clinical Workflow', async ({ browser }) => {
  test.setTimeout(120000); // 2 minutes

  // Create three separate browser contexts to simulate different devices
  const patientContext = await browser.newContext();
  const nurseContext = await browser.newContext();
  const doctorContext = await browser.newContext();

  const patientPage = await patientContext.newPage();
  const nursePage = await nurseContext.newPage();
  const doctorPage = await doctorContext.newPage();

  const baseUrl = 'http://localhost:8081';

  // ---------------------------------------------------------
  // 1. PATIENT LOGIN & CREATE REQUEST
  // ---------------------------------------------------------
  console.log('--- PATIENT: Logging in ---');
  await patientPage.goto(baseUrl);
  
  // Wait for redirect to login or home
  await patientPage.waitForLoadState('networkidle');
  
  // If we are at role select or login, handle it
  if (patientPage.url().includes('role-select')) {
    await patientPage.getByText('Patient', { exact: true }).click();
  }
  
  // Fill login
  await patientPage.getByPlaceholder('Email Address').fill('patient1@gmail.com');
  await patientPage.getByPlaceholder('Password').fill('abc123$%');
  await patientPage.getByRole('button', { name: 'Log In' }).click();

  // Wait for dashboard to load
  await expect(patientPage.getByText('Patient Dashboard').or(patientPage.getByText('Home'))).toBeVisible({ timeout: 15000 });

  console.log('--- PATIENT: Creating Care Request ---');
  // Navigate to Requests
  await patientPage.getByRole('button', { name: 'New Request' }).or(patientPage.getByText('Requests')).click();
  
  // Wait for navigation
  await patientPage.waitForTimeout(2000);
  
  // We need to fill the request form. Since we don't know the exact fields, we'll try to find common ones.
  // ... to be continued
});
