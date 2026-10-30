import assert from 'node:assert/strict';
import {Client} from 'colyseus.js';
import {PROTOCOL_VERSION} from '../build/shared/version.js';
const url=new URL(process.argv[2]??'');assert.equal(url.protocol,'https:','Supply the real HTTPS public play URL');
const response=await fetch(new URL('/health',url),{signal:AbortSignal.timeout(90000)});assert.equal(response.status,200);const health=await response.json();assert.equal(health.protocol,PROTOCOL_VERSION);assert.match(health.build,/BREAK TIME/);
const page=await fetch(url);assert.equal(page.status,200);assert.match(await page.text(),/BREAK TIME/);
const client=new Client(url.origin.replace('https:','wss:')),rooms=[];
async function until(check){const end=Date.now()+12000;while(!check()){if(Date.now()>end)throw Error('Public multiplayer state timeout');await new Promise(r=>setTimeout(r,50));}}
try{const host=await client.create('crew',{name:'Public smoke host'});rooms.push(host);await until(()=>!!host.state.code);const lookup=await fetch(new URL('/api/rooms/'+host.state.code,url));assert.equal(lookup.status,200);const found=await lookup.json();const guest=await client.joinById(found.roomId,{name:'Public smoke guest'});rooms.push(guest);await until(()=>guest.state.players?.size===2);
 host.send('mode','competitive');host.send('start');await until(()=>guest.state.racePhase==='racing');assert.equal(guest.state.teams.length,1);host.send('action');guest.send('action');await until(()=>guest.state.players.get(host.sessionId).grip===0&&guest.state.players.get(guest.sessionId).grip===7);
 host.send('lobby');await until(()=>guest.state.phase==='lobby');host.send('mode','wheel');await until(()=>guest.state.mode==='wheel');host.send('start');await until(()=>guest.state.racePhase==='racing');console.log('PASS HTTPS page, build/health, WSS two-client room-code join, pair grips and Wheelbarrow countdown at '+url.origin);
}finally{await Promise.allSettled(rooms.map(r=>r.leave()));}
