import { test, expect } from '@playwright/test';

test('Visibility Test', async ({ page }) => {
  console.log('Starting visibility test...');
  await page.goto('http://localhost:8081');
  console.log('Navigated to Healix login page.');
  
  // Wait to allow human observation
  await page.waitForTimeout(3000);
  
  // Interact visibly
  await page.locator('input').nth(0).fill('visibility-test@gmail.com');
  await page.waitForTimeout(2000);
  
  console.log('Waiting 10 seconds for user to observe browser...');
  await page.waitForTimeout(10000);
  console.log('Test complete. Closing browser.');
});
