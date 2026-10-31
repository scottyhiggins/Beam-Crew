import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PartyRoom} from '../server/party-room.js';
import {CrewState,Player,ChampionshipResult} from '../server/state.js';
import {PARTY_PLAYLIST,PARTY_MODES,partyPoints,applyPartyResult,partyPodium,type PartyPerson} from '../shared/party.js';
function fixture(n:number){const r=new PartyRoom();r.setState(new CrewState());r.lock=async()=>{};r.unlock=async()=>{};r.state.host='0';for(let i=0;i<n;i++){const p=new Player();p.name='Worker '+i;p.color=i;r.state.players.set(String(i),p);}return r;}
function begin(r:PartyRoom){r.continueParty();assert.equal(r.partyPhase,'intermission');r.earliest=0;r.continueParty();}
test('only three finished adapters are playable; normalized points, shared ties and deterministic podium',()=>{
 assert.equal(PARTY_PLAYLIST.length,3);assert.equal(PARTY_MODES[3].available,false);
 for(let n=2;n<=8;n++){assert.equal(partyPoints(1,n,true),100);assert.equal(partyPoints(n,n,true),0);assert.equal(partyPoints(1,n,false),0);}
 assert.equal(partyPoints(1,1,true),100);assert.equal(partyPoints(1,1,false),0);
 const people=new Map<string,PartyPerson>();for(let i=0;i<4;i++)people.set(''+i,{id:''+i,name:''+i,order:i,points:0,wins:0,look:{hat:0,vest:0,expression:'happy'},stats:{}});
 applyPartyResult(people,{mode:'beam',entries:[{members:['0','1'],rank:1,eligible:true,native:'delivered',stats:{}},{members:['2','3'],rank:2,eligible:false,native:'DNF',stats:{}}]});
 assert.deepEqual([...people.values()].map(p=>p.points),[100,100,0,0]);assert.equal(partyPodium(people.values(),[]).winnerId,'0');
 applyPartyResult(people,{mode:'trivia',entries:[],skipped:'odd'});assert.equal(people.get('0')!.points,100);
});
test('2–8 players traverse the complete same-room playlist; incomplete pairs skip with bounded wait; replay resets ledger',()=>{
 for(let n=2;n<=8;n++){
  const r=fixture(n),ids=[...r.state.players.keys()];begin(r);assert.equal(r.partyPhase,'playing');assert.equal(r.state.championshipLength,3);assert.equal(r.routePlan.length,3);
  for(const [i,id]of ids.entries()){const t=r.state.standings.find(t=>t.playerId===id)!;Object.assign(t,{completed:3,spills:i,time:30});}
  r.state.racePhase='results';r.partyTick(Date.now());assert.equal(r.people.get('0')!.points,100);assert.equal(r.index,1);assert.equal(r.state.material.length,0);assert.equal(r.state.standings.length,0);
  r.earliest=0;r.continueParty();
  if(n%2){assert.equal(r.partyPhase,'pairing');r.partyTick(r.deadline+1);}else{assert.equal(r.state.teams.length,n/2);r.state.teams[0].delivered=true;r.state.teams[0].finishTime=20;r.state.racePhase='results';r.partyTick(Date.now());assert.equal(r.people.get('0')!.points,200);assert.equal(r.people.get('1')!.points,100+partyPoints(2,n,true));}
  assert.equal(r.index,2);r.earliest=0;r.continueParty();
  assert.equal(r.partyPhase,'playing');assert.equal(r.trivia!.count,5);r.trivia!.scores.get('0')!.score=3000;r.trivia!.phase='podium';r.partyTick(Date.now());assert.equal(r.results[2].entries.length,n);assert.equal(r.results[2].entries[0].members.length,1);
  assert.equal(r.partyPhase,'final');assert.equal(r.results.length,3);assert.deepEqual([...r.state.players.keys()],ids);assert.ok([...r.people.values()].every(p=>p.points<=300));
  r.newSession();assert.equal(r.people.size,0);assert.equal(r.results.length,0);assert.equal(r.partyPhase,'lobby');assert.equal(r.trivia,null);assert.ok([...r.state.players.values()].every(p=>p.spills===0&&p.grip===-1));
 }
});
test('unfinished races, abandoned teams, stale scoring and an unmatched final worker cannot stall the party',()=>{
 const r=fixture(2);begin(r);for(let leg=0;leg<3;leg++){r.state.racePhase='racing';r.state.elapsed=121;r.partyTick(Date.now());if(leg<2){assert.equal(r.state.racePhase,'intermission');r.beginSecondLeg();}}
 assert.equal(r.index,1);assert.ok([...r.people.values()].every(p=>p.points===0));
 r.earliest=0;r.continueParty();r.partyTick(r.deadline+1);assert.equal(r.index,2);assert.equal(r.results[1].entries[0].eligible,false);
 r.state.players.get('1')!.connected=false;r.earliest=0;r.continueParty();assert.equal(r.partyPhase,'pairing');r.partyTick(r.deadline+1);assert.equal(r.partyPhase,'final');
 const points=[...r.people.values()].map(p=>p.points);r.partyTick(Date.now()+999999);assert.deepEqual([...r.people.values()].map(p=>p.points),points);
});
test('trivia keeps independent scores when another worker disconnects',()=>{
 const r=fixture(2);begin(r);r.deadline=0;r.partyTick(Date.now());r.earliest=0;r.continueParty();r.deadline=0;r.partyTick(Date.now());r.earliest=0;r.continueParty();
 const g=r.trivia!;g.disconnect('1');const v=g.view('0',Date.now());assert.ok(v.question);assert.equal(v.answers?.length,4);
 assert.equal(g.answer('0',{choice:g.order.indexOf(0),epoch:g.epoch-1},Date.now()),false);assert.equal(g.answer('0',{choice:g.order.indexOf(0),epoch:g.epoch},Date.now()),true);g.tick(g.deadline);assert.equal(g.scores.get('0')!.score,1000);assert.equal(g.scores.get('1')!.score,0);
});
test('workplace awards require recorded play; empty or zero statistics do not invent achievements',()=>{
 const r=fixture(2);begin(r);const first=r.people.get('0')!;
 assert.deepEqual(partyPodium(r.people.values(),[]).awards,[]);
 first.stats={wheelSpills:0,wheelCompleted:0,beamRecoveries:0,triviaCorrect:0};assert.deepEqual(partyPodium(r.people.values(),[]).awards,[]);
 first.stats={wheelSpills:2,wheelCompleted:3,beamRecoveries:1,triviaCorrect:4};const awards=partyPodium(r.people.values(),[]).awards;assert.equal(awards.length,3);assert.deepEqual(awards.map(a=>a!.value),[2,1,4]);
});

