import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
const endpoint=process.env.TEST_URL;
async function until(predicate:()=>boolean,timeout=6000){const end=Date.now()+timeout;while(!predicate()){if(Date.now()>end)throw Error('Beam synchronization timed out after '+timeout+'ms: '+predicate.toString());await new Promise(r=>setTimeout(r,25));}}
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const beamView=(r:Room)=>{const b=r.state.teams[0];return [b.x,b.z,b.angle,b.leftSupported,b.rightSupported,b.checkpoint,b.delivered,b.resets];};
test('two clients carry, release, reject non-host reset, reconnect, complete and replay the course',{skip:!endpoint,timeout:140000},async()=>{
  const client=new Client(endpoint!.replace(/^http/,'ws'));let host:Room|undefined,guest:Room|undefined;
  let inputTimer:ReturnType<typeof setInterval>|undefined;
  let hx=0,hz=0,gx=0,gz=0;let approaching=false,turning=false;
  try{
    host=await client.create('crew',{name:'Beam host'});guest=await client.joinById(host.roomId,{name:'Beam guest'});
    await until(()=>host!.state.players?.size===2&&guest!.state.players?.size===2);
    host.send('mode','competitive');host.send('start');await until(()=>guest!.state.racePhase==='racing');
    host.send('action');guest.send('action');
    await until(()=>host!.state.players.get(host!.sessionId).grip===0&&host!.state.players.get(guest!.sessionId).grip===7);
    await until(()=>guest!.state.teams[0].leftSupported&&guest!.state.teams[0].rightSupported);
    const resetCount=host.state.teams[0].resets;guest.send('reset');guest.send('restart');await pause(200);assert.equal(host.state.teams[0].resets,resetCount);
    inputTimer=setInterval(()=>{const b=host!.state.teams[0];if(approaching)hz=gz=-Math.min(1,Math.max(.08,(b.z+6.1)*1.5));if(turning){hx=-Math.min(1,Math.max(.05,b.angle*2));gx=-hx;}host!.send('input',{x:hx,z:hz});if(guest?.connection.isOpen)guest.send('input',{x:gx,z:gz});},30);
    hz=gz=-1;await until(()=>host!.state.teams[0].z<5);
    hx=hz=gx=gz=0;await pause(700);
    // Every peer receives the same authoritative pose, rather than simulating its own beam.
    await until(()=>JSON.stringify(beamView(host!))===JSON.stringify(beamView(guest!)));
    guest.send('action');await until(()=>host!.state.players.get(guest!.sessionId).grip===-1&&!host!.state.teams[0].rightSupported);
    await until(()=>guest!.state.teams[0].rightHeight<.4);assert.ok(host.state.teams[0].leftHeight>.9);
    await pause(230);guest.send('action');await until(()=>host!.state.players.get(guest!.sessionId).grip===7);
    const token=guest.reconnectionToken,id=guest.sessionId;guest.connection.close();await until(()=>!host!.state.players.get(id).connected);
    assert.equal(host.state.players.get(id).grip,-1);await until(()=>!host!.state.teams[0].rightSupported);
    guest=await client.reconnect(token);await until(()=>host!.state.players.get(id).connected&&guest!.state.players?.has(id));assert.equal(guest.sessionId,id);assert.equal(guest.state.players.get(id).grip,-1);
    host.send('restart');await until(()=>host!.state.teams[0].resets===resetCount+1&&guest!.state.teams[0].resets===resetCount+1);
    assert.equal(host.state.players.get(host.sessionId).grip,-1);assert.equal(host.state.players.get(id).grip,-1);
    await until(()=>guest!.state.racePhase==='racing');await pause(230);host.send('action');guest.send('action');await until(()=>host!.state.players.get(host!.sessionId).grip===0&&guest!.state.players.get(id).grip===7);
    approaching=true;hz=gz=-1;await until(()=>host!.state.teams[0].z<=-6.05,15000);approaching=false;hx=hz=gx=gz=0;await pause(800);
    assert.equal(guest.state.teams[0].checkpoint,true);
    turning=true;hx=-1;gx=1;await until(()=>host!.state.teams[0].angle<.05,15000);turning=false;hx=hz=gx=gz=0;await pause(800);
    // Solid loads require steering back onto the corridor after contact.
    const steering=setInterval(()=>{const b=host!.state.teams[0],target=b.x<21?-6.65:-7.5;hx=gx=Math.max(-1,Math.min(1,(26-b.x)*2));hz=gz=Math.max(-1,Math.min(1,(target-b.z)*2));
      if(b.protection===0){for(const r of [host!,guest!])if(r.state.players.get(r.sessionId)?.grip<0)r.send('action');}
    },100);
    try{await until(()=>host!.state.teams[0].delivered,80000);}finally{clearInterval(steering);hx=hz=gx=gz=0;}
    const deliveredResets=host.state.teams[0].resets;
    await until(()=>guest!.state.teams[0].delivered);assert.deepEqual(beamView(guest),beamView(host));
    // Pair races restart from the same fair starting line for both workers.
    host.send('reset');await until(()=>guest!.state.teams[0].resets===deliveredResets+1);assert.equal(guest.state.teams[0].checkpoint,false);assert.equal(guest.state.teams[0].delivered,false);assert.equal(guest.state.teams[0].z,6);
    await pause(1100);host.send('restart');await until(()=>guest!.state.teams[0].resets===deliveredResets+2);assert.equal(guest.state.teams[0].checkpoint,false);assert.equal(guest.state.teams[0].z,6);
  }catch(error){console.error('Beam diagnostic',JSON.stringify({host:host?.state?.toJSON?.(),guest:guest?.state?.toJSON?.(),hx,hz,gx,gz,approaching,turning}));throw error;}finally{if(inputTimer)clearInterval(inputTimer);await Promise.allSettled([host,guest].filter((r):r is Room=>!!r&&r.connection.isOpen).map(r=>r.leave()));}
});
