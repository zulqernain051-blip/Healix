# Browser QA

From the project root:

```sh
npm --prefix qa-tests ci
npm --prefix qa-tests run test:list
npm --prefix qa-tests test
```

Install Chromium once from this directory with `npx playwright install chromium` if it is not already installed. Start the backend and frontend required by the selected spec and prepare the expected development accounts. Specs contain their own target URLs and account assumptions; review the selected suite before running it against a database.

`playwright.config.ts` preserves the existing visible-browser configuration. Use `npm --prefix qa-tests test -- e2e/01-normal-workflow.spec.ts` to select a suite.

`reports/` contains curated project reports; generated `test-results/`, `playwright-report/`, and `blob-report/` are ignored. Prior generated results were moved to `../archive/test-results/`.

`npm --prefix qa-tests run reports:generate` regenerates patient navigation reports from mobile source. Review the resulting report changes before committing them. `test:report` opens an HTML report when one has been generated, for example by passing `--reporter=html` to the test command.
