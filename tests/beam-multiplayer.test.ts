import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
const endpoint=process.env.TEST_URL;
async function until(predicate:()=>boolean,timeout=6000){const end=Date.now()+timeout;while(!predicate()){if(Date.now()>end)throw Error('Beam synchronization timed out');await new Promise(r=>setTimeout(r,25));}}
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const beamView=(r:Room)=>{const b=r.state.beam;return [b.x,b.z,b.angle,b.leftSupported,b.rightSupported,b.checkpoint,b.delivered,b.resets];};
test('two clients carry, release, reject non-host reset, reconnect, complete and replay the course',{skip:!endpoint,timeout:60000},async()=>{
  const client=new Client(endpoint!.replace(/^http/,'ws'));let host:Room|undefined,guest:Room|undefined;
  let inputTimer:ReturnType<typeof setInterval>|undefined;
  let hx=0,hz=0,gx=0,gz=0;
  try{
    host=await client.create('crew',{name:'Beam host'});guest=await client.joinById(host.roomId,{name:'Beam guest'});
    await until(()=>host!.state.players.size===2&&guest!.state.players.size===2);
    host.send('start');await until(()=>guest!.state.phase==='test');
    host.send('action');guest.send('action');
    await until(()=>host!.state.players.get(host!.sessionId).grip===0&&host!.state.players.get(guest!.sessionId).grip===7);
    await until(()=>guest!.state.beam.leftSupported&&guest!.state.beam.rightSupported);
    const resetCount=host.state.beam.resets;guest.send('reset');guest.send('restart');await pause(200);assert.equal(host.state.beam.resets,resetCount);
    inputTimer=setInterval(()=>{host!.send('input',{x:hx,z:hz});if(guest?.connection.isOpen)guest.send('input',{x:gx,z:gz});},30);
    hz=gz=-1;await until(()=>host!.state.beam.z<5);
    hx=hz=gx=gz=0;await pause(700);
    // Every peer receives the same authoritative pose, rather than simulating its own beam.
    await until(()=>JSON.stringify(beamView(host!))===JSON.stringify(beamView(guest!)));
    guest.send('action');await until(()=>host!.state.players.get(guest!.sessionId).grip===-1&&!host!.state.beam.rightSupported);
    await until(()=>guest!.state.beam.rightHeight<.4);assert.ok(host.state.beam.leftHeight>.9);
    await pause(230);guest.send('action');await until(()=>host!.state.players.get(guest!.sessionId).grip===7);
    const token=guest.reconnectionToken,id=guest.sessionId;guest.connection.close();await until(()=>!host!.state.players.get(id).connected);
    assert.equal(host.state.players.get(id).grip,-1);await until(()=>!host!.state.beam.rightSupported);
    guest=await client.reconnect(token);await until(()=>host!.state.players.get(id).connected);assert.equal(guest.sessionId,id);assert.equal(guest.state.players.get(id).grip,-1);
    host.send('restart');await until(()=>host!.state.beam.resets===resetCount+1&&guest!.state.beam.resets===resetCount+1);
    assert.equal(host.state.players.get(host.sessionId).grip,-1);assert.equal(host.state.players.get(id).grip,-1);
    await pause(230);host.send('action');guest.send('action');await until(()=>host!.state.players.get(host!.sessionId).grip===0&&guest!.state.players.get(id).grip===7);
    hz=gz=-1;await until(()=>host!.state.beam.z<=-6.1,12000);hx=hz=gx=gz=0;await pause(800);
    assert.equal(guest.state.beam.checkpoint,true);
    hx=-1;gx=1;await until(()=>host!.state.beam.angle<.05,12000);hx=hz=gx=gz=0;await pause(800);
    hx=gx=1;await until(()=>host!.state.beam.delivered,12000);hx=hz=gx=gz=0;
    await until(()=>guest!.state.beam.delivered);assert.deepEqual(beamView(guest),beamView(host));
    // A checkpoint reset recovers the doorway, while restart returns to the start.
    host.send('reset');await until(()=>guest!.state.beam.resets===resetCount+2);assert.equal(guest.state.beam.checkpoint,true);assert.equal(guest.state.beam.delivered,false);assert.ok(Math.abs(guest.state.beam.z+3.8)<1e-5);
    await pause(1100);host.send('restart');await until(()=>guest!.state.beam.resets===resetCount+3);assert.equal(guest.state.beam.checkpoint,false);assert.equal(guest.state.beam.z,6);
  }finally{if(inputTimer)clearInterval(inputTimer);await Promise.allSettled([host,guest].filter((r):r is Room=>!!r&&r.connection.isOpen).map(r=>r.leave()));}
});
