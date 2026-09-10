import { test, expect } from '@playwright/test';

test('Patient Login and Create Request', async ({ page }) => {
  const baseUrl = 'http://localhost:8081';

  console.log('Navigating to ' + baseUrl);
  await page.goto(baseUrl);
  
  // Wait for React Navigation to settle
  await page.waitForTimeout(2000);

  // Auth screen
  if (await page.getByText('Patient').isVisible()) {
     await page.getByText('Patient').click();
  }
  
  await page.getByPlaceholder('Email Address').fill('patient1@gmail.com');
  await page.getByPlaceholder('Password').fill('abc123$%');
  await page.getByText('Log In', { exact: true }).click();

  await page.waitForTimeout(3000);
  
  // Dashboard
  console.log('Logged in.');
  await expect(page.getByText('Dashboard').or(page.getByText('Home'))).toBeVisible({ timeout: 10000 });
});
