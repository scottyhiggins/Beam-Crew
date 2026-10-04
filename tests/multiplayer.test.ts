import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client, type Room } from 'colyseus.js';
const endpoint=process.env.TEST_URL;
async function until(predicate:()=>boolean,timeout=5000){const deadline=Date.now()+timeout;while(!predicate()){if(Date.now()>deadline)throw Error('State synchronization timed out');await new Promise(r=>setTimeout(r,30));}}
test('eight clients synchronize, reject invalid joins, transfer host, reconnect and replay',{skip:!endpoint,timeout:30000},async()=>{
  const client=new Client(endpoint!.replace(/^http/,'ws'));const clients:Room[]=[];
  try {
    const host=await client.create('crew',{name:'Host'});clients.push(host);await until(()=>!!host.state.code);
    const code=host.state.code;assert.match(code,/^[A-Z2-9]{5}$/);
    assert.equal((await fetch(`${endpoint}/api/rooms/ZZZZZ`)).status,404);
    const response=await fetch(`${endpoint}/api/rooms/${code}`);assert.equal(response.status,200);const {roomId}=await response.json() as {roomId:string};assert.equal(roomId,host.roomId);
    for(let i=1;i<8;i++)clients.push(await client.joinById(roomId,{name:`Worker ${i}`}));
    await until(()=>clients.every(r=>r.state.players?.size===8));
    assert.equal(new Set(Array.from(host.state.players.values(),(p:any)=>p.color)).size,8);
    await assert.rejects(()=>client.joinById(roomId,{name:'Ninth'}));
    clients[1].send('start');await new Promise(r=>setTimeout(r,150));assert.equal(host.state.phase,'lobby');
    host.send('start');await until(()=>clients.every(r=>r.state.phase==='test'));
    assert.equal((await fetch(`${endpoint}/api/rooms/${code}`)).status,409);
    const mover=clients[1],other=clients[2];const before=mover.state.players.get(mover.sessionId).x;const otherBefore=other.state.players.get(other.sessionId).x;
    const input=setInterval(()=>mover.send('input',{x:100,z:0}),30);await new Promise(r=>setTimeout(r,500));clearInterval(input);mover.send('input',{x:0,z:0});await until(()=>host.state.players.get(mover.sessionId).x>before+.5);
    assert.equal(other.state.players.get(other.sessionId).x,otherBefore);
    mover.send('input',{x:'bad',z:null});mover.send('action');await until(()=>host.state.players.get(mover.sessionId).actions===1);
    mover.send('signal','LEFT');await until(()=>other.state.players.get(mover.sessionId).signal==='LEFT');
    const token=mover.reconnectionToken,id=mover.sessionId;
    // Deliberately drop transport, preserving the room's reconnect reservation.
    mover.connection.close();await until(()=>host.state.players.get(id).connected===false);
    const resumed=await client.reconnect(token);clients[1]=resumed;await until(()=>resumed.state.players?.size===8&&host.state.players.get(id).connected);assert.equal(resumed.sessionId,id);assert.equal(resumed.state.phase,'test');
    await host.leave();await until(()=>other.state.host!==host.sessionId);const newHost=clients.find(r=>r.sessionId===other.state.host)!;assert.ok(newHost);
    newHost.send('lobby');await until(()=>clients.slice(1).every(r=>r.state.phase==='lobby'));
    const replacement=await client.joinById(roomId,{name:'Replacement'});clients.push(replacement);await until(()=>replacement.state.players?.size===8);
    newHost.send('start');await until(()=>replacement.state.phase==='test');
  } finally {await Promise.allSettled(clients.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});
