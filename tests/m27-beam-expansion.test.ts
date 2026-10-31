import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CrewRoom} from '../server/room.js';
import {BeamTeam,CrewState,Player} from '../server/state.js';
import {beamTerrainHeight,BEAM_MAPS,chooseBeamMap,beamWorld,courseLoads,onBeamPlatform,recoverTeam,stepChaosTeam} from '../shared/beam-chaos.js';
import {beamCollides,gripPosition} from '../shared/beam.js';

test('random covers every alternative and never immediately repeats',()=>{
 for(let previous=0;previous<BEAM_MAPS.length;previous++){
  const chosen=new Set(Array.from({length:40},(_,i)=>chooseBeamMap(previous,()=>i/40)));
  assert.equal(chosen.size,4);assert.ok(!chosen.has(previous));
 }
});
for(const count of [2,4,6,8])for(let map=0;map<BEAM_MAPS.length;map++)test(`${count} workers / course ${map}: spawn, both grips, release, checkpoint recovery, scores and rematch`,()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.mode='competitive';r.state.beamMap=map;
 for(let i=0;i<count;i++)r.state.players.set(String(i),new Player());assert.ok(r.restart(false));assert.equal(r.state.teams.length,count/2);
 r.state.phase='test';r.state.racePhase='racing';
 for(const [i,b]of r.state.teams.entries()){
  const members=[...r.state.players.values()].filter(p=>p.team===i);
  assert.equal(beamCollides(b,0,beamWorld(map)),false);
  for(const p of members){assert.ok(onBeamPlatform(p.x,p.z,map,.45));p.grip=p.end;p.inputZ=-1;}
  stepChaosTeam(b,members,1/30,1/30,map);assert.ok(b.leftSupported&&b.rightSupported);
  members.forEach(p=>p.grip=-1);stepChaosTeam(b,members,1/30,2/30,map);assert.ok(!b.leftSupported&&!b.rightSupported);
  b.checkpoint=true;b.stage=2;recoverTeam(b,members);assert.equal(b.penalty,5);assert.equal(b.x,5);assert.equal(b.angle,0);
  members.forEach(p=>assert.deepEqual({x:p.x,z:p.z},gripPosition(b,p.end)));
  b.delivered=true;b.finishTime=30+i;
 }
 r.tick(1/30);assert.equal(r.state.racePhase,'results');assert.deepEqual([...r.state.teams].map(b=>b.place),Array.from({length:count/2},(_,i)=>i+1));
 assert.ok(r.restart(false));assert.equal(r.state.beamMap,map);assert.ok(r.state.teams.every(b=>b.penalty===0&&!b.delivered));
});
test('random restart chooses once for the room; checkpoint resets retain the course',()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.mode='competitive';r.state.beamRandom=true;
 r.state.players.set('a',new Player());r.state.players.set('b',new Player());
 for(let i=0;i<20;i++){const previous=r.state.beamMap;assert.ok(r.restart(false));assert.notEqual(r.state.beamMap,previous);const selected=r.state.beamMap;r.restart(true);assert.equal(r.state.beamMap,selected);}
});
test('new moving machinery is deterministic and renderer positions match authoritative hazards',()=>{
 for(const map of [3,4])for(let t=0;t<20;t+=.5){assert.deepEqual(courseLoads(map,t),beamWorld(map).hazards(t).slice(0,2));assert.deepEqual(beamWorld(map).hazards(t),beamWorld(map).hazards(t));}
});
for(const map of [3,4])test(`new course ${map}: boundary fall recovers both workers at latest checkpoint`,()=>{
 const b=new BeamTeam();b.checkpoint=true;b.stage=2;Object.assign(b,{x:33,z:-7.5,angle:0});
 const members=[0,7].map(end=>Object.assign(new Player(),{end,grip:end},gripPosition(b,end)));
 stepChaosTeam(b,members,1/30,1,map);assert.equal(b.recoveries,1);assert.equal(b.penalty,5);assert.equal(b.x,5);assert.ok(members.every(p=>p.grip===-1));
});

test('Muddy Monday bridge ramps rise gently, return flush and leave other courses unchanged',()=>{
 for(let i=0;i<5;i++)assert.equal(beamTerrainHeight(i,13,-7.5),i===4?.22:0);
 for(const x of [9,10,17,18])assert.equal(beamTerrainHeight(4,x,-7.5),0);
 assert.equal(beamTerrainHeight(4,10.5,-7.5),.11);assert.equal(beamTerrainHeight(4,16.5,-7.5),.11);
 assert.equal(beamTerrainHeight(4,13,0),0);
});
