import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Client} from 'colyseus.js';
const require=createRequire('C:/Users/higgi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const {chromium}=require('playwright');
const origin='http://127.0.0.1:2789',checks=[],errors=[],warnings=[];
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const check=(value,message)=>{assert.ok(value,message);checks.push(message);console.log('PASS '+message);};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const watch=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='warning'&&/WebGL|THREE/i.test(m.text()))warnings.push(m.text());});};
const until=async fn=>{for(let i=0;i<160;i++){if(fn())return;await pause(50);}throw Error('sync timeout');};
const hc=await browser.newContext({viewport:{width:1365,height:900}}),gc=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const h=await hc.newPage(),g=await gc.newPage();watch(h);watch(g);
let sdk=[];
try{
 for(const count of (process.env.M27_SCREENSHOTS?[2]:[2,4,6,8])){
  await h.goto(origin);await h.locator('#chooseBeam').click();await h.locator('#create').click();await h.locator('#roomCode').waitFor();
  const code=(await h.locator('#roomCode').innerText()).match(/[A-Z2-9]{5}$/)[0];
  await g.goto(origin+'/?room='+code);await g.locator('#join').click();await g.locator('#roomCode').waitFor();
  const id=(await (await fetch(origin+'/api/rooms/'+code)).json()).roomId,client=new Client(origin.replace('http','ws'));
  for(let i=2;i<count;i++)sdk.push(await client.joinById(id,{name:'M27 worker '+i}));
  await h.waitForFunction(n=>document.querySelectorAll('#players li').length===n,count);
  for(let map=0;map<5;map++){
   await h.locator('#beamMap').selectOption(String(map));await g.waitForFunction(m=>document.querySelector('#beamMap').value===String(m),map);
   check(await g.locator('#beamMap').isDisabled(),count+' workers course '+map+': host selection sync and guest locked');
   await h.locator('#start').click();await h.waitForFunction(()=>document.querySelector('#grab').disabled===false);await g.waitForFunction(()=>document.querySelector('#action').disabled===false);
   await h.locator('#grab').click();await g.locator('#action').click();
   await h.waitForFunction(()=>document.querySelector('#beamStatus').textContent.includes('Both ends carried'));
   check(true,count+' workers course '+map+': two browser workers carry shared beam');
   sdk.forEach(r=>r.send('action'));
   if(sdk.length){await until(()=>sdk.every(r=>r.state.teams.length===count/2));check(true,count+' workers course '+map+': simultaneous teams synchronized');}
   await h.keyboard.down('w');await g.keyboard.down('w');await pause(300);await h.keyboard.up('w');await g.keyboard.up('w');
   await h.locator('#grab').click();await g.locator('#action').click();await h.waitForFunction(()=>document.querySelector('#beamStatus').textContent.includes('Both ends grounded'));
   check(true,count+' workers course '+map+': both workers release');
   if(count===2){
    await h.locator('#beamOverview').click();await pause(1200);await h.screenshot({path:'qa/m27/course-'+map+'-desktop.png'});
    for(const [name,width,height]of [['portrait',390,844],['landscape',844,390],['319px',319,700]]){
     await g.setViewportSize({width,height});await pause(300);check(await g.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),map+' '+name+': no horizontal overflow');
     check(await g.locator('#action').isVisible(),map+' '+name+': phone action visible');
     await g.screenshot({path:'qa/m27/course-'+map+'-'+name+'.png'});
    }
    await g.setViewportSize({width:390,height:844});await h.locator('#beamOverview').click();
   }
   await h.locator('#menu').click();await h.locator('#restart').click();await h.waitForFunction(()=>document.querySelector('#grab').disabled===false);check(true,count+' workers course '+map+': rematch reaches racing');
   if(!(await h.locator('#back').isVisible()))await h.locator('#menu').click();await h.locator('#back').click();await h.locator('#beamMap').waitFor();
  }
  // Random is selected in the same lobby; selected course is authoritative at GO.
  await h.locator('#beamMap').selectOption('-1');await g.waitForFunction(()=>document.querySelector('#beamMap').value==='-1');
  if(sdk.length){await until(()=>sdk[0].state.beamRandom);let previous=sdk[0].state.beamMap;await h.locator('#start').click();await until(()=>sdk[0].state.racePhase==='racing');check(sdk[0].state.beamMap!==previous,count+' workers: Random avoids previous course');await h.locator('#menu').click();await h.locator('#back').click();}
  check(true,count+' workers: Random lobby synchronization');
  if(count===8){await h.locator('#leave').click();await g.waitForFunction(()=>!document.querySelector('#start').disabled);check(true,'host transfers to mobile browser');}
  else await h.locator('#leave').click();
  await g.locator('#leave').click();await Promise.all(sdk.map(r=>r.leave()));sdk=[];
 }
 check(errors.length===0,'zero browser page errors');
 fs.writeFileSync(process.env.M27_SCREENSHOTS?'qa/m27/screenshot-checks.json':'qa/m27/browser-results.json',JSON.stringify({origin,checks,errors,warnings,physicalIphone:false},null,2));
}finally{await Promise.allSettled(sdk.map(r=>r.leave()));await browser.close();}
