import {test} from 'node:test';
import assert from 'node:assert/strict';
import {arena,action,step,type Block} from '../shared/crane.js';
import {derbyArena,derbyPivot,derbyPose,derbyHeight,stepDerby} from '../shared/derby.js';
const block=(x:number,y:number,angle=0):Block=>({id:0,x,y,angle,vx:0,vy:-65,spin:7,stable:0,support:-2});
const bottom=(b:Block)=>b.y-2*Math.abs(Math.sin(b.angle))-Math.abs(Math.cos(b.angle));
test('fast rotated drops cannot tunnel through the pad or yard, including platform edges',()=>{
 for(const x of [-8,-4.9,0,4.9,8])for(const angle of [0,.4,1.2]){
  const a=arena();a.blocks=[block(x,18,angle)];
  for(let i=0;i<240;i++){step(a,0,1/30);for(const b of a.blocks){assert.ok(bottom(b)>-2.035,'yard penetration');if(Math.abs(b.x)<2.7)assert.ok(bottom(b)>-.035,'pad penetration');}}
  assert.ok(a.blocks.every(b=>Math.abs(b.spin)<.06&&Math.hypot(b.vx,b.vy)<.08),'must dissipate motion');
 }
});
test('a rotated resting container preserves orientation through geometry, without angle snapping',()=>{
 const a=arena();a.blocks=[{...block(8,4,.6),spin:0,vy:0}];let moved=false;
 for(let i=0;i<240;i++){const before=a.blocks[0]?.angle;step(a,0,1/30);const b=a.blocks[0];if(b&&before!==undefined){assert.ok(Math.abs(b.angle-before)<.25);moved ||=Math.abs(b.angle-.6)>.2;}}
 assert.ok(moved);assert.equal(a.score,0);
});
test('repeated releases are bounded, and objects outside the yard are retired',()=>{
 const a=arena();for(let i=0;i<90;i++){a.x=-8;action(a);a.x=0;action(a);step(a,0,1/30);}assert.ok(a.blocks.length<=60);
 a.blocks=[{...block(36,1),id:90},{...block(0,-20),id:91}];step(a,0,1/30);assert.equal(a.blocks.length,0);
});
test('boom tip, rope and ball share one continuous 3D pendulum over the whole control range',()=>{
 const d=derbyArena();const depths=new Set<number>();
 for(let i=0;i<600;i++){derbyHeight(d,i<300?1:-1,1/30);stepDerby(d,i<300?1:-1,1/30);const p=derbyPose(d),pivot=derbyPivot(d);assert.ok(Math.abs(Math.hypot(p.x-pivot.x,p.y-pivot.y,p.z-pivot.z)-(16-d.height))<1e-8);assert.ok(Math.abs(d.yaw)<=1.22);depths.add(Math.round(p.z*10));}
 assert.ok(depths.size>20);assert.equal(d.targets.length,31);
});
test('hoisting preserves pendulum angular momentum and stopping retains swing',()=>{
 const d=derbyArena();d.crane.omega=.4;const old=(16-d.height)**2*d.crane.omega;derbyHeight(d,1,1/30);assert.ok(Math.abs((16-d.height)**2*d.crane.omega-old)<1e-8);
 for(let i=0;i<30;i++)stepDerby(d,1,1/30);const swing=d.crane.swing;stepDerby(d,0,1/30);assert.notEqual(d.crane.swing,swing);assert.ok(Math.abs(d.crane.omega)>0);
});
