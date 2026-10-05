import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
import {WHEEL_COURSE} from '../shared/wheelbarrow.js';
const endpoint=process.env.TEST_URL;
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean,timeout=7000){const end=Date.now()+timeout;while(!fn()){if(Date.now()>end)throw Error('Wheelbarrow synchronization timeout');await pause(25);}}
test('two racers synchronize countdown, independent carts, reconnect, finish and host replay',{skip:!endpoint,timeout:65000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws'));let host:Room|undefined,guest:Room|undefined,timer:ReturnType<typeof setInterval>|undefined;
 try{
  host=await client.create('crew',{name:'Cart host'});guest=await client.joinById(host.roomId,{name:'Cart guest'});
  await until(()=>host!.state.players.size===2);guest.send('mode','wheel');await pause(120);assert.equal(host.state.mode,'beam');
  host.send('mode','wheel');await until(()=>guest!.state.mode==='wheel');host.send('start');await until(()=>guest!.state.racePhase==='countdown');
  const hx=host.state.players.get(host.sessionId).x,gx=host.state.players.get(guest.sessionId).x;assert.notEqual(hx,gx);
  host.send('input',{x:1,z:0});await pause(250);assert.equal(host.state.players.get(host.sessionId).x,hx);
  guest.send('restart');await pause(100);assert.equal(host.state.raceResets,1);
  await until(()=>guest!.state.racePhase==='racing');
  const id=guest.sessionId,token=guest.reconnectionToken;guest.connection.close();await until(()=>!host!.state.players.get(id).connected);guest=await client.reconnect(token);await until(()=>host!.state.players.get(id).connected);assert.equal(guest.sessionId,id);
  timer=setInterval(()=>{const p=host!.state.players.get(host!.sessionId),target=WHEEL_COURSE[Math.min(p.checkpoint,WHEEL_COURSE.length-1)],dx=target.x-p.x,dz=(p.checkpoint===WHEEL_COURSE.length?-20:target.z)-p.z,len=Math.hypot(dx,dz);host!.send('input',{x:dx/len*.55,z:dz/len*.55});},30);
  await until(()=>guest!.state.players.get(host!.sessionId).finishOrder===1,35000);
  clearInterval(timer);timer=undefined;
  const winner=guest.state.players.get(host.sessionId);assert.ok(winner.finishTime>0);assert.equal(winner.spills,0);assert.equal(guest.state.players.get(id).finishOrder,0);assert.equal(guest.state.players.get(id).z,7);
  assert.equal(guest.state.results.length,1);assert.equal(guest.state.results[0].place,1);
  timer=setInterval(()=>{const p=guest!.state.players.get(id),target=WHEEL_COURSE[Math.min(p.checkpoint,WHEEL_COURSE.length-1)],dx=target.x-p.x,dz=(p.checkpoint===WHEEL_COURSE.length?-20:target.z)-p.z,len=Math.hypot(dx,dz);guest!.send('input',{x:dx/len*.55,z:dz/len*.55});},30);
  await until(()=>host!.state.racePhase==='results',35000);clearInterval(timer);timer=undefined;
  assert.equal(host.state.results.length,2);assert.equal(host.state.players.get(id).finishOrder,2);assert.ok(host.state.results[1].time>host.state.results[0].time);
  host.send('restart');await until(()=>guest!.state.raceResets===2);assert.equal(guest.state.racePhase,'countdown');assert.equal(guest.state.players.get(host.sessionId).finishOrder,0);assert.equal(guest.state.elapsed,0);assert.equal(guest.state.results.length,0);
  host.send('lobby');await until(()=>guest!.state.phase==='lobby');host.send('mode','beam');await until(()=>guest!.state.mode==='beam');host.send('start');await until(()=>guest!.state.phase==='test');assert.equal(guest.state.beam.z,6);
 }finally{if(timer)clearInterval(timer);await Promise.allSettled([host,guest].filter((r):r is Room=>!!r&&r.connection.isOpen).map(r=>r.leave()));}
});
