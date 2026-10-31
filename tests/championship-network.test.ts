import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
import {WHEEL_COURSE} from '../shared/wheelbarrow.js';
import {assembleRoute} from '../shared/course-modules.js';
const endpoint=process.env.TEST_URL;
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean,timeout=8000){const end=Date.now()+timeout;while(!fn()){if(Date.now()>end)throw Error('Championship network timeout');await pause(20);}}
test('two real clients race three randomized courses, reconnect during countdown and Course 2, retain materials and frozen ledgers, replay and switch modes',{skip:!endpoint,timeout:180000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws'));let host:Room|undefined,guest:Room|undefined,timer:ReturnType<typeof setInterval>|undefined;
 const indices=new Map<string,{leg:number;i:number}>();
 function drive(r:Room,throttle:number){const s=r.state,p=s.players?.get(r.sessionId);if(!p||s.phase!=='test')return;const course=assembleRoute([...s.routeIds])[s.leg];if(!course)return;if(p.finishOrder){r.send('input',{x:0,z:p.z>course.track.finishZ-10?-.35:0});return;}const leg=s.leg,path=course.drivePath;let at=indices.get(r.sessionId);if(!at||at.leg!==leg){at={leg,i:leg===0?1:0};indices.set(r.sessionId,at);}let goal=path[at.i];if(Math.hypot(goal.x-p.x,goal.z-p.z)<.4&&at.i<path.length-1)goal=path[++at.i];const dx=goal.x-p.x,dz=goal.z-p.z,n=Math.hypot(dx,dz)||1;r.send('input',{x:dx/n*throttle,z:dz/n*throttle});}
 try{
  host=await client.create('crew',{name:'Champ host'});guest=await client.joinById(host.roomId,{name:'Champ guest'});await until(()=>host!.state.players?.size===2&&guest!.state.players?.size===2);
  guest.send('mode','wheel');await pause(100);assert.equal(host.state.mode,'championship');host.send('mode','championship');host.send('championshipLength',3);await until(()=>guest!.state.mode==='championship');host.send('material',2);guest.send('material',9);await until(()=>host!.state.players.get(guest!.sessionId).materialId===9&&guest!.state.players.get(host!.sessionId).materialId===2);
  host.send('start');await until(()=>guest!.state.racePhase==='countdown');guest.send('material',0);await until(()=>host!.state.racePhase==='racing');assert.equal(host.state.players.get(guest.sessionId).materialId,9);
  timer=setInterval(()=>{if(host?.connection.isOpen)drive(host,.55);if(guest?.connection.isOpen)drive(guest,.5);},30);
  await until(()=>host!.state.legResults?.length>=1,50000);assert.equal(host.state.leg,0);const first=host.state.legResults[0],firstSnapshot=JSON.stringify([first.playerId,first.spills,first.time,first.finishOrder]);
  await until(()=>host!.state.racePhase==='intermission',16000);const countdownStart=Date.now();assert.ok(host.state.countdown>4.7);assert.equal(host.state.legResults.length,2);const frozen=host.state.elapsed;
  const gid=guest.sessionId,token=guest.reconnectionToken;guest.connection.close();await until(()=>!host!.state.players.get(gid).connected);guest=await client.reconnect(token);await until(()=>guest!.state.players?.has(gid)&&host!.state.players.get(gid).connected);assert.equal(guest.sessionId,gid);assert.equal(guest.state.legResults.length,2);
  await until(()=>host!.state.leg===1);assert.ok(Date.now()-countdownStart>=4700);assert.ok(host.state.elapsed<.2);assert.ok(frozen>0);await until(()=>guest!.state.leg===1);assert.equal(guest.state.players.get(gid).materialId,9);assert.equal(host.state.players.get(host.sessionId).materialId,2);const prior=assembleRoute([...host.state.routeIds])[0].track;assert.ok(host.state.players.get(gid).z<prior.finishZ);assert.ok(host.state.players.get(gid).z>prior.staging.minZ);
  const htoken=host.reconnectionToken,hid=host.sessionId;host.connection.close();await until(()=>!guest!.state.players.get(hid).connected);host=await client.reconnect(htoken);await until(()=>host!.state.leg===1&&host!.state.players?.get(hid)?.connected);assert.equal(host.sessionId,hid);assert.equal(host.state.players.get(hid).materialId,2);
  await until(()=>host!.state.racePhase==='results'&&guest!.state.racePhase==='results',150000);clearInterval(timer);timer=undefined;await until(()=>host!.state.legResults.length===6&&guest!.state.legResults.length===6);
  assert.equal(JSON.stringify([host.state.legResults[0].playerId,host.state.legResults[0].spills,host.state.legResults[0].time,host.state.legResults[0].finishOrder]),firstSnapshot);
  const totals=(r:Room)=>Array.from(r.state.standings,(p:any)=>[p.playerId,p.spills,p.time,p.place,p.completed,p.dnf]);assert.deepEqual(totals(host),totals(guest));for(const r of host.state.standings){const legs:any[]=Array.from(host.state.legResults as Iterable<any>).filter(p=>p.playerId===r.playerId);assert.equal(r.spills,legs.reduce((n:number,p:any)=>n+p.spills,0));assert.ok(Math.abs(r.time-legs.reduce((n:number,p:any)=>n+p.time,0))<.001,'wire-rounded times add to within one millisecond');assert.equal(r.completed,3);assert.equal(r.dnf,false);}
  const final=JSON.stringify(totals(host)),elapsed=host.state.elapsed;await pause(200);assert.equal(JSON.stringify(totals(host)),final);assert.equal(host.state.elapsed,elapsed);
  const currentHost=host.state.host===host.sessionId?host:guest;currentHost.send('restart');await until(()=>host!.state.raceResets===2&&guest!.state.raceResets===2);assert.equal(host.state.leg,0);assert.equal(host.state.legResults.length,0);assert.equal(host.state.material.length,0);assert.equal(host.state.players.get(gid).materialId,9);
  currentHost.send('lobby');await until(()=>host!.state.phase==='lobby');currentHost.send('mode','wheel');await until(()=>guest!.state.mode==='wheel');currentHost.send('start');await until(()=>guest!.state.phase==='test');assert.equal(guest.state.mode,'wheel');
 }finally{if(timer)clearInterval(timer);await Promise.allSettled([host,guest].filter((r):r is Room=>!!r&&r.connection.isOpen).map(r=>r.leave()));}
});
