import {createRequire} from 'node:module';import fs from 'node:fs';import assert from 'node:assert/strict';import {Client} from 'colyseus.js';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE??import.meta.url),{chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:'msedge',args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const origin='http://127.0.0.1:2723',checks=[],errors=[],warnings=[],rooms=[];const check=(v,m)=>{assert.ok(v,m);checks.push(m);console.log('PASS '+m);};
const pumpkin={hat:0xf78b24,vest:0x76be45,expression:'goofy'};
const telemetry=()=>{window.qaGL=[];const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){const gl=original.apply(this,args);if(gl&&/webgl/.test(args[0])&&!window.qaGL.some(x=>x.gl===gl)){const entry={gl,canvas:this,lost:false};window.qaGL.push(entry);this.addEventListener('webglcontextlost',()=>entry.lost=true);}return gl;};};
const watch=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='warning'&&/THREE|WebGL|context/i.test(m.text()))warnings.push(m.text());});};
try{
 const hc=await browser.newContext({viewport:{width:1365,height:900}}),gc=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 for(const c of [hc,gc]){await c.addInitScript(look=>localStorage.setItem('break-time-worker',JSON.stringify(look)),pumpkin);await c.addInitScript(telemetry);}
 const h=await hc.newPage(),g=await gc.newPage();watch(h);watch(g);await h.goto(origin+'/party.html');await h.waitForFunction(()=>!document.querySelector('#create').disabled);await h.locator('#name').fill('Party Foreman');await h.locator('#create').click();await h.locator('#partyShell').waitFor();const code=(await h.locator('#partyShell>p').first().innerText()).split(' · ')[1];
 await g.goto(origin+'/party.html?room='+code);await g.waitForFunction(()=>!document.querySelector('#join').disabled);await g.locator('#name').fill('Party Phone');await g.locator('#join').click();await g.locator('#partyShell').waitFor();
 const client=new Client(origin.replace('http','ws')),id=(await (await fetch(origin+'/api/party/'+code)).json()).roomId;let lastView;
 for(let i=2;i<8;i++){const r=await client.joinById(id,{name:'SDK Worker '+i,cosmetics:pumpkin});r.onMessage('partyView',v=>lastView=v);r.send('partySync');rooms.push(r);}
 await h.waitForFunction(()=>document.querySelectorAll('#partyShell>ul li').length===8);check(true,'eight-player Party lobby: two real browser clients plus six SDK clients');
 const memory=[];
 for(let cycle=0;cycle<3;cycle++){
  await h.getByRole('button',{name:'Start Party Night',exact:true}).click();
  for(const mode of ['Wheelbarrow Championship','Beam Carry','TOOLBOX TRIVIA']){await h.waitForFunction(m=>document.querySelector('#partyShell')?.innerText.includes(m),mode,{timeout:40000});check(true,'cycle '+(cycle+1)+' shows '+mode);}
  await h.waitForFunction(()=>document.querySelector('#partyShell>h1')?.textContent==='EMPLOYEE OF THE MONTH',null,{timeout:40000});await g.waitForFunction(()=>document.querySelector('#partyShell>h1')?.textContent==='EMPLOYEE OF THE MONTH');
  check(await h.locator('#partyShell .awards-roster li').count()===8,'cycle '+(cycle+1)+' final podium includes all eight workers');
  check(await g.locator('#partyShell .awards-stage canvas').isVisible(),'cycle '+(cycle+1)+' mobile Party podium visible');
  check(lastView.podium.ranking.every(p=>p.look.hat===pumpkin.hat),'cycle '+(cycle+1)+' all eight Pumpkin Hats reach final podium');
  const sample=await h.evaluate(()=>({contexts:window.qaGL.length,live:window.qaGL.filter(e=>!e.lost).length,connected:window.qaGL.filter(e=>e.canvas.isConnected).length,heap:performance.memory?.usedJSHeapSize}));memory.push(sample);check(sample.live<=2,'cycle '+(cycle+1)+' at most game renderer plus podium context');
  if(cycle===0){await h.screenshot({path:'qa/m22/party-podium-desktop.png'});await g.screenshot({path:'qa/m22/party-podium-iphone.png'});await g.setViewportSize({width:844,height:390});await g.screenshot({path:'qa/m22/party-podium-landscape.png'});check(await g.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Party mobile landscape has no page overflow');await g.setViewportSize({width:390,height:844});}
  await h.getByRole('button',{name:'Play another Party Night',exact:true}).click();await h.getByRole('button',{name:'Start Party Night',exact:true}).waitFor();check(await h.locator('.awards-stage canvas').count()===0,'cycle '+(cycle+1)+' replay removes podium canvas');check((await h.locator('#partyShell>p').first().innerText()).includes(code),'cycle '+(cycle+1)+' replay preserves room code');
 }
 await h.close();await g.getByRole('button',{name:'Start Party Night',exact:true}).waitFor();check(true,'Party host transfers to mobile browser after host exits');
 check(errors.length===0,'zero Party browser page errors');check(!warnings.some(w=>/Too many active WebGL|Multiple instances of Three/i.test(w)),'no duplicate Three.js or exhausted contexts over three complete playlists');
 fs.writeFileSync('qa/m22/party-browser.json',JSON.stringify({fixture:'Existing PartyRoom fixture; eight-second mode deadlines, no score injection; zero-score timed-out modes',checks:checks.length,passed:checks,errors,warnings,memory},null,2));
}finally{await Promise.allSettled(rooms.map(r=>r.leave()));await browser.close();}