test('Party Trivia runs five independent questions for odd crews and normalizes tied individual results once',()=>{
 const r=fixture(3);begin(r);r.deadline=0;r.partyTick(Date.now());r.earliest=0;r.continueParty();r.partyTick(r.deadline+1);r.earliest=0;r.continueParty();const g=r.trivia!;assert.equal(r.partyPhase,'playing');let now=Date.now();
 for(let round=0;round<5;round++){for(const id of ['0','1','2'])g.answer(id,{choice:g.order.indexOf(id==='2'?1:0),epoch:g.epoch},now+100);assert.equal(g.phase,'reveal');g.tick(g.deadline);now=g.deadline-20000;}
 assert.equal(g.phase,'podium');r.partyTick(Date.now());const result=r.results[2];assert.deepEqual(result.entries.map(e=>e.members.length),[1,1,1]);assert.deepEqual(result.entries.map(e=>e.rank),[1,1,3]);assert.equal(r.people.get('0')!.stats.triviaCorrect,5);assert.equal(r.people.get('1')!.stats.triviaCorrect,5);assert.equal(r.people.get('2')!.stats.triviaCorrect,0);assert.ok(result.entries.every(e=>e.members.length===1));const points=[...r.people.values()].map(p=>p.points);r.partyTick(Date.now());assert.deepEqual([...r.people.values()].map(p=>p.points),points);
});
