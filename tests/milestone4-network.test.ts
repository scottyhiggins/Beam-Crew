import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,Room} from 'colyseus.js';
const endpoint=process.env.TEST_URL;
async function until(check:()=>boolean){const end=Date.now()+7000;while(!check()){if(Date.now()>end)throw Error('State timeout');await new Promise(r=>setTimeout(r,30));}}
test('server locks duplicate material choices at countdown and pairs eight clients authoritatively',{skip:!endpoint,timeout:25000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws')),rooms:Room[]=[];
 try{const host=await client.create('crew',{name:'Host'});rooms.push(host);for(let i=1;i<8;i++)rooms.push(await client.joinById(host.roomId,{name:'Worker '+i}));await until(()=>host.state.players?.size===8);
 host.send('mode','wheel');for(const r of rooms)r.send('material',2);await until(()=>[...host.state.players.values()].every((p:any)=>p.materialId===2));
 rooms[1].send('mode','competitive');rooms[1].send('material',99);await new Promise(r=>setTimeout(r,100));assert.equal(host.state.mode,'wheel');assert.equal(host.state.players.get(rooms[1].sessionId).materialId,2);
 host.send('start');await until(()=>host.state.racePhase==='countdown');host.send('material',0);await new Promise(r=>setTimeout(r,100));assert.equal(host.state.players.get(host.sessionId).materialId,2);
 host.send('lobby');await until(()=>host.state.phase==='lobby');host.send('mode','competitive');await until(()=>host.state.mode==='competitive');host.send('start');await until(()=>host.state.teams?.length===4);assert.equal(host.state.racePhase,'countdown');
 for(let i=0;i<4;i++)assert.deepEqual([...host.state.players.values()].filter((p:any)=>p.team===i).map((p:any)=>p.end),[0,7]);
 await until(()=>host.state.racePhase==='racing');for(const r of rooms)r.send('action');await until(()=>[...host.state.players.values()].every((p:any)=>p.grip===p.end));
 const before=host.state.teams[1].z;let count=0;const timer=setInterval(()=>{rooms[0].send('input',{x:0,z:-1});rooms[1].send('input',{x:0,z:-1});count++;},30);await until(()=>count>=20);clearInterval(timer);await until(()=>host.state.teams[0].z<5.8);assert.equal(host.state.teams[1].z,before);
 }finally{await Promise.allSettled(rooms.map(r=>r.leave()));}
});
