import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PublicWheelRoom} from '../server/public-room.js';
import {CrewRoom} from '../server/room.js';
import {CrewState,Player,SpilledMaterial,RaceResult} from '../server/state.js';
import {Client as ServerClient} from '@colyseus/core';
import {stepCart,resetCart,WHEEL_OBSTACLES,WHEEL_GATES} from '../shared/wheelbarrow.js';
function waiting(){const r=new PublicWheelRoom();r.setState(new CrewState());r.state.publicMatch=true;return r;}
function add(r:PublicWheelRoom,id:string){r.onJoin({sessionId:id} as ServerClient,{name:id,matchKey:'test-worker-key-'+id});}
test('public countdown requires two connected workers, cancels below two, accepts eight and rejects duplicates',async()=>{
 const r=waiting();try{
 add(r,'one');r.tick(10);assert.equal(r.state.matchCountdown,0);add(r,'two');r.tick(1);assert.equal(r.state.matchCountdown,14);
 for(let i=3;i<=8;i++)add(r,String(i));assert.equal(r.state.players.size,8);
 assert.throws(()=>add(r,'ninth'),/full/);assert.throws(()=>add(r,'one'),/Already assigned/);
 for(const id of ['two','3','4','5','6','7','8'])await r.onLeave({sessionId:id} as ServerClient,true);
 r.tick(1);assert.equal(r.state.matchCountdown,0);assert.equal(r.state.players.size,1);
 add(r,'two');r.tick(1);assert.equal(r.state.matchCountdown,14);
 }finally{r.onDispose();}
});
test('FIFO removes only spilled hazards and preserves score snapshots and permanent geometry',()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.hazardCap=2;
 const p=new Player();p.spills=13;r.state.players.set('p',p);const result=new RaceResult();result.spills=9;result.time=32;r.state.results.push(result);
 const originalObstacles=JSON.stringify(WHEEL_OBSTACLES),originalGates=JSON.stringify(WHEEL_GATES);
 for(let i=0;i<8;i++){const h=new SpilledMaterial();h.x=i;r.state.material.push(h);}
 const collision=[...r.state.material];r.trimHazards(collision);
 assert.deepEqual([...r.state.material].map(h=>h.x),[6,7]);assert.deepEqual(collision,[...r.state.material]);assert.equal(p.spills,13);assert.equal(result.spills,9);assert.equal(result.time,32);
 assert.equal(JSON.stringify(WHEEL_OBSTACLES),originalObstacles);assert.equal(JSON.stringify(WHEEL_GATES),originalGates);
 const removed=new SpilledMaterial();Object.assign(removed,{x:-6,z:5.4,materialId:2});r.state.material.unshift(removed);const list=[...r.state.material];r.trimHazards(list);assert.ok(!list.includes(removed));
 const a=new Player(),b=new Player();resetCart(a,0,1);resetCart(b,0,1);stepCart(a,0,-1,1/30,list);stepCart(b,0,-1,1/30,[]);assert.equal(a.speed,b.speed);assert.equal(a.z,b.z);
});
test('default cap survives connected courses and real spill generation without changing counters',()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.mode='championship';r.restart(false);r.state.phase='test';r.state.racePhase='racing';
 const p=new Player();resetCart(p,0,1);r.state.players.set('p',p);
 for(let i=0;i<190;i++){const h=new SpilledMaterial();h.x=100+i;r.state.material.push(h);}const list=[...r.state.material];r.trimHazards(list);assert.equal(list.length,150);assert.equal(list[0].x,140);
 r.beginSecondLeg();assert.equal(r.state.material.length,150);
 for(let i=0;i<40;i++){Object.assign(p,{x:-6,z:3,speed:5.5,instability:.999,reload:0,inputX:1,inputZ:0,lastInput:Date.now()});r.state.leg=0;r.tick(1/30);assert.ok(r.state.material.length<=150);}
 assert.equal(p.spills,40);assert.equal(p.legSpills,40);assert.ok([...r.state.material].every(h=>h.x<100));
});
