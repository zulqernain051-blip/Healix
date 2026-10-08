// lib.js - shared helpers for capturing REAL screenshots of the running Healix app (Expo web).
const puppeteer = require('puppeteer-core');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:8081';
const PASSWORD = 'abc123$%';           // existing project dev/test accounts (backend/scripts/database/seed*.ts)
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function launch() {
  return puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
}

// Fresh isolated session per role (no shared storage), logs in through the REAL login screen.
async function newSession(browser, email, viewport = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(viewport);
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e.message).slice(0, 200)));
  await page.goto(BASE + '/auth/login', { waitUntil: 'networkidle2', timeout: 240000 });
  await page.waitForSelector('input', { timeout: 60000 });
  const inputs = await page.$$('input');
  await inputs[0].type(email, { delay: 10 });
  await inputs[1].type(PASSWORD, { delay: 10 });
  await clickText(page, 'Sign In');
  await sleep(5000);
  return { ctx, page };
}

// Click the element whose visible text matches (exact first, then contains).
async function clickText(page, text, opts = {}) {
  const pt = await page.evaluate((t, nth) => {
    const nodes = Array.from(document.querySelectorAll('div,span,a,button,[role=button]'));
    const vis = n => { const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight; };
    const txt = n => (n.innerText || '').trim();
    let c = nodes.filter(n => vis(n) && txt(n) === t);
    if (!c.length) c = nodes.filter(n => vis(n) && txt(n).includes(t) && txt(n).length < t.length + 40);
    if (!c.length) return null;
    c.sort((a, b) => txt(a).length - txt(b).length);
    const r = c[Math.min(nth || 0, c.length - 1)].getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, text, opts.nth || 0);
  if (!pt) return false;
  await page.mouse.click(pt.x, pt.y);
  return true;
}

const bodyText = page => page.evaluate(() => document.body.innerText);

module.exports = { launch, newSession, clickText, bodyText, sleep, BASE, PASSWORD };
