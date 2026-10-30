import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
const endpoint=process.env.TEST_URL;
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean){const end=Date.now()+8000;while(!fn()){if(Date.now()>end)throw Error('QA replay clients did not synchronize');await pause(25);}}
test('QA real clients: guest departure DNF rejects restart/reset and solo start, preserves results, then accepts teammate replay',{skip:!endpoint,timeout:25000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws')),rooms:Room[]=[];
 try{
 const host=await client.create('crew');rooms.push(host);const guest=await client.joinById(host.roomId);rooms.push(guest);await until(()=>host.state.players?.size===2);
 host.send('mode','competitive');host.send('start');await until(()=>guest.state.racePhase==='racing');host.send('action');await until(()=>host.state.players.get(host.sessionId).grip>=0);
 await guest.leave();await until(()=>host.state.racePhase==='results'&&host.state.teams[0].dnf);assert.equal(host.state.players.get(host.sessionId).grip,-1);
 const frozen=JSON.stringify(host.state.teams),resets=host.state.raceResets,elapsed=host.state.elapsed;
 host.send('restart');await until(()=>host.state.players.get(host.sessionId).feedback.startsWith('Waiting for a teammate'));
 host.send('reset');host.send('action');await pause(150);assert.equal(host.state.raceResets,resets);assert.equal(host.state.racePhase,'results');assert.equal(host.state.elapsed,elapsed);assert.equal(JSON.stringify(host.state.teams),frozen);assert.equal(host.state.teams.length,1);
 host.send('lobby');await until(()=>host.state.phase==='lobby');host.send('start');await pause(150);assert.equal(host.state.phase,'lobby');assert.equal(host.state.raceResets,resets);
 const replacement=await client.joinById(host.roomId);rooms.push(replacement);await until(()=>host.state.players.size===2);host.send('start');await until(()=>replacement.state.racePhase==='racing');assert.equal(host.state.teams.length,1);assert.equal(host.state.raceResets,resets+1);
 }finally{await Promise.allSettled(rooms.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});
test('QA real clients: host transfer and reserved disconnect count only connected workers for replay',{skip:!endpoint,timeout:25000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws')),rooms:Room[]=[];
 try{
 const host=await client.create('crew');rooms.push(host);for(let i=0;i<2;i++)rooms.push(await client.joinById(host.roomId));const next=rooms[1],third=rooms[2];await until(()=>third.state.players?.size===3);
 host.send('mode','competitive');host.send('start');await until(()=>third.state.racePhase==='racing');assert.equal(third.state.players.get(third.sessionId).team,-1);third.send('action');await pause(100);assert.equal(third.state.players.get(third.sessionId).actions,0);
 await host.leave();await until(()=>next.state.host===next.sessionId&&next.state.racePhase==='results');next.send('restart');await until(()=>third.state.racePhase==='racing');assert.equal(next.state.teams.length,1);assert.ok(third.state.players.get(third.sessionId).team>=0);
 const id=next.sessionId,token=next.reconnectionToken;next.connection.close();await until(()=>third.state.host===third.sessionId&&!third.state.players.get(id).connected);const resets=third.state.raceResets;
 third.send('restart');await until(()=>third.state.players.get(third.sessionId).feedback.startsWith('Waiting for a teammate'));assert.equal(third.state.raceResets,resets);assert.equal(third.state.teams.length,1);
 const resumed=await client.reconnect(token);rooms.push(resumed);await until(()=>third.state.players.get(id).connected);third.send('restart');await until(()=>resumed.state.raceResets===resets+1);assert.equal(resumed.state.teams.length,1);assert.deepEqual([...resumed.state.players.values()].map((p:any)=>p.end).sort((a:number,b:number)=>a-b),[0,7]);
 }finally{await Promise.allSettled(rooms.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});
