import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
import {createServer} from 'node:http';
import {Server,matchMaker} from '@colyseus/core';
import {WebSocketTransport} from '@colyseus/ws-transport';
import {PartyRoom} from '../server/party-room.js';
import {PUMPKIN_HARD_HAT,HAT_COLORS,VEST_COLORS,DEFAULT_WORKER_LOOK} from '../shared/cosmetics.js';
import {PROTOCOL_VERSION} from '../shared/version.js';
const endpoint=process.env.TEST_URL;
const pumpkin={hat:PUMPKIN_HARD_HAT,vest:VEST_COLORS.Green,expression:'goofy'};
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean,timeout=10000){const end=Date.now()+timeout;while(!fn()){if(Date.now()>end)throw Error('M22 integrated state timeout');await pause(25);}}

test('M22: eight Crane clients preserve pumpkin, protocol, private arenas, host transfer, reconnect, mode switch and replay',{skip:!endpoint,timeout:25000},async()=>{
 const c=new Client(endpoint!.replace(/^http/,'ws')),clients:Room[]=[],snap=new Map<Room,any>();
 const track=(r:Room)=>{clients.push(r);r.onMessage('snapshot',s=>snap.set(r,s));return r;};
 try{
  await assert.rejects(c.create('crane',{name:'Old protocol',protocol:PROTOCOL_VERSION-1}));
  const a=track(await c.create('crane',{name:'Pumpkin host',cosmetics:pumpkin,protocol:PROTOCOL_VERSION}));
  for(let i=1;i<8;i++)track(await c.joinById(a.roomId,{name:'Worker '+i,cosmetics:i===1?pumpkin:DEFAULT_WORKER_LOOK}));
  await until(()=>clients.every(r=>snap.get(r)?.leaders.length===8));
  for(const r of clients){assert.equal(snap.get(r).protocol,PROTOCOL_VERSION);assert.deepEqual(snap.get(r).leaders.find((p:any)=>p.id===a.sessionId).look,pumpkin);}
  const code=snap.get(a).code;a.send('start');await until(()=>clients.every(r=>snap.get(r)?.phase==='playing'));
  await assert.rejects(c.joinById(a.roomId,{name:'Late'}));a.send('action');await until(()=>snap.get(a).arena.held);assert.equal(snap.get(clients[1]).arena.held,false);
  const old=clients[1],token=old.reconnectionToken,id=old.sessionId;old.connection.close();await until(()=>snap.get(a).leaders.some((p:any)=>p.id===id&&!p.connected));
  const b=track(await c.reconnect(token));await until(()=>snap.get(b)?.leaders.find((p:any)=>p.id===id)?.connected);assert.equal(b.sessionId,id);assert.equal(snap.get(b).code,code);assert.deepEqual(snap.get(b).leaders.find((p:any)=>p.id===id).look,pumpkin);
  await a.leave();await until(()=>snap.get(b).host===id);b.send('lobby');await until(()=>snap.get(b).phase==='lobby');b.send('mode','derby');await until(()=>snap.get(b).mode==='derby');
  b.send('start');await until(()=>snap.get(b).phase==='playing'&&!!snap.get(b).derby);assert.equal(snap.get(b).derby.score,0);assert.equal(snap.get(b).arena.blocks.length,0);
  b.send('cosmetics',{hat:-1,vest:-1,expression:'invalid'});await until(()=>snap.get(b).leaders.find((p:any)=>p.id===id).look.hat===DEFAULT_WORKER_LOOK.hat);
  b.send('cosmetics',pumpkin);await until(()=>snap.get(b).leaders.find((p:any)=>p.id===id).look.hat===PUMPKIN_HARD_HAT);
  b.send('lobby');await until(()=>snap.get(b).phase==='lobby');b.send('mode','tower');await until(()=>snap.get(b).mode==='tower');b.send('start');await until(()=>snap.get(b).phase==='playing'&&!snap.get(b).derby);assert.equal(snap.get(b).arena.held,false);assert.equal(snap.get(b).arena.score,0);
 }finally{await Promise.allSettled(clients.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});

test('M22: eight-player Party pumpkin survives all mode boundaries, final podium, host transfer and replay',{timeout:20000},async()=>{
 const http=createServer(),server=new Server({transport:new WebSocketTransport({server:http})});server.define('m22_party',PartyRoom);const clients:Room[]=[],views=new Map<Room,any>();
 try{
  await server.listen(0,'127.0.0.1');const c=new Client('ws://127.0.0.1:'+(http.address() as any).port);
  for(let i=0;i<8;i++){const r=i?await c.joinById(clients[0].roomId,{name:'Worker '+i,cosmetics:pumpkin}):await c.create('m22_party',{name:'Pumpkin host',cosmetics:pumpkin});clients.push(r);r.onMessage('partyView',v=>views.set(r,v));r.send('partySync');}
  const a=clients[0],room=matchMaker.getLocalRoomById(a.roomId) as PartyRoom;await until(()=>clients.every(r=>r.state.players?.size===8));const code=room.state.code;
  room.continueParty();room.earliest=0;room.continueParty();for(const p of room.state.players.values())assert.equal(p.hat,PUMPKIN_HARD_HAT);
  room.deadline=0;room.partyTick(Date.now());room.earliest=0;room.continueParty();assert.equal(room.state.teams.length,4);for(const p of room.state.players.values())assert.equal(p.hat,PUMPKIN_HARD_HAT);
  const oldEpoch=room.epoch;for(const t of room.state.teams){t.delivered=true;t.finishTime=10;}room.state.racePhase='results';room.partyTick(Date.now());room.earliest=0;room.continueParty();assert.equal(room.trivia!.players.size,8);assert.equal(room.state.teams.length,0);assert.equal(room.state.material.length,0);
  a.send('input',{x:1,z:1,partyEpoch:oldEpoch});a.send('rescue',{partyEpoch:oldEpoch});await pause(80);assert.equal(room.state.players.get(a.sessionId)!.inputX,0);
  for(const t of room.trivia!.scores.values())t.score=1000;room.trivia!.phase='podium';room.partyTick(Date.now());room.publishParty();await until(()=>clients.every(r=>views.get(r)?.phase==='final'));
  for(const r of clients){assert.deepEqual(views.get(r).podium,views.get(a).podium);assert.ok(views.get(r).podium.ranking.every((p:any)=>p.look.hat===PUMPKIN_HARD_HAT));assert.equal(r.state.code,code);}
  await a.leave();await until(()=>room.state.host===clients[1].sessionId);clients[1].send('partyReplay',{epoch:room.epoch});await until(()=>room.partyPhase==='lobby');assert.equal(room.people.size,0);assert.equal(room.results.length,0);assert.equal(room.state.teams.length,0);assert.equal(room.state.code,code);assert.equal(room.state.players.get(clients[1].sessionId)!.hat,PUMPKIN_HARD_HAT);
 }finally{await Promise.allSettled(clients.filter(r=>r.connection.isOpen).map(r=>r.leave()));await server.gracefullyShutdown(false);}
});
