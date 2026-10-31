import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
import {assembleRoute,type CourseInstance} from '../shared/course-modules.js';
const endpoint=process.env.TEST_URL;
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean,timeout=10000){const end=Date.now()+timeout;while(!fn()){if(Date.now()>end)throw Error('Expanded Championship synchronization timeout');await pause(30);}}
for(const count of [3,5,10])test(count+' randomized legs synchronize on two clients through every countdown, reconnect, immutable ledger and replay',{skip:!endpoint,timeout:600000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws'));let a:Room|undefined,b:Room|undefined,timer:ReturnType<typeof setInterval>|undefined,route:CourseInstance[]=[];
 const indices=new Map<string,{leg:number;i:number}>();
 function drive(room:Room){const s=room.state,p=s.players?.get(room.sessionId);if(!p||!route[s.leg])return;const c=route[s.leg];let goal;
  if(p.finishOrder)goal={x:c.exit.x,z:c.track.finishZ-10};
  else{let current=indices.get(room.sessionId);if(!current||current.leg!==s.leg){current={leg:s.leg,i:s.leg===0?1:0};indices.set(room.sessionId,current);}goal=c.drivePath[current.i];if(Math.hypot(p.x-goal.x,p.z-goal.z)<.4&&current.i<c.drivePath.length-1)goal=c.drivePath[++current.i];}
  const dx=goal.x-p.x,dz=goal.z-p.z,len=Math.hypot(dx,dz);room.send('input',len<.15?{x:0,z:0}:{x:dx/len*.5,z:dz/len*.5});
 }
 try{
  a=await client.create('crew',{name:'Route host'});b=await client.joinById(a.roomId,{name:'Route guest'});await until(()=>a!.state.players?.size===2&&b!.state.players?.size===2);
  b.send('championshipLength',5);await pause(150);assert.equal(a.state.championshipLength,3);a.send('mode','championship');a.send('championshipLength',count);await until(()=>b!.state.championshipLength===count);a.send('championshipLength',11);await pause(150);assert.equal(b.state.championshipLength,count);
  a.send('material',3);b.send('material',8);await until(()=>a!.state.players.get(b!.sessionId).materialId===8&&b!.state.players.get(a!.sessionId).materialId===3);a.send('start');await until(()=>a!.state.routeIds?.length===count&&b!.state.routeIds?.length===count);const ids=[...a.state.routeIds];assert.equal(new Set(ids).size,count);assert.deepEqual([...b.state.routeIds],ids);route=assembleRoute(ids);
  b.send('championshipLength',2);a.send('championshipLength',2);b.send('material',0);await until(()=>a!.state.racePhase==='racing');assert.equal(b.state.championshipLength,count);assert.equal(b.state.players.get(b.sessionId).materialId,8);
  timer=setInterval(()=>{if(a?.connection.isOpen)drive(a);if(b?.connection.isOpen)drive(b);},30);
  let prior='';
  for(let leg=0;leg<count;leg++){
   await until(()=>a!.state.legResults.length>=(leg+1)*2,85000);assert.equal(a.state.leg,leg);const thisLeg:any[]=Array.from(a.state.legResults as Iterable<any>).filter(r=>r.leg===leg);assert.equal(thisLeg.length,2);assert.ok(thisLeg.every(r=>r.time>0&&!r.dnf));
   if(prior)assert.equal(JSON.stringify(Array.from(a.state.legResults as Iterable<any>).filter(r=>r.leg<leg).map(r=>[r.playerId,r.leg,r.spills,r.time,r.finishOrder])),prior);
   prior=JSON.stringify(Array.from(a.state.legResults as Iterable<any>).map(r=>[r.playerId,r.leg,r.spills,r.time,r.finishOrder]));
   if(leg<count-1){await until(()=>a!.state.racePhase==='intermission');const time=Date.now();assert.ok(a.state.countdown>4.6);
    if(leg===0){const token:string=b.reconnectionToken,id:string=b.sessionId;b.connection.close();await until(()=>!a!.state.players.get(id).connected);b=await client.reconnect(token);await until(()=>b!.state.players?.get(id)?.connected&&b!.state.routeIds?.length===count);assert.deepEqual([...b.state.routeIds],ids);}
    await until(()=>a!.state.leg===leg+1);assert.ok(Date.now()-time>=4600);assert.deepEqual([...a.state.routeIds],ids);assert.ok(a.state.players.get(a.sessionId).z>route[leg].exit.z-2);assert.ok(a.state.players.get(a.sessionId).z<route[leg].track.finishZ+2);
   }
  }
  await until(()=>a!.state.racePhase==='results'&&b!.state.racePhase==='results'&&b!.state.legResults.length===count*2);
  const totals=(r:Room)=>Array.from(r.state.standings,(p:any)=>[p.playerId,p.spills,p.time,p.place,p.completed,p.dnf]);assert.deepEqual(totals(a),totals(b));assert.ok([...a.state.standings].every(r=>r.completed===count&&!r.dnf));const final=JSON.stringify(totals(a)),elapsed=a.state.elapsed;await pause(250);assert.equal(JSON.stringify(totals(a)),final);assert.equal(a.state.elapsed,elapsed);
  const host=a.state.host===a.sessionId?a:b;host.send('restart');await until(()=>a!.state.raceResets===2&&b!.state.raceResets===2);assert.equal(a.state.leg,0);assert.equal(a.state.legResults.length,0);assert.equal(a.state.routeIds.length,count);assert.equal(a.state.players.get(a.sessionId).materialId,3);assert.equal(b.state.players.get(b.sessionId).materialId,8);
  host.send('lobby');await until(()=>a!.state.phase==='lobby');host.send('championshipLength',2);await pause(200);assert.equal(b.state.championshipLength,count);host.send('start');await until(()=>b!.state.phase==='test'&&b!.state.racePhase==='countdown');assert.equal(b.state.routeIds.length,count);
 }catch(error){throw new Error(String(error)+' | '+JSON.stringify(a?{leg:a.state.leg,phase:a.state.racePhase,route:[...a.state.routeIds],players:Array.from(a.state.players.values(),(p:any)=>[p.x,p.z,p.checkpoint,p.finishOrder])}:{}));}
 finally{if(timer)clearInterval(timer);await Promise.allSettled([a,b].filter((r):r is Room=>!!r&&r.connection.isOpen).map(r=>r.leave()));}
});
