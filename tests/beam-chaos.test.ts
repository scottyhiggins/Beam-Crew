import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BeamTeam,CrewState,Player} from '../server/state.js';
import {CrewRoom} from '../server/room.js';
import {COURSE,beamCollides,gripPosition,movingLoads,workerCollides} from '../shared/beam.js';
import {BEAM_MAPS,beamWorld,excavatorBoxes,onBeamPlatform,pushAssembly,pushWorker,recoverTeam,separation,stepChaosTeam,validBeamMap} from '../shared/beam-chaos.js';
function pair(b=new BeamTeam()){
 return [0,7].map(end=>{const p=new Player();Object.assign(p,{end,grip:end,connected:true},gripPosition(b,end));return p;});
}
test('stationary beam is pushed by a moving load with no remaining overlap',()=>{
 const b=new BeamTeam();Object.assign(b,{x:13,z:-7.3,angle:0});const members=pair(b),initial=b.z;
 for(let i=1;i<=120;i++)stepChaosTeam(b,members,1/120,5+i/120,0);
 assert.notEqual(b.z,initial);assert.equal(b.recoveries,0);assert.equal(beamCollides(b,6,beamWorld(0)),false);
 members.forEach(p=>assert.deepEqual({x:p.x,z:p.z},gripPosition(b,p.end)));
});
test('stationary free worker is pushed out of a load',()=>{
 const p=pair()[0];Object.assign(p,{x:13,z:-7.5,grip:-1});
 const obstacle={x:13,z:-7.2,halfX:.65,halfZ:.8};
 assert.ok(pushWorker(p,[obstacle]));assert.ok(p.z<-8);assert.equal(workerCollides(p.x,p.z,.45,0,{obstacles:[obstacle],hazards:()=>[]}),false);
});
test('impossible opposing wall constraints report failure instead of pinning forever',()=>{
 const b=new BeamTeam();Object.assign(b,{x:0,z:0,angle:0});
 assert.equal(pushAssembly(b,[],[{x:0,z:-.3,halfX:10,halfZ:.3},{x:0,z:.3,halfX:10,halfZ:.3}]),false);
});
test('touching boxes do not jitter; penetrating rotated boxes separate',()=>{
 assert.equal(separation({x:0,z:0,angle:0,halfX:1,halfZ:1},{x:2,z:0,halfX:1,halfZ:1}),null);
 assert.ok(separation({x:0,z:0,angle:.7,halfX:3.2,halfZ:.2},{x:1,z:1,halfX:.8,halfZ:.8}));
});
for(const id of [1,2])test(`map ${id}: falling worker resets both workers and beam at checkpoint`,()=>{
 const b=new BeamTeam();Object.assign(b,{x:16,z:-7.5,angle:0,checkpoint:true});const p=pair(b);p[0].grip=-1;p[0].x=15;p[0].z=0;
 stepChaosTeam(b,p,1/30,1,id);
 assert.equal(b.recoveries,1);assert.equal(b.penalty,5);assert.equal(b.checkpoint,true);assert.equal(b.x,COURSE.checkpoint.x);assert.equal(b.z,COURSE.checkpoint.z);
 for(const worker of p){assert.equal(worker.grip,-1);assert.deepEqual({x:worker.x,z:worker.z},gripPosition(b,worker.end));}
 assert.ok(b.protection>1);
});
test('a falling beam recovers even when free workers are safe',()=>{
 const b=new BeamTeam();Object.assign(b,{x:16,z:-4.8,angle:Math.PI/2});const p=pair();p.forEach(w=>w.grip=-1);
 stepChaosTeam(b,p,1/30,1,2);assert.equal(b.recoveries,1);assert.equal(b.checkpoint,false);assert.equal(b.x,COURSE.start.x);
});
test('respawn freezes team briefly, charges once and clears motion',()=>{
 const b=new BeamTeam(),p=pair(b);b.vx=4;recoverTeam(b,p);const x=b.x;
 p.forEach(w=>w.inputX=1);for(let i=0;i<30;i++)stepChaosTeam(b,p,1/30,i/30,2);
 assert.equal(b.x,x);assert.equal(b.penalty,5);assert.equal(b.recoveries,1);assert.equal(b.vx,0);assert.ok(b.protection>0);
});
test('maps have distinct fall boundaries and validation rejects malformed IDs',()=>{
 assert.equal(BEAM_MAPS.length,3);assert.ok(onBeamPlatform(16,0,0));assert.ok(!onBeamPlatform(16,0,1));
 assert.ok(onBeamPlatform(16,-4.8,1));assert.ok(!onBeamPlatform(16,-4.8,2));
 for(const id of [-1,3,'1',null,NaN,Infinity,.5])assert.equal(validBeamMap(id),false);assert.ok(validBeamMap(2));
});
test('excavator sweep is deterministic, bounded and server collision geometry covers its tip',()=>{
 for(let t=0;t<20;t+=.1){const boxes=excavatorBoxes(t);assert.deepEqual(boxes,excavatorBoxes(t));assert.equal(boxes.length,16);
 const tip=boxes.at(-1)!;assert.equal(workerCollides(tip.x,tip.z,.45,t,beamWorld(2)),true);}
 assert.notDeepEqual(excavatorBoxes(0),excavatorBoxes(2));
});
test('bounded substeps prevent moving load tunneling across a stationary assembly',()=>{
 const b=new BeamTeam();Object.assign(b,{x:13,z:-7.4,angle:0});const p=pair(b);
 for(let i=1;i<=100;i++){stepChaosTeam(b,p,.1,4+i*.1,0);if(b.protection===0){assert.ok(!beamCollides(b,4+i*.1,beamWorld(0)));}}
 assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.z));
});
for(const count of [2,4,6,8])test(`${count} players: recovery is team-local and replay clears penalties`,()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.mode='competitive';r.state.beamMap=2;
 for(let i=0;i<count;i++)r.state.players.set(String(i),new Player());r.restart(false);
 const workers=[...r.state.players.values()].filter(p=>p.team===0);recoverTeam(r.state.teams[0],workers);
 assert.equal(r.state.teams[0].penalty,5);for(const b of [...r.state.teams].slice(1))assert.equal(b.penalty,0);
 r.restart(false);assert.equal(r.state.beamMap,2);for(const b of r.state.teams){assert.equal(b.penalty,0);assert.equal(b.recoveries,0);}
});
test('disconnected teammate pauses assembly; round timeout resolves missing partners',()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.mode='competitive';const workers=pair();workers.forEach((p,i)=>r.state.players.set(String(i),p));
 r.restart(false);r.state.phase='test';r.state.racePhase='racing';workers[1].connected=false;
 const x=r.state.teams[0].x;r.tick(1/30);assert.equal(r.state.teams[0].x,x);assert.ok(r.state.teams[0].waiting>0);
 r.state.elapsed=240;r.tick(1/30);assert.equal(r.state.racePhase,'results');assert.ok(r.state.teams[0].dnf);
});
test('hazards still push stationary teams while a partner reconnects',()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.mode='competitive';for(let i=0;i<2;i++)r.state.players.set(String(i),new Player());
 r.restart(false);r.state.phase='test';r.state.racePhase='racing';r.state.elapsed=5;
 const b=r.state.teams[0];Object.assign(b,{x:13,z:-7.3,angle:0});const members=[...r.state.players.values()];
 members.forEach(p=>{p.grip=p.end;Object.assign(p,gripPosition(b,p.end));});members[1].connected=false;members[1].grip=-1;
 for(let i=0;i<120;i++)r.tick(1/120);
 assert.ok(b.x!==13||b.z!==-7.3||b.recoveries>0);
 if(!b.protection)assert.equal(beamCollides(b,r.state.elapsed,beamWorld(0)),false);
 assert.equal(b.rightSupported,false);
});
test('penalty-adjusted team ranking is fair and completed times stay immutable',()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.mode='competitive';for(let i=0;i<4;i++)r.state.players.set(String(i),new Player());
 r.restart(false);r.state.phase='test';r.state.racePhase='racing';
 Object.assign(r.state.teams[0],{delivered:true,finishTime:30,penalty:5});Object.assign(r.state.teams[1],{delivered:true,finishTime:28});
 r.tick(1/30);assert.equal(r.state.teams[1].place,1);assert.equal(r.state.teams[0].place,2);assert.equal(r.state.teams[0].finishTime,30);
});
test('latest checkpoint retains the completed turn on recovery',()=>{
 const b=new BeamTeam();Object.assign(b,{x:5,z:-7,angle:0,checkpoint:true});const p=pair(b);
 stepChaosTeam(b,p,1/30,1,2);assert.equal(b.stage,2);recoverTeam(b,p);assert.equal(b.angle,0);assert.equal(b.x,5);assert.ok(b.checkpoint);
});
test('hazard knockback beyond a worker boundary recovers rather than blocking all future input',()=>{
 const b=new BeamTeam();Object.assign(b,{x:26,z:-9,angle:0,checkpoint:true});const p=pair(b);
 stepChaosTeam(b,p,1/30,1,0);assert.equal(b.recoveries,1);assert.equal(b.z,COURSE.checkpoint.z);
});
test('replay reset numbers remain monotonic after several automatic recoveries',()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.mode='competitive';for(let i=0;i<4;i++)r.state.players.set(String(i),new Player());
 r.restart(false);const members=[...r.state.players.values()].filter(p=>p.team===0);
 for(let i=0;i<4;i++)recoverTeam(r.state.teams[0],members);const previous=r.state.teams[0].resets;
 r.restart(false);for(const b of r.state.teams)assert.equal(b.resets,previous+1);
});
test('excavator contact moves or recovers a stationary beam assembly authoritatively',()=>{
 const b=new BeamTeam();Object.assign(b,{x:22,z:-7,angle:0,checkpoint:true});const p=pair(b),before={x:b.x,z:b.z};
 stepChaosTeam(b,p,1/30,Math.PI*1.5/.38,2);
 assert.ok(b.x!==before.x||b.z!==before.z||b.recoveries>0);
 if(!b.protection)assert.equal(beamCollides(b,Math.PI*1.5/.38,beamWorld(2)),false);
});
for(const map of [0,1,2])test(`full course ${map}: timed load crossings, recovery, checkpoints and supported delivery`,()=>{
 const b=new BeamTeam(),members=pair(b);let stage=0,lastReset=0;
 for(let i=1;i<240*30&&!b.delivered;i++){
  const t=i/30;if(b.resets!==lastReset){lastReset=b.resets;stage=b.stage>=2?2:0;}
  if(!b.protection)members.forEach(p=>p.grip=p.end);
  let x=0,z=0,turn=0;
  if(stage===0){z=-Math.min(1,Math.max(.08,(b.z+6.1)*1.5));if(b.z<=-6.05)stage=1;}
  else if(stage===1){turn=Math.min(1,b.angle*2);if(b.angle<.03)stage=2;}
  else {
   z=Math.max(-1,Math.min(1,((map===1?-7.5:b.x<21?-6.65:-7.5)-b.z)*2));turn=b.angle*2;x=Math.max(-1,Math.min(1,(26-b.x)*2));
   const loads=movingLoads(t);if(b.x<8.6&&b.x>7.5&&loads[0].z<-3.4)x=0;if(b.x>18&&b.x<18.8&&loads[1].z<-3.4)x=0;
  }
  members[0].inputX=x-Math.sin(b.angle)*turn;members[0].inputZ=z+Math.cos(b.angle)*turn;
  members[1].inputX=x+Math.sin(b.angle)*turn;members[1].inputZ=z-Math.cos(b.angle)*turn;
  stepChaosTeam(b,members,1/30,t,map);
 }
 assert.ok(b.delivered,`stuck at ${b.x},${b.z}`);assert.equal(b.stage,2);assert.ok(b.leftSupported&&b.rightSupported);
 assert.equal(b.penalty,b.recoveries*5);
});
