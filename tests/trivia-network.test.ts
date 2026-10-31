import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,Room} from 'colyseus.js';
import type {TriviaView} from '../shared/trivia.js';
const endpoint=process.env.TEST_URL;
const until=async(f:()=>boolean,ms=5000)=>{const end=Date.now()+ms;while(!f()){if(Date.now()>end)throw Error('Trivia sync timeout');await new Promise(r=>setTimeout(r,25));}};
for(let n=2;n<=8;n++)test(`live free-for-all ${n} players: code, shared questions, independent locks, reconnect, host transfer, final and replay`,{skip:!endpoint,timeout:50000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws')),rs:Room[]=[],vs=new Map<string,TriviaView>();
 const attach=(r:Room)=>{r.onMessage('view',(v:TriviaView)=>vs.set(r.sessionId,v));r.send('sync');return r;};
 try{
  let host=attach(await client.create('trivia',{name:'Host'}));rs.push(host);await until(()=>!!vs.get(host.sessionId));const code=vs.get(host.sessionId)!.code;assert.equal((await fetch(endpoint+'/api/trivia/'+code)).status,200);
  for(let i=1;i<n;i++)rs.push(attach(await client.joinById(host.roomId,{name:'Worker '+i})));await until(()=>vs.get(host.sessionId)?.players.length===n);host.send('count',5);host.send('start');await until(()=>rs.every(r=>vs.get(r.sessionId)?.phase==='question'));assert.equal((await fetch(endpoint+'/api/trivia/'+code)).status,409);
  const id=rs[1].sessionId,epoch=vs.get(id)!.epoch;rs[1].send('answer',{choice:0,epoch});await until(()=>vs.get(id)?.submitted===true);const token=rs[1].reconnectionToken;rs[1].connection.close();await until(()=>vs.get(host.sessionId)?.players.find(p=>p.id===id)?.connected===false);rs[1]=attach(await client.reconnect(token));await until(()=>vs.get(id)?.players.find(p=>p.id===id)?.connected===true);assert.equal(vs.get(id)!.submitted,true);
  for(let round=1;round<=5;round++){
   await until(()=>rs.every(r=>vs.get(r.sessionId)?.round===round&&vs.get(r.sessionId)?.phase==='question'),8500);const v=vs.get(rs[0].sessionId)!;
   for(const r of rs){const other=vs.get(r.sessionId)!;assert.equal(other.question,v.question);assert.deepEqual(other.answers,v.answers);assert.equal(other.correct,undefined);r.send('answer',{choice:0,epoch:other.epoch,playerId:rs[0].sessionId});}
   await until(()=>rs.every(r=>vs.get(r.sessionId)?.phase==='reveal'));assert.ok(vs.get(id)!.correct);assert.equal(vs.get(id)!.standings.length,n);
   if(round===2){const old=host;await old.leave();rs.splice(rs.indexOf(old),1);await until(()=>vs.get(id)?.host!==old.sessionId);host=rs.find(r=>r.sessionId===vs.get(id)!.host)!;}
  }
  await until(()=>vs.get(id)?.phase==='podium',8500);assert.equal(vs.get(id)!.standings.length,n);host.send('lobby');await until(()=>vs.get(id)?.phase==='lobby');if(rs.length===1)rs.push(attach(await client.joinById(host.roomId,{name:'Replay friend'})));await until(()=>vs.get(id)?.players.length===rs.length);host.send('start');await until(()=>vs.get(id)?.phase==='question');assert.ok(vs.get(id)!.standings.every(p=>p.score===0));assert.equal(vs.get(id)!.code,code);
 }finally{await Promise.allSettled(rs.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});
test('live timeout: unanswered workers get zero; bounded reveal advances without host',{skip:!endpoint,timeout:30000},async()=>{
 const c=new Client(endpoint!.replace(/^http/,'ws')),rs:Room[]=[],vs=new Map<string,TriviaView>();try{for(let i=0;i<2;i++){const r=i?await c.joinById(rs[0].roomId):await c.create('trivia');rs.push(r);r.onMessage('view',(v:TriviaView)=>vs.set(r.sessionId,v));r.send('sync');}rs[0].send('start');await until(()=>vs.get(rs[0].sessionId)?.phase==='question');await until(()=>vs.get(rs[0].sessionId)?.phase==='reveal',22000);assert.ok(vs.get(rs[0].sessionId)!.standings.every(p=>p.score===0&&p.choice==='Timed out'));await until(()=>vs.get(rs[0].sessionId)?.round===2,6000);}finally{await Promise.allSettled(rs.map(r=>r.leave()));}
});
