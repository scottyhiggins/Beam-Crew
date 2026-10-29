import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ReconnectRun,reservationValid,RESERVATION_MS} from '../client/reconnect.js';
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
test('saved reservation deadline survives reload and cannot be extended by retries',()=>{
 const now=100000;assert.equal(reservationValid(now+RESERVATION_MS,now),true);
 assert.equal(reservationValid(now-1,now),false);assert.equal(reservationValid(NaN,now),false);
 assert.equal(reservationValid(0,now),false);assert.equal(reservationValid(now+60000,now),false);
});
test('a stalled Safari/offline request expires and releases a late connection',async()=>{
 let release=()=>{},left=0;const pending=new Promise<{leave:()=>void}>(r=>release=()=>r({leave:()=>{left++;}}));
 const run=new ReconnectRun<{leave:()=>void}>();
 assert.equal(await run.run(Date.now()+25,()=>pending,()=>{}),null);
 release();await pause(5);assert.equal(left,1);
});
test('Cancel immediately unlocks recovery and a late success cannot attach',async()=>{
 let release=()=>{},left=0;const pending=new Promise<{leave:()=>void}>(r=>release=()=>r({leave:()=>{left++;}}));
 const run=new ReconnectRun<{leave:()=>void}>(),result=run.run(Date.now()+2000,()=>pending,()=>{});
 run.cancel();assert.equal(await result,null);release();await pause(5);assert.equal(left,1);
});
test('expired tokens stop immediately; valid reconnect retains its session',async()=>{
 let calls=0;const run=new ReconnectRun<{leave:()=>void}>();
 assert.equal(await run.run(Date.now()+2000,async()=>{calls++;throw Object.assign(Error('expired'),{code:4214});},()=>{}),null);assert.equal(calls,1);
 const value={leave(){}};assert.equal(await new ReconnectRun<typeof value>().run(Date.now()+2000,async()=>value,()=>{}),value);
});
test('temporary network failure retries within the original reservation',async()=>{
 let calls=0;const value={leave(){}};
 const result=await new ReconnectRun<typeof value>().run(Date.now()+2500,async()=>{if(++calls===1)throw Error('network unavailable');return value;},()=>{});
 assert.equal(result,value);assert.equal(calls,2);
});
