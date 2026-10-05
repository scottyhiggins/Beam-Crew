import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WHEEL_CONFIG,WHEEL_COURSE,WHEEL_OBSTACLES,resetCart,stepCart,finishCarts,onCourse,spillMaterial,stepMaterial,compareResults,shouldEndRace,type Cart,type Material} from '../shared/wheelbarrow.js';
const cart=()=>{const p={} as Cart;resetCart(p,0);return p;};
test('cart reset and independent starts',()=>{const a=cart(),b=cart();resetCart(b,1);assert.notEqual(a.x,b.x);a.spills=3;assert.equal(b.spills,0);resetCart(a,0);assert.equal(a.spills,0);assert.equal(a.finishOrder,0);});
test('fast sharp steering is risky; slower driving avoids spill',()=>{const fast=cart(),slow=cart();fast.speed=WHEEL_CONFIG.maxSpeed;slow.speed=1;for(let i=0;i<15;i++){stepCart(fast,1,0,1/30);stepCart(slow,.2,0,1/30);}assert.ok(fast.instability>slow.instability+.2);});
test('neutral input recovers instability and brakes',()=>{const p=cart();p.instability=.8;p.speed=4;for(let i=0;i<30;i++)stepCart(p,0,0,1/30);assert.ok(p.instability<.6);assert.equal(p.speed,0);});
test('threshold spills once, holds during reload, resets predictably',()=>{const p=cart();p.instability=.999;p.speed=5.5;stepCart(p,1,0,1/30);assert.equal(p.spills,1);assert.equal(p.reload,WHEEL_CONFIG.reloadSeconds);const x=p.x,z=p.z;for(let i=0;i<70;i++)stepCart(p,1,0,1/30);assert.equal(p.spills,1);assert.equal(p.x,x);assert.equal(p.z,z);for(let i=0;i<4;i++)stepCart(p,0,0,1/30);assert.equal(p.reload,0);assert.equal(p.instability,0);});
test('rough terrain is spatial and fast driving risks more than careful driving',()=>{const rough=cart(),smooth=cart(),slow=cart();for(const p of [rough,smooth,slow])Object.assign(p,{x:0,z:-10,rotation:-Math.PI/2,speed:5.5});smooth.x=3;slow.speed=1;stepCart(rough,-1,0,1/30);stepCart(smooth,-1,0,1/30);stepCart(slow,-.2,0,1/30);assert.ok(rough.instability>smooth.instability);assert.ok(rough.instability>slow.instability);assert.ok(rough.instability>.03);});
test('solid posts brake and destabilize a severe impact more than a slow impact',()=>{
 const post=WHEEL_OBSTACLES.find(o=>o.z===3&&o.x<-6)!;assert.ok(post);
 const fast=cart(),slow=cart();for(const p of [fast,slow])Object.assign(p,{x:post.x+1.8,z:post.z,rotation:-Math.PI/2});fast.speed=5.5;slow.speed=1;
 stepCart(fast,-1,0,1/30);stepCart(slow,-.2,0,1/30);assert.ok(fast.speed<3);assert.ok(fast.instability>slow.instability+.2);
 assert.ok(Math.hypot(fast.x-1.1-post.x,fast.z-post.z)>=WHEEL_CONFIG.cartRadius+post.radius-.001);
});
test('spilled material persists, moves when another cart hits, and ignores finished racers',()=>{
 const p=cart();Object.assign(p,{x:-6,z:3,rotation:Math.PI});const material:Material[]=[];spillMaterial(p,material,b=>material.push(b));assert.equal(material.length,6);
 const b=material[0];const hitter=cart();Object.assign(hitter,{x:b.x,z:b.z+1.7,rotation:Math.PI,speed:5.5});const x=b.x,z=b.z;
 stepCart(hitter,0,-1,1/30,material);assert.ok(b.x!==x||b.z!==z);assert.ok(hitter.speed<5.5);assert.ok(hitter.instability>0);
 for(let i=0;i<300;i++)stepMaterial(material,1/30);assert.equal(material.length,6);assert.ok(material.every(m=>Number.isFinite(m.x)&&onCourse(m.x,m.z)));
 hitter.finishOrder=1;const snapshot=JSON.stringify(material);stepCart(hitter,1,1,1/30,material);assert.equal(JSON.stringify(material),snapshot);
});
test('eight-player repeated spills preserve all material within a bounded number of piles',()=>{
 const material:Material[]=[];for(let i=0;i<1000;i++){const p=cart();resetCart(p,i%8,8);spillMaterial(p,material,b=>material.push(b));}
 assert.equal(material.length,WHEEL_CONFIG.maxMaterial);assert.equal(material.reduce((n,b)=>n+b.amount,0),6000);stepMaterial(material,1/30);
});
test('ranking prioritizes spills, then time, with finish order only an exact tie breaker',()=>{
 const a={spills:0,time:31,finishOrder:3},b={spills:1,time:24,finishOrder:1},c={spills:1,time:27,finishOrder:2};assert.deepEqual([c,b,a].sort(compareResults),[a,b,c]);
 assert.ok(compareResults({...b,finishOrder:1},{...b,finishOrder:2})<0);
});
test('one finisher never ends the race by default; grace timeout is an explicit option',()=>{
 const a=cart(),b=cart();a.finishOrder=1;assert.equal(shouldEndRace([a,b],1000,20),false);assert.equal(shouldEndRace([a,b],49,20,30),false);assert.equal(shouldEndRace([a,b],50,20,30),true);b.finishOrder=2;assert.equal(shouldEndRace([a,b],25,20),true);
});
test('ordered checkpoints prevent shortcut finish; results remain immutable',()=>{const a=cart(),b=cart();a.z=-19;finishCarts([a,b],10);assert.equal(a.finishOrder,0);a.checkpoint=WHEEL_COURSE.length;finishCarts([a,b],11);assert.equal(a.finishOrder,1);assert.equal(a.finishTime,11);b.checkpoint=WHEEL_COURSE.length;b.z=-19;finishCarts([a,b],12);assert.equal(b.finishOrder,2);assert.equal(b.finishTime,12);finishCarts([a,b],13);assert.equal(a.finishTime,11);assert.equal(onCourse(10,7),false);});
test('controlled driver traverses the complete marked course',()=>{const p=cart();for(let tick=0;tick<9000&&!p.finishOrder;tick++){const goal=WHEEL_COURSE[Math.min(p.checkpoint,WHEEL_COURSE.length-1)];const dx=goal.x-p.x,dz=(p.checkpoint===WHEEL_COURSE.length?-20:goal.z)-p.z,length=Math.hypot(dx,dz);stepCart(p,dx/length*.55,dz/length*.55,1/30);finishCarts([p],tick/30);}assert.equal(p.finishOrder,1);assert.equal(p.spills,0);});
