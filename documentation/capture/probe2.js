const { launch, newSession, bodyText, sleep, BASE } = require('./lib');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '..', 'screenshots', '_probe'); fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await launch();
  for (const [role, email, urls] of [
    ['nurse', 'nurse1@gmail.com', ['/(nurse)/(tabs)/visits', '/(nurse)/marketplace/contracts', '/(nurse)/sync']],
    ['patient', 'patient1@gmail.com', ['/(patient)/(tabs)/requests', '/(patient)/requests/new', '/(patient)/health']],
  ]) {
    const { page } = await newSession(browser, email);
    console.log(`[${role}] after login URL:`, page.url());
    console.log(`[${role}] home text:`, (await bodyText(page)).slice(0, 160).replace(/\n/g, ' | '));
    await page.screenshot({ path: path.join(OUT, `${role}-home.png`) });
    for (const u of urls) {
      await page.goto(BASE + u, { waitUntil: 'networkidle2', timeout: 120000 }); await sleep(3000);
      console.log(`[${role}] goto ${u} -> ${page.url()} :: ${(await bodyText(page)).slice(0, 110).replace(/\n/g, ' | ')}`);
      await page.screenshot({ path: path.join(OUT, `${role}-${u.replace(/[^a-z]+/gi, '_')}.png`) });
    }
    console.log(`[${role}] page errors:`, page.errors.slice(0, 3));
  }
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
