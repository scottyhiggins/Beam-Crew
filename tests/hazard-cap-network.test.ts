import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {Server,matchMaker} from '@colyseus/core';
import {WebSocketTransport} from '@colyseus/ws-transport';
import {Client,type Room} from 'colyseus.js';
import {CrewRoom} from '../server/room.js';
import {SpilledMaterial,RaceResult} from '../server/state.js';
import {planSpills} from '../shared/debris.js';
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean){const end=Date.now()+8000;while(!fn()){if(Date.now()>end)throw Error('Hazard patch timeout');await pause(20);}}
test('FIFO schema removal reaches two real clients and late reconnect snapshots without altering recorded results',{skip:!process.env.TEST_URL,timeout:20000},async()=>{
 const http=createServer(),server=new Server({transport:new WebSocketTransport({server:http})});server.define('hazard_fixture',CrewRoom);
 const clients:Room[]=[];
 try{
 await server.listen(0,'127.0.0.1');const port=(http.address() as {port:number}).port,client=new Client('ws://127.0.0.1:'+port);
 const a=await client.create('hazard_fixture'),b=await client.joinById(a.roomId);clients.push(a,b);await until(()=>b.state.players?.size===2);
 const room=matchMaker.getLocalRoomById(a.roomId) as CrewRoom;room.hazardCap=3;
 const result=new RaceResult();Object.assign(result,{spills:17,time:40.25,place:1});room.state.results.push(result);room.state.players.get(a.sessionId)!.spills=19;
 for(let i=0;i<9;i++){const h=new SpilledMaterial();Object.assign(h,{x:i,z:3,materialId:i%12});room.state.material.push(h);}
 await until(()=>a.state.material?.length===9&&b.state.material?.length===9);
 const collision=[...room.state.material];room.trimHazards(collision);assert.deepEqual(collision.map(h=>h.x),[6,7,8]);
 await until(()=>a.state.material.length===3&&b.state.material.length===3);
 const snapshot=(r:Room)=>Array.from(r.state.material as Iterable<any>,h=>({x:h.x,z:h.z,materialId:h.materialId,amount:h.amount}));
 assert.deepEqual(snapshot(a),snapshot(b));assert.deepEqual(snapshot(a).map(h=>h.x),[6,7,8]);assert.deepEqual(planSpills(snapshot(a)),planSpills(snapshot(b)));
 const token=b.reconnectionToken,id=b.sessionId;b.connection.close();await until(()=>!a.state.players.get(id).connected);
 const resumed=await client.reconnect(token);clients.push(resumed);await until(()=>resumed.state.material?.length===3);assert.deepEqual(snapshot(resumed),snapshot(a));assert.equal(resumed.state.results[0].spills,17);assert.equal(resumed.state.results[0].time,40.25);assert.equal(a.state.players.get(a.sessionId).spills,19);
 }finally{await Promise.allSettled(clients.filter(r=>r.connection.isOpen).map(r=>r.leave()));await server.gracefullyShutdown(false);}
});
