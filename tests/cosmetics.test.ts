import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
import {HAT_COLORS,VEST_COLORS,DEFAULT_WORKER_LOOK,validateWorkerLook,type WorkerLook} from '../shared/cosmetics.js';
import {CrewRoom} from '../server/room.js';
import type {Client as ServerClient} from '@colyseus/core';
import * as THREE from 'three';
import {makeWorker,animateWorker} from '../client/worker.js';

const first:WorkerLook={hat:HAT_COLORS.Blue,vest:VEST_COLORS.Green,expression:'goofy'};
const second:WorkerLook={hat:HAT_COLORS.White,vest:VEST_COLORS.Blue,expression:'serious'};
const invalid:unknown[]=[undefined,null,[],false,'blue',0,{}, {...first,hat:'Blue'},{...first,hat:-1},{...first,hat:NaN},{...first,vest:0xffffff},{...first,vest:Infinity},{...first,expression:'angry'},{hat:first.hat,vest:first.vest}];
const look=(p:WorkerLook)=>({hat:p.hat,vest:p.vest,expression:p.expression});

test('all 72 free looks validate and malformed selections fall back atomically',()=>{
 for(const hat of Object.values(HAT_COLORS))for(const vest of Object.values(VEST_COLORS))for(const expression of ['happy','serious','goofy'] as const){const value={hat,vest,expression};assert.deepEqual(validateWorkerLook(value),value);}
 for(const value of invalid)assert.deepEqual(validateWorkerLook(value),DEFAULT_WORKER_LOOK);
 assert.deepEqual(validateWorkerLook({...first,x:999,sessionId:'victim'}),first);
});

test('server join validates cosmetics and ignores attempted gameplay field injection',()=>{
 const room=new CrewRoom();room.onCreate();
 try{
  for(const [i,cosmetics]of [...invalid,first].entries()){
   const id=String(i);room.onJoin({sessionId:id} as ServerClient,{cosmetics});
   assert.deepEqual(look(room.state.players.get(id)!),i===invalid.length?first:DEFAULT_WORKER_LOOK);
   room.state.players.delete(id);
  }
  room.onJoin({sessionId:'safe'} as ServerClient,{cosmetics:{...first,x:999,speed:999,spills:-100,color:7}});
  const p=room.state.players.get('safe')!;assert.equal(p.x,-3);assert.equal(p.speed,0);assert.equal(p.spills,0);assert.equal(p.color,0);
 }finally{room.clock.clear();room.onDispose();}
});

test('cosmetic models preserve animated limb poses for Wheelbarrow and Beam Carry',()=>{
 for(const expression of ['happy','serious','goofy'] as const){
  const worker=makeWorker(0,{...first,expression});
  const colors:number[]=[];worker.traverse(o=>{if(o instanceof THREE.Mesh&&o.material instanceof THREE.MeshLambertMaterial)colors.push(o.material.color.getHex());});
  assert.ok(colors.includes(first.hat));assert.ok(colors.includes(first.vest));
  for(const wheel of [true,false]){animateWorker(worker,1,true,1000,0,wheel);const arms=(worker.userData.limbs as THREE.Group[]).slice(2);assert.ok(arms.every(a=>a.rotation.x===-.65));assert.ok(arms.every(a=>a.position.y===(wheel?1.17:1.27)));}
  worker.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});
 }
});

const endpoint=process.env.TEST_URL;
async function until(check:()=>boolean,timeout=12000){const end=Date.now()+timeout;while(!check()){if(Date.now()>end)throw Error('Cosmetic synchronization timed out');await new Promise(r=>setTimeout(r,25));}}
for(const mode of ['wheel','competitive'])test(`cosmetics synchronize by player, survive reconnect and new rounds in ${mode}`,{skip:!endpoint,timeout:45000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws'));const rooms:Room[]=[];
 try{
  const host=await client.create('crew',{name:'Cosmetic host',cosmetics:first});rooms.push(host);
  let guest=await client.joinById(host.roomId,{name:'Cosmetic guest',cosmetics:second});rooms.push(guest);
  const hostId=host.sessionId,guestId=guest.sessionId;
  const synchronized=(a:WorkerLook,b:WorkerLook)=>rooms.filter(r=>r.connection.isOpen).every(r=>r.state.players?.get(hostId)&&r.state.players?.get(guestId)&&JSON.stringify(look(r.state.players.get(hostId)))===JSON.stringify(a)&&JSON.stringify(look(r.state.players.get(guestId)))===JSON.stringify(b));
  await until(()=>synchronized(first,second));
  host.send('mode',mode);host.send('start');await until(()=>guest.state.phase==='test'&&guest.state.mode===mode);
  assert.ok(synchronized(first,second));
  // A sender can change only their own allowlisted cosmetic fields, even during a race.
  guest.send('cosmetics',{...first,sessionId:hostId,color:7,spills:-999,speed:999,x:999});
  await until(()=>synchronized(first,first));
  assert.equal(host.state.players.get(guestId).color,1);assert.equal(host.state.players.get(guestId).spills,0);assert.notEqual(host.state.players.get(guestId).x,999);
  guest.send('cosmetics',{...second,expression:'invalid'});await until(()=>synchronized(first,DEFAULT_WORKER_LOOK));
  guest.send('cosmetics',second);await until(()=>synchronized(first,second));
  const token=guest.reconnectionToken;guest.connection.close();await until(()=>!host.state.players.get(guestId).connected);
  guest=await client.reconnect(token);rooms.push(guest);await until(()=>host.state.players.get(guestId).connected&&synchronized(first,second));assert.equal(guest.sessionId,guestId);
  const resets=host.state.raceResets;host.send('restart');await until(()=>guest.state.raceResets>resets);assert.ok(synchronized(first,second));
  host.send('lobby');await until(()=>guest.state.phase==='lobby');host.send('start');await until(()=>guest.state.phase==='test');assert.ok(synchronized(first,second));
  host.send('lobby');await until(()=>guest.state.phase==='lobby');await guest.leave();await until(()=>host.state.players.size===1);
  guest=await client.joinById(host.roomId,{name:'New join',cosmetics:second});rooms.push(guest);await until(()=>guest.state.players?.size===2);assert.deepEqual(look(guest.state.players.get(guest.sessionId)),second);
 }finally{await Promise.allSettled(rooms.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});
