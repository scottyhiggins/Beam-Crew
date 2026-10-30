import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CrewRoom} from '../server/room.js';
import {CrewState,Player} from '../server/state.js';
function pair(){const r=new CrewRoom();r.setState(new CrewState());r.state.mode='competitive';for(let i=0;i<2;i++)r.state.players.set(String(i),new Player());r.restart(false);r.state.phase='test';r.state.racePhase='results';r.state.teams[0].dnf=true;return r;}
test('QA: reject solo Beam replay before mutating the completed round',()=>{
 const r=pair(),host=r.state.players.get('0')!,team=r.state.teams[0];r.state.players.delete('1');r.state.elapsed=42;const resets=r.state.raceResets;
 assert.equal(r.restart(false),false);assert.equal(r.state.teams[0],team);assert.equal(r.state.elapsed,42);assert.equal(r.state.raceResets,resets);assert.equal(r.state.racePhase,'results');assert.match(host.feedback,/Waiting for a teammate/);
});
test('QA: reserved disconnected worker is ineligible until reconnected',()=>{
 const r=pair(),guest=r.state.players.get('1')!;guest.connected=false;const team=r.state.teams[0];assert.equal(r.restart(false),false);assert.equal(r.state.teams[0],team);
 guest.connected=true;assert.equal(r.restart(false),true);assert.equal(r.state.teams.length,1);assert.equal(r.state.racePhase,'countdown');
});
import {beamActionState} from '../shared/beam-session.js';
for(const count of [2,4,6,8])test(`QA: valid ${count}-worker Beam replay keeps exactly two workers per beam`,()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.mode='competitive';for(let i=0;i<count;i++)r.state.players.set(String(i),new Player());
 assert.equal(r.restart(false),true);assert.equal(r.state.teams.length,count/2);
 for(let team=0;team<count/2;team++)assert.deepEqual([...r.state.players.values()].filter(p=>p.team===team).map(p=>p.end),[0,7]);
});
test('QA: no connected workers cannot create a spectator-only round; odd counts keep full teams',()=>{
 const r=pair();for(const p of r.state.players.values())p.connected=false;const team=r.state.teams[0];assert.equal(r.restart(true),false);assert.equal(r.state.teams[0],team);
 for(const p of r.state.players.values())p.connected=true;r.state.players.set('2',new Player());assert.equal(r.restart(false),true);assert.equal(r.state.teams.length,1);assert.equal(r.state.players.get('2')!.team,-1);
});
test('QA: action policy clears stale attached state for spectators, missing teams, countdown, DNF and results',()=>{
 const r=pair(),me=r.state.players.get('0')!;r.state.racePhase='racing';r.state.teams[0].dnf=false;me.grip=me.end;
 assert.deepEqual(beamActionState(r.state,me),{enabled:true,attached:true,message:''});
 for(const phase of ['countdown','results']){r.state.racePhase=phase;const a=beamActionState(r.state,me);assert.equal(a.enabled,false);assert.equal(a.attached,false);}r.state.racePhase='racing';
 for(const flag of ['dnf','delivered'] as const){r.state.teams[0][flag]=true;assert.equal(beamActionState(r.state,me).enabled,false);r.state.teams[0][flag]=false;}
 me.team=-1;assert.match(beamActionState(r.state,me).message,/Spectating/);assert.equal(beamActionState(r.state,me).attached,false);
 me.team=99;assert.equal(beamActionState(r.state,me).enabled,false);me.team=0;me.end=-1;assert.equal(beamActionState(r.state,me).enabled,false);
});
test('QA: lost/reconnecting partner, protection and completed delivery hide action until eligible again',()=>{
 const r=pair(),me=r.state.players.get('0')!,partner=r.state.players.get('1')!;r.state.racePhase='racing';r.state.teams[0].dnf=false;
 partner.connected=false;assert.match(beamActionState(r.state,me).message,/reconnecting/);partner.connected=true;
 r.state.teams[0].protection=1;assert.equal(beamActionState(r.state,me).enabled,false);r.state.teams[0].protection=0;assert.equal(beamActionState(r.state,me).enabled,true);
 r.state.players.delete('1');assert.match(beamActionState(r.state,me).message,/Waiting for a teammate/);
});
test('QA: team DNF and delivery release grips and stop stale controls',()=>{
 const r=pair(),me=r.state.players.get('0')!;r.state.teams[0].dnf=false;r.state.racePhase='racing';me.grip=me.end;me.inputX=1;r.state.players.delete('1');r.tick(1/30);
 assert.equal(r.state.teams[0].dnf,true);assert.equal(me.grip,-1);assert.equal(me.inputX,0);assert.equal(r.state.racePhase,'results');
});
