import { test, expect } from '@playwright/test';

test.describe('E2E: Normal Clinical Workflow', () => {
  
  test('Scenario: ONE_TIME + LOW Risk Workflow', async ({ browser }) => {
    test.setTimeout(8 * 60 * 1000); // 8 minutes

    const patientContext = await browser.newContext();
    const nurseContext = await browser.newContext();
    const patientPage = await patientContext.newPage();
    const nursePage = await nurseContext.newPage();
    const baseURL = 'http://localhost:8081';

    patientPage.on('dialog', dialog => dialog.accept());
    nursePage.on('dialog', dialog => dialog.accept());

    // 1. PATIENT: Login & Request
    await test.step('Patient Login & Request', async () => {
      await patientPage.goto(baseURL);
      await patientPage.waitForTimeout(2000);
      if (await patientPage.getByText('Patient', { exact: true }).isVisible()) {
        await patientPage.getByText('Patient', { exact: true }).click();
      }
      await patientPage.locator('input').nth(0).fill('patient1@gmail.com');
      await patientPage.locator('input').nth(1).fill('abc123$%');
      await patientPage.getByRole('button', { name: /Sign In/i }).click();
      await expect(patientPage.getByText(/Dashboard|Patient Portal/i).first()).toBeVisible({ timeout: 15000 });

      await patientPage.getByText(/Request Healthcare/i).click();
      await patientPage.waitForTimeout(1000);
      await patientPage.getByPlaceholder(/Describe your medical needs/i).fill('Routine general assessment');
      await patientPage.getByText('Flexible', { exact: true }).click();
      await patientPage.getByRole('button', { name: /Submit Request/i }).click();
      await patientPage.waitForTimeout(3000);
    });

    // 2. NURSE: Marketplace Offer
    await test.step('Nurse Offer', async () => {
      await nursePage.goto(baseURL);
      await nursePage.waitForTimeout(2000);
      if (await nursePage.getByText('Nurse', { exact: true }).isVisible()) {
        await nursePage.getByText('Nurse', { exact: true }).click();
      }
      await nursePage.locator('input').nth(0).fill('nurse1@gmail.com');
      await nursePage.locator('input').nth(1).fill('abc123$%');
      await nursePage.getByRole('button', { name: /Sign In/i }).click();
      await expect(nursePage.getByText(/Marketplace|Nurse/i).first()).toBeVisible({ timeout: 15000 });

      await nursePage.getByText(/Marketplace/i).first().click();
      await nursePage.waitForTimeout(2000);
      await nursePage.locator('text=ACCEPTING OFFERS').first().click({ force: true });
      await nursePage.waitForTimeout(2000);
      
      const submitOfferButton = nursePage.getByRole('button', { name: /Submit Offer|Make Offer/i }).first();
      if (await submitOfferButton.isVisible()) {
        await submitOfferButton.click();
        await nursePage.waitForTimeout(1000);
        await nursePage.locator('input').first().fill('1000'); 
        await nursePage.getByRole('button', { name: /Send|Submit/i }).first().click();
      }
      await nursePage.waitForTimeout(2000);
    });

    // 3. PATIENT: Select Offer & Approve Contract
    await test.step('Patient Select Offer & Contract', async () => {
      await patientPage.getByText(/Marketplace/i).first().click();
      await patientPage.waitForTimeout(2000);
      
      const reviewBtn = patientPage.getByRole('button', { name: /Review Offers/i }).first();
      if (await reviewBtn.isVisible()) {
        await reviewBtn.click();
      }
      await patientPage.waitForTimeout(2000);
      
      const selectBtn = patientPage.getByRole('button', { name: /Select Offer/i }).first();
      if (await selectBtn.isVisible()) {
        await selectBtn.click();
      }
      await patientPage.waitForTimeout(3000);
      
      // Navigate to Patient Contracts
      await patientPage.getByText(/Marketplace/i).first().click(); 
      await patientPage.waitForTimeout(2000);
      await patientPage.getByRole('button', { name: /Contracts/i }).first().click();
      await patientPage.waitForTimeout(2000);
      
      await patientPage.locator('text=PENDING').first().click({ force: true });
      await patientPage.waitForTimeout(2000);
      
      const ptApproveBtn = patientPage.getByRole('button', { name: /Approve Contract/i }).first();
      if (await ptApproveBtn.isVisible()) {
        await ptApproveBtn.click();
      }
      await patientPage.waitForTimeout(2000);
    });

    // 4. NURSE: Approve Contract
    await test.step('Nurse Approve Contract', async () => {
      await nursePage.getByText(/Marketplace/i).first().click();
      await nursePage.waitForTimeout(1000);
      await nursePage.getByRole('button', { name: /Contracts/i }).first().click();
      await nursePage.waitForTimeout(2000);
      
      await nursePage.locator('text=PENDING').first().click({ force: true });
      await nursePage.waitForTimeout(2000);
      
      const nurseApproveBtn = nursePage.getByRole('button', { name: /Approve Contract/i }).first();
      if (await nurseApproveBtn.isVisible()) {
        await nurseApproveBtn.click();
      }
      await nursePage.waitForTimeout(3000);
    });

    // 5. NURSE: LOW Risk Visit
    await test.step('Nurse Visit & LOW Risk', async () => {
      await nursePage.getByText(/Visits/i).first().click();
      await nursePage.waitForTimeout(3000); // Give backend time to generate the visit
      
      // Look for the Scheduled/Patient 1 visit card
      await nursePage.locator('text=Scheduled').first().click({ force: true });
      await nursePage.waitForTimeout(2000);
      
      const startBtn = nursePage.getByText(/Start Visit/i).first();
      if (await startBtn.isVisible()) {
        await startBtn.click();
      }
      await nursePage.waitForTimeout(2000);
      
      const vitalsBtn = nursePage.getByText(/Record Vitals/i).first();
      if (await vitalsBtn.isVisible()) {
        await vitalsBtn.click();
        await nursePage.waitForTimeout(1000);
        await nursePage.getByPlaceholder(/120/i).fill('120'); 
        await nursePage.getByPlaceholder(/80/i).fill('80');   
        await nursePage.getByPlaceholder(/72/i).fill('72');   
        await nursePage.getByPlaceholder(/36.6/i).fill('36.6'); 
        await nursePage.getByPlaceholder(/98/i).fill('99');   
        await nursePage.getByText(/Submit Vitals/i).first().click();
        await nursePage.waitForTimeout(2000);
      }
      
      const riskBtn = nursePage.getByText(/AI Risk Assessment/i).first();
      if (await riskBtn.isVisible()) {
        await riskBtn.click();
        await nursePage.waitForTimeout(1000);
        await nursePage.getByText(/Perform Assessment/i).first().click();
        await nursePage.waitForTimeout(4000); 
        await expect(nursePage.getByText(/LOW/i).first()).toBeVisible({ timeout: 10000 });
      }
    });

  });
});
