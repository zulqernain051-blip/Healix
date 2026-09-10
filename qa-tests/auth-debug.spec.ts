import { test, expect } from '@playwright/test';

test('auth debug', async ({ page }) => {
  await page.goto('http://localhost:8081');
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.context().clearCookies();
  await page.goto('http://localhost:8081');
  await page.locator('input').nth(0).fill('patient1@gmail.com');
  await page.locator('input').nth(1).fill('abc123$%');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForTimeout(2000);
  console.log('URL after login:', page.url());
  const bodyText = await page.innerText('body');
  console.log('Body after login:', bodyText.substring(0, 200));
});
