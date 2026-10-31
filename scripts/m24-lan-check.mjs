import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Client} from 'colyseus.js';
const origin='http://192.168.1.166:2724';
const health=await (await fetch(origin+'/health')).json();
assert.equal(health.protocol,21);
assert.ok(health.repository.includes('Beam-Crew-m24-release-candidate'));
assert.equal((await fetch(origin)).status,200);
const client=new Client(origin.replace('http','ws'));
let host,guest;
try {
 host=await client.create('crew',{name:'M24 LAN host'});
 guest=await client.joinById(host.roomId,{name:'M24 LAN guest'});
 const deadline=Date.now()+7000;
 while(host.state.players?.size!==2||guest.state.players?.size!==2){
  if(Date.now()>deadline)throw Error('LAN state synchronization timeout');
  await new Promise(r=>setTimeout(r,25));
 }
 const result={status:'PASS',origin,socket:origin.replace('http','ws'),health,clients:2,checkedAt:new Date().toISOString()};
 fs.writeFileSync('qa/m24/lan-check.json',JSON.stringify(result,null,2));
 console.log('PASS LAN HTTP, Protocol 21, candidate identity and two synchronized WebSocket clients');
} finally {await guest?.leave();await host?.leave();}
