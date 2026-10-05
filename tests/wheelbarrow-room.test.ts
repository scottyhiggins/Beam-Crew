import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CrewRoom} from '../server/room.js';
import {CrewState,Player} from '../server/state.js';
import {resetCart,WHEEL_COURSE} from '../shared/wheelbarrow.js';
function race(){const room=new CrewRoom();room.setState(new CrewState());room.state.phase='test';room.state.mode='wheel';room.state.racePhase='racing';for(let i=0;i<2;i++){const p=new Player();resetCart(p,i,2);p.name=`Racer ${i}`;room.state.players.set(String(i),p);}return room;}
test('server keeps unfinished racer active and reranks a slower clean finish ahead of a spilled first finish',()=>{
 const room=race(),a=room.state.players.get('0')!,b=room.state.players.get('1')!;
 Object.assign(a,{x:-3,z:-19,checkpoint:WHEEL_COURSE.length,spills:1});room.state.elapsed=24;room.tick(1/30);
 assert.equal(a.finishOrder,1);assert.equal(b.finishOrder,0);assert.equal(room.state.racePhase,'racing');assert.equal(room.state.results.length,1);
 a.lastInput=Date.now();a.inputX=1;const x=a.x;room.tick(1/30);assert.equal(a.x,x);
 b.connected=false;room.tick(1/30);assert.equal(room.state.racePhase,'racing');b.connected=true;
 Object.assign(b,{x:-3,z:-19,checkpoint:WHEEL_COURSE.length});room.state.elapsed=31;room.tick(1/30);
 assert.equal(b.finishOrder,2);assert.equal(room.state.racePhase,'results');assert.equal(room.state.results.find(r=>r.name===b.name)!.place,1);assert.equal(room.state.results.find(r=>r.name===a.name)!.place,2);
 assert.equal(room.state.results.find(r=>r.name===a.name)!.finishOrder,1);
});
test('server generates one persistent spill, another racer moves it, and restart clears it',()=>{
 const room=race(),a=room.state.players.get('0')!,b=room.state.players.get('1')!;
 Object.assign(a,{x:-6,z:3,speed:5.5,instability:.999,inputX:1,inputZ:0,lastInput:Date.now()});room.tick(1/30);
 assert.equal(a.spills,1);assert.equal(room.state.material.length,6);
 for(let i=0;i<74;i++)room.tick(1/30);assert.equal(a.reload,0);assert.equal(room.state.material.length,6);
 const brick=room.state.material[0],z=brick.z;Object.assign(b,{x:brick.x,z:brick.z+1.7,rotation:Math.PI,speed:5.5,inputX:0,inputZ:-1,lastInput:Date.now()});room.tick(1/30);assert.notEqual(brick.z,z);
 room.state.players.delete('0');room.tick(1/30);assert.equal(room.state.material.length,6);
 room.restart(false);assert.equal(room.state.material.length,0);assert.equal(room.state.firstFinishAt,-1);assert.equal(room.state.results.length,0);
});
