const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:8081';
const OUT = path.resolve(__dirname, '..', 'screenshots', '_probe');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('pageerror', e => console.log('PAGEERROR', e.message.slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE.ERR', m.text().slice(0, 200)); });
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 240000 });
  await new Promise(r => setTimeout(r, 4000));
  console.log('URL', page.url());
  await page.screenshot({ path: path.join(OUT, 'first.png') });
  console.log('TEXT', (await page.evaluate(() => document.body.innerText)).slice(0, 400).replace(/\n/g, ' | '));
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
