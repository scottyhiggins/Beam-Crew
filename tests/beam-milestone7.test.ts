import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CrewRoom} from '../server/room.js';
import {CrewState,Player} from '../server/state.js';
import {COURSE,movingLoads,workerCollides} from '../shared/beam.js';
import {Client,type Room} from 'colyseus.js';
for(const count of [2,4,6,8])test(`${count} workers form ${count/2} independent pairs and immutable team deliveries`,()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.mode='competitive';
 for(let i=0;i<count;i++){const p=new Player();p.name='Worker '+i;r.state.players.set(String(i),p);}
 r.restart(false);r.state.phase='test';r.state.racePhase='racing';
 assert.equal(r.state.teams.length,count/2);
 for(let i=0;i<count;i++){const p=r.state.players.get(String(i))!;assert.equal(p.team,Math.floor(i/2));assert.equal(p.end,i%2?7:0);p.grip=p.end;}
 const b=r.state.teams[0];Object.assign(b,{x:COURSE.goal.x,z:COURSE.goal.z,angle:0,checkpoint:true});
 for(let i=0;i<30;i++)r.tick(1/30);
 assert.equal(b.delivered,true);assert.equal(b.place,1);const finish=b.finishTime;
 for(let i=0;i<30;i++)r.tick(1/30);assert.equal(b.finishTime,finish);assert.equal(b.place,1);
 assert.equal(r.state.teams.filter(t=>t.delivered).length,1);
 if(count>2)assert.equal(r.state.racePhase,'racing');else assert.equal(r.state.racePhase,'results');
});
test('moving loads block free workers at the server time, and later clear the same location',()=>{
 const t=3*Math.PI/2/.65,o=movingLoads(t)[0];assert.equal(workerCollides(o.x,o.z,.45,t),true);
 assert.equal(workerCollides(o.x,o.z,.45,t+Math.PI/.65),false);
});
const endpoint=process.env.TEST_URL;
async function until(fn:()=>boolean){const end=Date.now()+6000;while(!fn()){if(Date.now()>end)throw Error('Pair synchronization timed out');await new Promise(r=>setTimeout(r,25));}}
for(const count of [2,4,6,8])test(`real WebSockets synchronize ${count} workers and every assigned grip`,{skip:!endpoint,timeout:20000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws')),rooms:Room[]=[];
 try{
  const host=await client.create('crew',{name:'Pair host'});rooms.push(host);
  for(let i=1;i<count;i++)rooms.push(await client.joinById(host.roomId,{name:'Worker '+i}));
  await until(()=>rooms.every(r=>r.state.players?.size===count));host.send('mode','beam');host.send('start');
  await until(()=>rooms.every(r=>r.state.racePhase==='racing'));
  assert.equal(host.state.mode,'competitive');assert.equal(host.state.teams.length,count/2);
  rooms.forEach(r=>r.send('action'));
  await until(()=>rooms.every(r=>[...r.state.players.values()].every((p:any)=>p.grip===p.end)));
  assert.equal(new Set([...host.state.players.values()].map((p:any)=>`${p.team}:${p.end}`)).size,count);
  await until(()=>rooms.every(r=>r.state.teams.every((b:any)=>b.leftSupported&&b.rightSupported)));
 }finally{await Promise.allSettled(rooms.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});
