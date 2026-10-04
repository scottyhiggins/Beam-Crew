import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BEAM_CONFIG,COURSE,createBeam,stepBeam,resetBeam,gripPosition,nearestGrip,beamCollides, type Carrier} from '../shared/beam.js';
const dt=1/30;
function simulate(b= createBeam(),carriers:Carrier[],seconds=1){for(let i=0;i<Math.round(seconds/dt);i++)stepBeam(b,carriers,dt);return b;}
const pair=(x:number,z:number):Carrier[]=>[{grip:0,inputX:x,inputZ:z},{grip:7,inputX:x,inputZ:z}];
test('same input translates a fully supported beam without unintended rotation',()=>{
  const b=createBeam();simulate(b,pair(0,-1));assert.ok(b.z<5);assert.equal(b.x,-5);assert.equal(b.angle,Math.PI/2);assert.ok(b.leftSupported&&b.rightSupported);
});
test('opposite crosswise inputs deliberately rotate; opposite axial inputs cancel',()=>{
  const turning=createBeam();simulate(turning,[{grip:0,inputX:-1,inputZ:0},{grip:7,inputX:1,inputZ:0}],.8);
  assert.ok(turning.angle<1.3);assert.equal(turning.x,-5);assert.equal(turning.z,6);
  const resisted=createBeam();simulate(resisted,[{grip:0,inputX:0,inputZ:-1},{grip:7,inputX:0,inputZ:1}]);
  assert.equal(resisted.z,6);assert.equal(resisted.angle,Math.PI/2);
});
test('unsupported end lowers and materially reduces movement effectiveness',()=>{
  const carried=createBeam(),dragged=createBeam();simulate(carried,pair(0,-1));simulate(dragged,[{grip:0,inputX:0,inputZ:-1}]);
  assert.ok(6-dragged.z<(6-carried.z)*.7);assert.ok(dragged.leftHeight>.9);assert.equal(dragged.rightHeight,BEAM_CONFIG.groundedHeight);
  assert.equal(dragged.leftSupported,true);assert.equal(dragged.rightSupported,false);
});
test('diagonal input is normalized; idle carriers cannot create motion',()=>{
  const straight=createBeam(),diagonal=createBeam();simulate(straight,pair(0,-1),.3);simulate(diagonal,pair(1,-1),.3);
  assert.ok(Math.hypot(diagonal.vx,diagonal.vz)<=Math.hypot(straight.vx,straight.vz)+1e-10);
  const idle=createBeam();simulate(idle,pair(0,0));assert.equal(idle.x,-5);assert.equal(idle.z,6);
});
test('grips respect proximity and occupancy',()=>{
  const b=createBeam(),p=gripPosition(b,0);assert.equal(nearestGrip(b,p.x,p.z,new Set()),0);
  assert.equal(nearestGrip(b,p.x,p.z,new Set([0])),-1);assert.equal(nearestGrip(b,9,-9,new Set()),-1);
});
test('beam cannot cross a doorway wall, column or platform boundary',()=>{
  const wall=createBeam();Object.assign(wall,{x:3,z:5,angle:0});simulate(wall,pair(0,-1),4);
  assert.ok(wall.z>COURSE.doorwayZ);assert.equal(beamCollides(wall),false);assert.equal(wall.blocked,true);
  const column=createBeam();Object.assign(column,{x:4,z:-3.9,angle:Math.PI/2});simulate(column,pair(-1,0),4);
  assert.ok(column.x>0);assert.equal(beamCollides(column),false);
  const edge=createBeam();simulate(edge,pair(0,1),4);assert.equal(beamCollides(edge),false);assert.ok(edge.z<6.71);
});
test('doorway, intentional ninety-degree turn and destination are reachable',()=>{
  const b=createBeam();let ticks=0;
  while(b.z> -6.1&&ticks++<300)stepBeam(b,pair(0,-1),dt);
  assert.ok(b.z<=-6.1);assert.equal(b.checkpoint,true);
  simulate(b,pair(0,0),.8);
  ticks=0;
  while(b.angle>.05&&ticks++<180)stepBeam(b,[{grip:0,inputX:-1,inputZ:0},{grip:7,inputX:1,inputZ:0}],dt);
  assert.ok(b.angle<.05);simulate(b,pair(0,0),.8);
  ticks=0;while(b.x<4.3&&ticks++<300)stepBeam(b,pair(1,0),dt);
  simulate(b,pair(0,0),1);assert.equal(b.delivered,true,JSON.stringify(b));assert.equal(beamCollides(b),false);
});
test('checkpoint reset clears grips-independent motion and delivery; full restart clears checkpoint',()=>{
  const b=createBeam();b.checkpoint=true;b.delivered=true;b.vx=3;resetBeam(b);
  assert.equal(b.x,COURSE.checkpoint.x);assert.equal(b.z,COURSE.checkpoint.z);assert.equal(b.vx,0);assert.equal(b.delivered,false);assert.equal(b.leftSupported,false);
  resetBeam(b,false);assert.equal(b.checkpoint,false);assert.equal(b.z,COURSE.start.z);
});
test('beam simulation is deterministic and settles after neutral input',()=>{
  const a=createBeam(),b=createBeam();for(let i=0;i<150;i++){const input=pair(Math.sin(i*.13),-.4);stepBeam(a,input,dt);stepBeam(b,input,dt);}assert.deepEqual(a,b);
  simulate(a,[],3);assert.ok(Math.hypot(a.vx,a.vz)<1e-7);assert.ok(Math.abs(a.angularVelocity)<1e-7);
});
