# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\01-normal-workflow.spec.ts >> E2E: Normal Clinical Workflow >> Scenario: ONE_TIME + LOW Risk Workflow
- Location: e2e\01-normal-workflow.spec.ts:5:7

# Error details

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('text=ACCEPTING OFFERS').first()

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('E2E: Normal Clinical Workflow', () => {
  4   |   
  5   |   test('Scenario: ONE_TIME + LOW Risk Workflow', async ({ browser }) => {
  6   |     test.setTimeout(8 * 60 * 1000); // 8 minutes
  7   | 
  8   |     const patientContext = await browser.newContext();
  9   |     const nurseContext = await browser.newContext();
  10  |     const patientPage = await patientContext.newPage();
  11  |     const nursePage = await nurseContext.newPage();
  12  |     const baseURL = 'http://localhost:8081';
  13  | 
  14  |     patientPage.on('dialog', dialog => dialog.accept());
  15  |     nursePage.on('dialog', dialog => dialog.accept());
  16  | 
  17  |     // 1. PATIENT: Login & Request
  18  |     await test.step('Patient Login & Request', async () => {
  19  |       await patientPage.goto(baseURL);
  20  |       await patientPage.waitForTimeout(2000);
  21  |       if (await patientPage.getByText('Patient', { exact: true }).isVisible()) {
  22  |         await patientPage.getByText('Patient', { exact: true }).click();
  23  |       }
  24  |       await patientPage.locator('input').nth(0).fill('patient1@gmail.com');
  25  |       await patientPage.locator('input').nth(1).fill('abc123$%');
  26  |       await patientPage.getByRole('button', { name: /Sign In/i }).click();
  27  |       await expect(patientPage.getByText(/Dashboard|Patient Portal/i).first()).toBeVisible({ timeout: 15000 });
  28  | 
  29  |       await patientPage.getByText(/Request Healthcare/i).click();
  30  |       await patientPage.waitForTimeout(1000);
  31  |       await patientPage.getByPlaceholder(/Describe your medical needs/i).fill('Routine general assessment');
  32  |       await patientPage.getByText('Flexible', { exact: true }).click();
  33  |       await patientPage.getByRole('button', { name: /Submit Request/i }).click();
  34  |       await patientPage.waitForTimeout(3000);
  35  |     });
  36  | 
  37  |     // 2. NURSE: Marketplace Offer
  38  |     await test.step('Nurse Offer', async () => {
  39  |       await nursePage.goto(baseURL);
  40  |       await nursePage.waitForTimeout(2000);
  41  |       if (await nursePage.getByText('Nurse', { exact: true }).isVisible()) {
  42  |         await nursePage.getByText('Nurse', { exact: true }).click();
  43  |       }
  44  |       await nursePage.locator('input').nth(0).fill('nurse1@gmail.com');
  45  |       await nursePage.locator('input').nth(1).fill('abc123$%');
  46  |       await nursePage.getByRole('button', { name: /Sign In/i }).click();
  47  |       await expect(nursePage.getByText(/Marketplace|Nurse/i).first()).toBeVisible({ timeout: 15000 });
  48  | 
  49  |       await nursePage.getByText(/Marketplace/i).first().click();
  50  |       await nursePage.waitForTimeout(2000);
> 51  |       await nursePage.locator('text=ACCEPTING OFFERS').first().click({ force: true });
      |                                                                ^ Error: locator.click: Target page, context or browser has been closed
  52  |       await nursePage.waitForTimeout(2000);
  53  |       
  54  |       const submitOfferButton = nursePage.getByRole('button', { name: /Submit Offer|Make Offer/i }).first();
  55  |       if (await submitOfferButton.isVisible()) {
  56  |         await submitOfferButton.click();
  57  |         await nursePage.waitForTimeout(1000);
  58  |         await nursePage.locator('input').first().fill('1000'); 
  59  |         await nursePage.getByRole('button', { name: /Send|Submit/i }).first().click();
  60  |       }
  61  |       await nursePage.waitForTimeout(2000);
  62  |     });
  63  | 
  64  |     // 3. PATIENT: Select Offer & Approve Contract
  65  |     await test.step('Patient Select Offer & Contract', async () => {
  66  |       await patientPage.getByText(/Marketplace/i).first().click();
  67  |       await patientPage.waitForTimeout(2000);
  68  |       
  69  |       const reviewBtn = patientPage.getByRole('button', { name: /Review Offers/i }).first();
  70  |       if (await reviewBtn.isVisible()) {
  71  |         await reviewBtn.click();
  72  |       }
  73  |       await patientPage.waitForTimeout(2000);
  74  |       
  75  |       const selectBtn = patientPage.getByRole('button', { name: /Select Offer/i }).first();
  76  |       if (await selectBtn.isVisible()) {
  77  |         await selectBtn.click();
  78  |       }
  79  |       await patientPage.waitForTimeout(3000);
  80  |       
  81  |       // Navigate to Patient Contracts
  82  |       await patientPage.getByText(/Marketplace/i).first().click(); 
  83  |       await patientPage.waitForTimeout(2000);
  84  |       await patientPage.getByRole('button', { name: /Contracts/i }).first().click();
  85  |       await patientPage.waitForTimeout(2000);
  86  |       
  87  |       await patientPage.locator('text=PENDING').first().click({ force: true });
  88  |       await patientPage.waitForTimeout(2000);
  89  |       
  90  |       const ptApproveBtn = patientPage.getByRole('button', { name: /Approve Contract/i }).first();
  91  |       if (await ptApproveBtn.isVisible()) {
  92  |         await ptApproveBtn.click();
  93  |       }
  94  |       await patientPage.waitForTimeout(2000);
  95  |     });
  96  | 
  97  |     // 4. NURSE: Approve Contract
  98  |     await test.step('Nurse Approve Contract', async () => {
  99  |       await nursePage.getByText(/Marketplace/i).first().click();
  100 |       await nursePage.waitForTimeout(1000);
  101 |       await nursePage.getByRole('button', { name: /Contracts/i }).first().click();
  102 |       await nursePage.waitForTimeout(2000);
  103 |       
  104 |       await nursePage.locator('text=PENDING').first().click({ force: true });
  105 |       await nursePage.waitForTimeout(2000);
  106 |       
  107 |       const nurseApproveBtn = nursePage.getByRole('button', { name: /Approve Contract/i }).first();
  108 |       if (await nurseApproveBtn.isVisible()) {
  109 |         await nurseApproveBtn.click();
  110 |       }
  111 |       await nursePage.waitForTimeout(3000);
  112 |     });
  113 | 
  114 |     // 5. NURSE: LOW Risk Visit
  115 |     await test.step('Nurse Visit & LOW Risk', async () => {
  116 |       await nursePage.getByText(/Visits/i).first().click();
  117 |       await nursePage.waitForTimeout(3000); // Give backend time to generate the visit
  118 |       
  119 |       // Look for the Scheduled/Patient 1 visit card
  120 |       await nursePage.locator('text=Scheduled').first().click({ force: true });
  121 |       await nursePage.waitForTimeout(2000);
  122 |       
  123 |       const startBtn = nursePage.getByText(/Start Visit/i).first();
  124 |       if (await startBtn.isVisible()) {
  125 |         await startBtn.click();
  126 |       }
  127 |       await nursePage.waitForTimeout(2000);
  128 |       
  129 |       const vitalsBtn = nursePage.getByText(/Record Vitals/i).first();
  130 |       if (await vitalsBtn.isVisible()) {
  131 |         await vitalsBtn.click();
  132 |         await nursePage.waitForTimeout(1000);
  133 |         await nursePage.getByPlaceholder(/120/i).fill('120'); 
  134 |         await nursePage.getByPlaceholder(/80/i).fill('80');   
  135 |         await nursePage.getByPlaceholder(/72/i).fill('72');   
  136 |         await nursePage.getByPlaceholder(/36.6/i).fill('36.6'); 
  137 |         await nursePage.getByPlaceholder(/98/i).fill('99');   
  138 |         await nursePage.getByText(/Submit Vitals/i).first().click();
  139 |         await nursePage.waitForTimeout(2000);
  140 |       }
  141 |       
  142 |       const riskBtn = nursePage.getByText(/AI Risk Assessment/i).first();
  143 |       if (await riskBtn.isVisible()) {
  144 |         await riskBtn.click();
  145 |         await nursePage.waitForTimeout(1000);
  146 |         await nursePage.getByText(/Perform Assessment/i).first().click();
  147 |         await nursePage.waitForTimeout(4000); 
  148 |         await expect(nursePage.getByText(/LOW/i).first()).toBeVisible({ timeout: 10000 });
  149 |       }
  150 |     });
  151 | 
```