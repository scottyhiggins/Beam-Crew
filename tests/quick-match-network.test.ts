import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Client,type Room} from 'colyseus.js';
const endpoint=process.env.TEST_URL;
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean,timeout=8000){const end=Date.now()+timeout;while(!fn()){if(Date.now()>end)throw Error('Quick Match state timeout');await pause(20);}}
test('real sockets: public/private separation, concurrent capacity, cancellation, countdown, reconnect and replay',{skip:!endpoint,timeout:50000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws')),rooms:Room[]=[];
 const join=async(key=randomUUID())=>{const room=await client.joinOrCreate('wheel_public',{name:'Public worker',matchKey:key});rooms.push(room);return room;};
 try{
 const privateRoom=await client.create('crew',{name:'Private host'});rooms.push(privateRoom);
 const key=randomUUID(),first=await join(key);await until(()=>first.state.players?.size===1);
 assert.notEqual(first.roomId,privateRoom.roomId);assert.equal(first.state.code,'');assert.equal(first.state.host,'');assert.equal(first.state.championshipLength,3);
 await assert.rejects(()=>client.joinById(first.roomId,{matchKey:key}),/Already assigned/);
 const others=await Promise.all(Array.from({length:7},()=>join()));
 assert.ok(others.every(r=>r.roomId===first.roomId));await until(()=>first.state.players.size===8);
 await assert.rejects(()=>client.joinById(first.roomId,{matchKey:randomUUID()}));
 const ninth=await join();assert.notEqual(ninth.roomId,first.roomId);await ninth.leave();await until(()=>!ninth.connection.isOpen);
 assert.equal(privateRoom.state.players.size,1);const hidden=await fetch(endpoint+'/api/rooms/'+first.state.code);assert.equal(hidden.status,404);
 first.send('mode','competitive');first.send('championshipLength',10);first.send('start');await pause(150);assert.equal(first.state.phase,'lobby');assert.equal(first.state.mode,'championship');assert.equal(first.state.championshipLength,3);
 for(const r of others)await r.leave();await until(()=>first.state.players.size===1&&first.state.matchCountdown===0);
 const secondKey=randomUUID(),second=await join(secondKey);assert.equal(second.roomId,first.roomId);await until(()=>first.state.matchCountdown>0);
 const droppedId=second.sessionId;second.connection.close();await until(()=>!first.state.players.has(droppedId)&&first.state.matchCountdown===0);
 const replacement=await join(secondKey);assert.equal(replacement.roomId,first.roomId);
 await until(()=>first.state.matchCountdown>0);const started=Date.now();
 await until(()=>first.state.phase==='test'&&replacement.state.phase==='test',18000);assert.ok(Date.now()-started>=14000);assert.equal(first.state.routeIds.length,3);
 const token=replacement.reconnectionToken,id=replacement.sessionId;replacement.connection.close();await until(()=>!first.state.players.get(id).connected);
 const resumed=await client.reconnect(token);rooms.push(resumed);await until(()=>first.state.players.get(id).connected&&resumed.state.players?.has(id));assert.equal(resumed.sessionId,id);
 const late=await join();assert.notEqual(late.roomId,first.roomId);await late.leave();
 await resumed.leave();await first.leave();const replay=await join(key);assert.notEqual(replay.roomId,first.roomId);await until(()=>replay.state.phase==='lobby');
 }finally{await Promise.allSettled(rooms.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});
