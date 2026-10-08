const fs=require('fs'),path=require('path');
const {launch,newSession,sleep,BASE}=require('./lib');
const OUT=path.resolve(__dirname,'../inventory/form_fields.json');
const targets=[
  [null,'/auth/login'],[null,'/auth/register'],[null,'/auth/forgot'],[null,'/auth/reset'],
  ['patient1@gmail.com','/(patient)/requests/new'],
  ['patient1@gmail.com','/(patient)/profile/edit'],
  ['patient1@gmail.com','/(patient)/profile/emergency-contacts'],
  ['nurse1@gmail.com','/(nurse)/profile/availability'],
  ['admin1@gmail.com','/admin/config'],
];
(async()=>{
  const browser=await launch(),result={};
  for(const [email,route] of targets){
    const context=await browser.createBrowserContext();
    const page=await context.newPage();await page.setViewport({width:900,height:900});
    if(email){
      await page.goto(BASE+'/auth/login',{waitUntil:'networkidle2'});
      const inputs=await page.$$('input');await inputs[0].type(email);await inputs[1].type('abc123$%');
      const {clickText}=require('./lib');await clickText(page,'Sign In');await sleep(2000);
    }
    await page.goto(BASE+route,{waitUntil:'domcontentloaded'});await sleep(800);
    result[route]=await page.evaluate(()=>[...document.querySelectorAll('input,textarea,select')].map((el,i)=>{
      const rect=el.getBoundingClientRect();if(rect.width<1||rect.height<1)return null;
      const label=el.closest('label')?.innerText||document.querySelector(`label[for="${el.id}"]`)?.innerText||'';
      const near=el.parentElement?.parentElement?.innerText||'';
      return {index:i,label:label.trim().slice(0,90),near:near.trim().replace(/\s+/g,' ').slice(0,125),placeholder:el.getAttribute('placeholder')||'',type:el.getAttribute('type')||el.tagName.toLowerCase(),required:el.hasAttribute('required')||el.getAttribute('aria-required')==='true'};
    }).filter(Boolean));
    console.log(route,result[route].length);
    await context.close();
  }
  await browser.close();fs.writeFileSync(OUT,JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
