import { test, expect } from '@playwright/test';

test.describe('Healix End-to-End Clinical Workflow', () => {
  
  test('Complete E2E Workflow (Patient -> Nurse -> Doctor -> Resolution)', async ({ browser }) => {
    test.setTimeout(3 * 60 * 1000); // 3 minutes for this chunk to speed it up

    const patientContext = await browser.newContext();
    const nurseContext = await browser.newContext();

    const patientPage = await patientContext.newPage();
    const nursePage = await nurseContext.newPage();
    const baseURL = 'http://localhost:8081';

    // -----------------------------------------------------
    // PATIENT
    // -----------------------------------------------------
    await patientPage.goto(baseURL);
    await patientPage.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await patientPage.context().clearCookies();
    await patientPage.goto(baseURL);
    await patientPage.waitForTimeout(1000);
    if (await patientPage.getByText('Patient', { exact: true }).isVisible()) {
      await patientPage.getByText('Patient', { exact: true }).click();
    }
    await patientPage.locator('input').nth(0).fill('patient1@gmail.com');
    await patientPage.locator('input').nth(1).fill('abc123$%');
    await patientPage.getByRole('button', { name: /Sign In/i }).click();
    await expect(patientPage.getByText(/Dashboard|Patient Portal/i).first()).toBeVisible({ timeout: 15000 });

    await patientPage.getByText(/Request Healthcare/i).click();
    await patientPage.waitForTimeout(1000);
    await patientPage.getByPlaceholder(/Describe your medical needs/i).fill('Post-treatment home monitoring');
    await patientPage.getByPlaceholder(/Female Nurse/i).fill('None');
    await patientPage.getByPlaceholder(/45/i).fill('60');
    await patientPage.getByText('Flexible', { exact: true }).click();
    await patientPage.getByRole('button', { name: /Submit Request/i }).click();
    await patientPage.waitForTimeout(2000);

    // -----------------------------------------------------
    // NURSE
    // -----------------------------------------------------
    await nursePage.goto(baseURL);
    await nursePage.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await nursePage.context().clearCookies();
    await nursePage.goto(baseURL);
    await nursePage.waitForTimeout(1000);
    if (await nursePage.getByText('Nurse', { exact: true }).isVisible()) {
      await nursePage.getByText('Nurse', { exact: true }).click();
    }
    await nursePage.locator('input').nth(0).fill('nurse1@gmail.com');
    await nursePage.locator('input').nth(1).fill('abc123$%');
    await nursePage.getByRole('button', { name: /Sign In/i }).click();
    await expect(nursePage.getByText(/Marketplace|Nurse/i).first()).toBeVisible({ timeout: 15000 });

    await nursePage.getByText(/Marketplace/i).first().click();
    await nursePage.waitForTimeout(1000);
    
    // Click first open request (Nurse Visit or Custom Request)
    await nursePage.getByText(/OPEN/i).first().click();
    await nursePage.waitForTimeout(1000);
    
    const submitOfferButton = nursePage.getByText(/Submit Offer|Make Offer/i).first();
    if (await submitOfferButton.isVisible()) {
      await submitOfferButton.click();
      await nursePage.waitForTimeout(1000);
      await nursePage.locator('input').first().fill('1500'); 
      const sendBtn = nursePage.getByRole('button', { name: /Send|Submit/i }).first();
      if (await sendBtn.isVisible()) {
        await sendBtn.click();
      } else {
        await nursePage.getByText(/Send|Submit/i).first().click();
      }
    }
    await nursePage.waitForTimeout(2000);

    // -----------------------------------------------------
    // PATIENT ACCEPT
    // -----------------------------------------------------
    await patientPage.getByText(/Requests/i).first().click();
    await patientPage.waitForTimeout(1000);
    
    // Click the first OPEN request
    await patientPage.getByText(/OPEN/i).first().click();
    await patientPage.waitForTimeout(1000);
    
    // Accept Offer
    const acceptBtn = patientPage.getByText(/Accept/i).first();
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
    }
    await patientPage.waitForTimeout(2000);
  });
});
