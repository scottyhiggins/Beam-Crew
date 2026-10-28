import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderRatio,ResolutionGovernor} from '../client/render-resolution.js';
test('phone sharpness rises from 1.5x to 2x within a bounded pixel budget',()=>{
 assert.equal(renderRatio(390,844,3,true),2);assert.equal(renderRatio(844,390,3,true),2);
 for(const mobile of [true,false])for(const [w,h,dpr]of [[390,844,3],[1920,1080,2],[3840,2160,3],[1366,768,1.25]]){
  const ratio=renderRatio(w,h,dpr,mobile);assert.ok(w*h*ratio*ratio<=(mobile?2_000_000:5_000_000)+1);assert.ok(ratio<=dpr&&ratio<=2);
 }
 assert.equal(renderRatio(1366,768,1.25,false),1.25);
 assert.equal(renderRatio(1366,768,1,false,.65),1); // Never undersample a normal laptop.
});
test('adaptive sharpness ignores isolated/background gaps and avoids rapid resolution changes',()=>{
 const g=new ResolutionGovernor();for(let i=0;i<300;i++)g.sample(16.67,true);assert.equal(g.scale,1);
 g.sample(1000,true);g.sample(100,false);assert.equal(g.scale,1);
 for(let i=0;i<190;i++)g.sample(33.34,true);assert.ok(g.scale<1&&g.scale>.8);
 const reduced=g.scale;for(let i=0;i<300;i++)g.sample(16.67,true);assert.equal(g.scale,reduced);
 for(let i=0;i<1900;i++)g.sample(16.67,true);assert.ok(g.scale>reduced&&g.scale<=1);
 for(let i=0;i<4000;i++)g.sample(33.34,true);assert.equal(g.scale,.65);
});
