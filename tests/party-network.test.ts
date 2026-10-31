import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {Server,matchMaker} from '@colyseus/core';
import {WebSocketTransport} from '@colyseus/ws-transport';
import {Client,type Room} from 'colyseus.js';
import {PartyRoom,partyRooms} from '../server/party-room.js';
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean){const end=Date.now()+8000;while(!fn()){if(Date.now()>end)throw Error('Party network timeout');await pause(20);}}
test('real clients: same-room transitions, host transfer, reconnect across modes, stale message guards and replay',{timeout:30000},async()=>{
 const http=createServer(),server=new Server({transport:new WebSocketTransport({server:http})});server.define('party_fixture',PartyRoom);const clients:Room[]=[];const views=new Map<Room,any>();
 const track=(r:Room)=>{clients.push(r);r.onMessage('partyView',v=>views.set(r,v));r.send('partySync');return r;};
 try{
  await server.listen(0,'127.0.0.1');const client=new Client('ws://127.0.0.1:'+(http.address() as {port:number}).port);
  let a=track(await client.create('party_fixture',{name:'Host',cosmetics:{hat:255,vest:65280,expression:'goofy'}}));const b=track(await client.joinById(a.roomId,{name:'Partner'}));await until(()=>a.state.players?.size===2&&!!views.get(a));
  const room=matchMaker.getLocalRoomById(a.roomId) as PartyRoom,code=room.state.code,epoch=room.epoch,id=a.sessionId,token=a.reconnectionToken,look=room.state.players.get(id)!.expression;
  b.send('partyContinue',{epoch});await pause(80);assert.equal(room.partyPhase,'lobby');
  a.send('partyContinue',{epoch});await until(()=>room.partyPhase==='intermission');a.send('start');a.send('mode','competitive');a.send('restart');await pause(60);assert.equal(room.partyPhase,'intermission');
  room.earliest=0;a.send('partyContinue',{epoch:room.epoch});await until(()=>room.partyPhase==='playing');assert.equal(room.state.mode,'championship');
  await until(()=>room.state.racePhase==='racing'&&room.state.elapsed>0);assert.ok(room.state.countdown===0);
  a.send('input',{x:1,z:0,partyEpoch:room.epoch-1});await pause(50);assert.equal(room.state.players.get(id)!.inputX,0);
  a.send('input',{x:.25,z:0,partyEpoch:room.epoch});await until(()=>room.state.players.get(id)!.inputX===.25);
  a.connection.close();await until(()=>room.state.host===b.sessionId&&!room.state.players.get(id)!.connected);
  room.deadline=0;room.partyTick(Date.now());assert.equal(room.index,1);
  a=track(await client.reconnect(token));await until(()=>room.state.players.get(id)!.connected&&a.state.players?.has(id));assert.equal(a.sessionId,id);assert.equal(a.roomId,b.roomId);assert.equal(a.state.code,code);assert.equal(a.state.players.get(id).expression,look);assert.equal(room.state.host,b.sessionId);
  room.earliest=0;b.send('partyContinue',{epoch:room.epoch});await until(()=>room.partyPhase==='playing');assert.equal(room.state.mode,'competitive');assert.equal(room.state.teams.length,1);
  const prior=room.epoch;b.send('partyContinue',{epoch:prior-1});room.state.teams[0].delivered=true;room.state.teams[0].finishTime=12;room.state.racePhase='results';room.partyTick(Date.now());assert.equal(room.people.get(id)!.points,100);
  room.earliest=0;b.send('partyContinue',{epoch:room.epoch});await until(()=>room.partyPhase==='playing');assert.equal(room.trivia!.players.size,2);assert.equal(room.state.teams.length,0);assert.equal(room.state.material.length,0);
  const g=room.trivia!,sender=a;
  sender.send('partyAnswer',{choice:g.order.indexOf(0),epoch:g.epoch,partyEpoch:prior});await pause(70);assert.equal(g.scores.get(a.sessionId)!.score,0);
  sender.send('partyAnswer',{choice:g.order.indexOf(0),epoch:g.epoch,partyEpoch:room.epoch});await until(()=>g.scores.get(a.sessionId)!.answer!==null);g.tick(g.deadline);assert.equal(g.scores.get(a.sessionId)!.score,1000);g.phase='podium';room.partyTick(Date.now());await until(()=>views.get(a)?.phase==='final'&&views.get(b)?.phase==='final');assert.deepEqual(views.get(a).podium,views.get(b).podium);assert.equal(views.get(a).podium.ranking.length,2);
  b.send('partyReplay',{epoch:room.epoch});await until(()=>room.partyPhase==='lobby');assert.equal(room.people.size,0);assert.equal(room.state.code,code);assert.equal(partyRooms.get(code),room);assert.equal(room.state.players.size,2);
  const friend=track(await client.joinById(b.roomId,{name:'Replay friend'}));await until(()=>friend.state.players?.size===3);b.send('partyContinue',{epoch:room.epoch});await until(()=>room.partyPhase==='intermission');assert.equal(room.results.length,0);assert.equal(room.people.size,3);
 }finally{await Promise.allSettled(clients.filter(r=>r.connection.isOpen).map(r=>r.leave()));await server.gracefullyShutdown(false);}
});
test('real 2–8 client matrix: native three-race finishes, team results, odd skips and shared final ranking',{timeout:40000},async()=>{
 const http=createServer(),server=new Server({transport:new WebSocketTransport({server:http})});server.define('party_matrix',PartyRoom);
 try{await server.listen(0,'127.0.0.1');const client=new Client('ws://127.0.0.1:'+(http.address() as {port:number}).port);
  for(let count=2;count<=8;count++){
   const clients:Room[]=[],views=new Map<Room,any>();
   try{
    const a=await client.create('party_matrix',{name:'P0'});clients.push(a);for(let i=1;i<count;i++)clients.push(await client.joinById(a.roomId,{name:'P'+i}));
    for(const c of clients){c.onMessage('partyView',v=>views.set(c,v));c.send('partySync');}
    await until(()=>clients.every(c=>c.state.players?.size===count));const r=matchMaker.getLocalRoomById(a.roomId) as PartyRoom,code=r.state.code;
    r.continueParty();r.earliest=0;r.continueParty();
    // Finish through the native crossing/ranking code. Fixture positions avoid
    // making a network contract test depend on six minutes of steering.
    for(let leg=0;leg<3;leg++){
     r.state.racePhase='racing';const track=r.currentTrack();for(const p of r.state.players.values())Object.assign(p,{x:(track.staging.minX+track.staging.maxX)/2+(p.color%4-1.5)*1.5,z:track.finishZ-5-Math.floor(p.color/4)*2,checkpoint:track.gates.length+1,finishCrossed:true,legSpills:p.color,lastInput:0});r.tick(1/30);
     if(leg<2){assert.equal(r.state.racePhase,'intermission');r.beginSecondLeg();}
    }
    r.partyTick(Date.now());assert.equal(r.index,1);assert.equal(r.results[0].entries.length,count);assert.ok(r.results[0].entries.every(e=>e.eligible));
    r.earliest=0;r.continueParty();
    if(count%2)r.partyTick(r.deadline+1);else{assert.equal(r.state.teams.length,count/2);for(const t of r.state.teams){t.delivered=true;t.finishTime=10;}r.state.racePhase='results';r.partyTick(Date.now());}
    r.earliest=0;r.continueParty();assert.equal(r.partyPhase,'playing');for(const t of r.trivia!.scores.values())t.score=1000;r.trivia!.phase='podium';r.partyTick(Date.now());
    r.publishParty();await until(()=>clients.every(c=>views.get(c)?.phase==='final'));const podium=views.get(a).podium;
    assert.equal(podium.ranking.length,count);for(const c of clients){assert.equal(c.state.code,code);assert.equal(c.roomId,a.roomId);assert.deepEqual(views.get(c).podium,podium);}
    assert.equal(r.results.filter(x=>x.skipped).length,count%2?1:0);
   }finally{await Promise.allSettled(clients.filter(c=>c.connection.isOpen).map(c=>c.leave()));}
  }
 }finally{await server.gracefullyShutdown(false);}
});
