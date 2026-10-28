import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
import {planSpills} from '../client/spill-plan.js';
import {MATERIAL_PIECE_COUNTS} from '../client/load-visual.js';
import {WHEEL_COURSE} from '../shared/wheelbarrow.js';
const endpoint=process.env.TEST_URL;
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(check:()=>boolean,timeout=12000){const end=Date.now()+timeout;while(!check()){if(Date.now()>end)throw Error('Material quantity synchronization timeout');await pause(30);}}

test('all 12 materials spill once across two real clients with identical one-load presentation', {skip:!endpoint,timeout:240000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws'));let host:Room|undefined,guest:Room|undefined,timer:ReturnType<typeof setInterval>|undefined;
 const snapshot=(r:Room)=>Array.from(r.state.material as Iterable<any>,b=>({materialId:b.materialId,amount:b.amount}));
 try{
  host=await client.create('crew',{name:'Quantity host'});guest=await client.joinById(host.roomId,{name:'Quantity guest'});
  await until(()=>host!.state.players?.size===2&&guest!.state.players?.size===2);
  host.send('mode','wheel');await until(()=>guest!.state.mode==='wheel');
  for(let id=0;id<12;id++){
   host.send('material',id);guest.send('material',id);
   await until(()=>host!.state.players.get(host!.sessionId).materialId===id&&host!.state.players.get(guest!.sessionId).materialId===id);
   const reset=host.state.raceResets;
   host.send('start');await until(()=>host!.state.raceResets>reset&&guest!.state.raceResets>reset&&host!.state.material.length===0&&guest!.state.material.length===0);
   await until(()=>host!.state.racePhase==='racing'&&guest!.state.racePhase==='racing');
   let gate=1;
   timer=setInterval(()=>{const p=host!.state.players.get(host!.sessionId);if(p.spills>0){host!.send('input',{x:0,z:0});return;}
    let goal=WHEEL_COURSE[gate];if(Math.hypot(goal.x-p.x,goal.z-p.z)<.35&&gate<WHEEL_COURSE.length-1)goal=WHEEL_COURSE[++gate];
    const x=goal.x-p.x,z=goal.z-p.z,n=Math.hypot(x,z)||1;host!.send('input',{x:x/n,z:z/n});
   },30);
   await until(()=>host!.state.players.get(host!.sessionId).spills===1);
   clearInterval(timer);timer=undefined;host.send('input',{x:0,z:0});guest.send('input',{x:0,z:0});
   await until(()=>host!.state.material.length===6&&guest!.state.material.length===6&&JSON.stringify(snapshot(host!))===JSON.stringify(snapshot(guest!)));
   const hp=planSpills(snapshot(host)),gp=planSpills(snapshot(guest));assert.deepEqual(hp,gp);
   for(const materialId of [id]){
    const parts=hp.filter(p=>p.id===materialId);assert.equal(parts.length,6,JSON.stringify({expected:materialId,records:snapshot(host!),plans:hp,chosen:host!.state.players.get(host!.sessionId).materialId}));
    if(materialId<2)assert.ok(Math.abs(parts.reduce((n,p)=>n+p.volume,0)-1)<1e-9);
    else assert.equal(parts.reduce((n,p)=>n+p.pieces,0),MATERIAL_PIECE_COUNTS[materialId]);
   }
   if(id===11){
    await until(()=>host!.state.players.get(host!.sessionId).reload===0);assert.equal(host.state.material.length,6);
    const token:string=guest.reconnectionToken;guest.connection.close();await until(()=>!host!.state.players.get(guest!.sessionId).connected);guest=await client.reconnect(token);await until(()=>guest!.state.material?.length===6);assert.deepEqual(planSpills(snapshot(guest)),hp);
   }
   host.send('lobby');await until(()=>host!.state.phase==='lobby'&&guest!.state.phase==='lobby');
  }
 }finally{if(timer)clearInterval(timer);await Promise.allSettled([host,guest].filter((r):r is Room=>!!r&&r.connection.isOpen).map(r=>r.leave()));}
});
