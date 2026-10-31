import {createRequire} from 'node:module';import fs from 'node:fs';import {Client} from 'colyseus.js';
const require=createRequire('C:/Users/higgi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
await context.addInitScript(()=>{window.qaFrames=[];window.qaDraws=[];let calls=0,last=performance.now();const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(...args){const gl=original.apply(this,args);if(gl&&/webgl/.test(args[0])&&!gl.qaWrapped){gl.qaWrapped=true;for(const name of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced'])if(gl[name]){const draw=gl[name].bind(gl);gl[name]=(...a)=>{calls++;return draw(...a);};}}return gl;};function frame(now){window.qaFrames.push(now-last);window.qaDraws.push(calls);last=now;calls=0;requestAnimationFrame(frame);}requestAnimationFrame(frame);});
const page=await context.newPage(),origin='http://127.0.0.1:2732',samples=[];let guest;
try{
 await page.goto(origin);await page.locator('#chooseBeam').click();await page.locator('#create').click();await page.locator('#roomCode').waitFor();const code=(await page.locator('#roomCode').innerText()).match(/[A-Z2-9]{5}$/)[0],id=(await(await fetch(origin+'/api/rooms/'+code)).json()).roomId;guest=await new Client(origin.replace('http','ws')).joinById(id);
 for(const map of [0,3,4]){
  await page.locator('#beamMap').selectOption(String(map));await page.locator('#start').click();await page.waitForFunction(()=>!document.querySelector('#grab').disabled);
  await page.locator('#menu').click();await page.locator('#beamOverview').click();await page.locator('#menu').click();await page.waitForTimeout(1200);
  await page.evaluate(()=>{window.qaFrames=[];window.qaDraws=[];});await page.waitForTimeout(2500);
  samples.push(await page.evaluate(map=>{const sorted=window.qaFrames.slice().sort((a,b)=>a-b),draws=window.qaDraws.filter(n=>n>0).sort((a,b)=>a-b);return {map,viewport:[innerWidth,innerHeight],medianFrameMs:sorted[Math.floor(sorted.length/2)],p95FrameMs:sorted[Math.floor(sorted.length*.95)],medianDrawCalls:draws[Math.floor(draws.length/2)],heapBytes:performance.memory?.usedJSHeapSize};},map));
  await page.locator('#menu').click();await page.locator('#beamOverview').click();await page.locator('#menu').click();await page.locator('#menu').click();await page.locator('#back').click();
 }
 fs.writeFileSync('qa/m32/performance.json',JSON.stringify({environment:'Headless desktop Edge with emulated 390x844 touch viewport, DPR 2; not physical phone performance',samples},null,2));console.log(JSON.stringify(samples));
}finally{if(guest)await guest.leave();await browser.close();}
