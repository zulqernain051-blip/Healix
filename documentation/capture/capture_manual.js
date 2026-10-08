// Captures only rendered Healix UI from the running Expo web preview and web app.
// Each result is verified against the requested route; failed/redirected routes
// are recorded without an image.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { clickText } = require('./lib');

const root = path.resolve(__dirname, '..');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'inventory/screens_v2.json'), 'utf8'));
const out = path.join(root, 'screenshots', 'manual');
fs.mkdirSync(out, { recursive: true });
const records = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const slug = v => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function login(page, email, base) {
  await page.goto(base + (base.includes('8081') ? '/auth/login' : '/login'), { waitUntil: 'networkidle2', timeout: 120000 });
  const inputs = await page.$$('input');
  await inputs[0].type(email);
  await inputs[1].type('abc123$%'); // existing seeded development account password
  if (base.includes('8081')) {
    await clickText(page, 'Sign In');
  } else {
    await page.click('button[type=submit]');
  }
  await wait(4500);
  return page.url();
}

function expectedPath(route) {
  return route.replace(/\/\([^/]+\)/g, '').replace(/\/index$/, '') || '/';
}

async function captureMobile(browser) {
  const byModule = {
    Common: 'paramedic1@gmail.com',
    Authentication: null,
    Patient: 'patient1@gmail.com',
    Nurse: 'nurse1@gmail.com',
    Doctor: 'doctor1@gmail.com',
    Administrator: 'admin1@gmail.com',
  };
  for (const [module, email] of Object.entries(byModule)) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: 900, height: 900, deviceScaleFactor: 1 });
    const jsErrors = [];
    page.on('pageerror', e => jsErrors.push(e.message.slice(0, 160)));
    if (email) {
      try {
        const url = await login(page, email, 'http://localhost:8081');
        console.log('MOBILE LOGIN', module, url);
      } catch (e) { console.log('LOGIN FAILED', module, e.message); }
    }
    for (const screen of inventory.filter(x => x.module === module && x.route !== '/')) {
      const record = { ...screen, capturePlatform: 'Expo web preview', screenshot: null, captureStatus: '', renderedUrl: '', visibleText: '' };
      if (screen.route.includes('[id]')) {
        record.captureStatus = 'No existing related record for dynamic route';
        records.push(record); continue;
      }
      try {
        jsErrors.length = 0;
        await page.goto('http://localhost:8081' + screen.route, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await wait(1250);
        record.renderedUrl = page.url();
        record.visibleText = (await page.evaluate(() => document.body.innerText)).trim().slice(0, 1000);
        const actual = new URL(record.renderedUrl).pathname;
        const expected = expectedPath(screen.route);
        if (actual !== expected) record.captureStatus = `Redirected to ${actual}`;
        else if (record.visibleText.length < 25) record.captureStatus = 'Rendered screen has insufficient visible content';
        else if (jsErrors.length) record.captureStatus = `Page error: ${jsErrors[0]}`;
        else {
          const dir = path.join(out, slug(module)); fs.mkdirSync(dir, { recursive: true });
          const filename = `${screen.number}-${slug(screen.title)}.png`;
          const file = path.join(dir, filename);
          await page.screenshot({ path: file });
          record.screenshot = path.relative(root, file).replace(/\\/g, '/');
          record.captureStatus = 'Captured from live Healix Expo web preview';
        }
      } catch (e) { record.captureStatus = `Capture failed: ${e.message.slice(0, 120)}`; }
      records.push(record);
      console.log('MOBILE', screen.number, screen.route, record.captureStatus);
    }
    await context.close();
  }
}

async function captureWeb(browser) {
  const specs = [
    { role: 'Administrator', email: 'admin1@gmail.com', route: '/admin', names: ['Dashboard','User Directory','Nurse Verification','Doctor Verification','Marketplace Monitor','Platform Config','Audit Logs'] },
    { role: 'Doctor', email: 'doctor1@gmail.com', route: '/doctor', names: ['Case Queue','Home Visits'] },
  ];
  const loginContext = await browser.createBrowserContext();
  const loginPage = await loginContext.newPage();
  await loginPage.setViewport({ width: 1200, height: 900, deviceScaleFactor: 1 });
  await loginPage.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle2' });
  const loginFile = path.join(out, 'web', '7.1-web-login.png');
  fs.mkdirSync(path.dirname(loginFile), { recursive: true });
  await loginPage.screenshot({ path: loginFile });
  records.push({ number:'7.1', id:'WEB-LOGIN', title:'Web Login', module:'Web Authentication', role:'Doctor / Administrator', platform:'Web', route:'/login', parent:null, entryAction:'Open the Healix Operations URL', children:['8.1','9.1'], sourceFile:'web/src/pages/Login.tsx', screenshot:path.relative(root,loginFile).replace(/\\/g,'/'), captureStatus:'Captured from live Healix web app', visibleText:(await loginPage.evaluate(() => document.body.innerText)).slice(0,1000) });
  await loginContext.close();
  for (const spec of specs) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 1 });
    const url = await login(page, spec.email, 'http://127.0.0.1:5173');
    console.log('WEB LOGIN', spec.role, url);
    if (new URL(url).pathname !== spec.route) {
      throw new Error(`Web ${spec.role} login did not reach ${spec.route}: ${url}`);
    }
    for (let i=0;i<spec.names.length;i++) {
      const name = spec.names[i];
      if (i) {
        const clicked = await page.evaluate(label => {
          const button=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()===label);
          if (button) { button.click(); return true; }
          return false;
        }, name);
        if (!clicked) { console.log('WEB MISSING CONTROL',name); continue; }
        await wait(1700);
      }
      const num = `${spec.role==='Administrator'?8:9}.${i+1}`;
      const file = path.join(out, 'web', `${num}-${slug(name)}.png`);
      await page.screenshot({ path:file });
      records.push({ number:num, id:`WEB-${slug(spec.role).toUpperCase()}-${slug(name).toUpperCase()}`, title:name, module:`Web ${spec.role}`, role:spec.role, platform:'Web', route:spec.route+` [${name} tab]`, parent:i?`${spec.role==='Administrator'?8:9}.1`:'7.1', entryAction:i?`Click ${name} in sidebar`:'Sign in with existing development account', children:[], sourceFile:`web/src/App.tsx`, screenshot:path.relative(root,file).replace(/\\/g,'/'), captureStatus:'Captured from live Healix web app', visibleText:(await page.evaluate(()=>document.body.innerText)).slice(0,1000) });
      console.log('WEB',num,name);
    }
    await context.close();
  }
}

(async()=>{
  const browser=await puppeteer.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:'new', args:['--no-sandbox'] });
  if (process.argv.includes('--web-only')) {
    const old=path.join(root,'inventory','manual_capture_results.json');
    if (fs.existsSync(old)) records.push(...JSON.parse(fs.readFileSync(old,'utf8')).filter(x=>x.platform==='Mobile'));
  }
  try { if (!process.argv.includes('--web-only')) await captureMobile(browser); await captureWeb(browser); }
  finally { await browser.close(); }
  fs.writeFileSync(path.join(root,'inventory','manual_capture_results.json'),JSON.stringify(records,null,2));
  console.log('TOTAL',records.length,'CAPTURED',records.filter(x=>x.screenshot).length);
})().catch(e=>{console.error(e);process.exit(1)});
