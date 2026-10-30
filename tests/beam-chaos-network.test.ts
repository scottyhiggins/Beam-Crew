import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
const endpoint=process.env.TEST_URL;
async function until(fn:()=>boolean){const end=Date.now()+7000;while(!fn()){if(Date.now()>end)throw Error('Chaos clients did not synchronize');await new Promise(r=>setTimeout(r,25));}}
test('four real clients: host map authority, team-local rescue, reconnect and replay',{skip:!endpoint,timeout:30000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws'));const rooms:Room[]=[];
 try{
  const host=await client.create('crew',{name:'Chaos host'});rooms.push(host);
  for(let i=1;i<4;i++)rooms.push(await client.joinById(host.roomId,{name:'Crew '+i}));
  await until(()=>rooms.every(r=>r.state.players?.size===4));host.send('mode','competitive');host.send('beamMap',2);
  await until(()=>rooms.every(r=>r.state.beamMap===2));rooms[1].send('beamMap',0);
  await new Promise(r=>setTimeout(r,150));assert.equal(host.state.beamMap,2);
  host.send('start');await until(()=>rooms.every(r=>r.state.racePhase==='racing'));
  host.send('beamMap',0);const resets=host.state.teams[0].resets;
  rooms[1].send('rescue');rooms[1].send('rescue');
  await until(()=>rooms.every(r=>r.state.teams[0].resets===resets+1));
  for(const r of rooms){assert.equal(r.state.beamMap,2);assert.equal(r.state.teams[0].penalty,5);assert.equal(r.state.teams[1].penalty,0);assert.equal(r.state.teams[1].resets,resets);}
  const id=rooms[1].sessionId,token=rooms[1].reconnectionToken;rooms[1].connection.close();
  await until(()=>!host.state.players.get(id).connected);rooms[1]=await client.reconnect(token);
  await until(()=>rooms[1].state.players?.get(id)?.connected&&host.state.players.get(id).connected);
  assert.equal(rooms[1].state.players.get(id).team,0);assert.equal(rooms[1].state.players.get(id).end,7);assert.equal(rooms[1].state.beamMap,2);assert.equal(rooms[1].state.teams[0].penalty,5);
  await new Promise(r=>setTimeout(r,1100));host.send('restart');
  await until(()=>rooms.every(r=>r.state.teams[0].penalty===0&&r.state.racePhase==='countdown'));
  assert.equal(host.state.teams.length,2);assert.equal(host.state.beamMap,2);
 }finally{await Promise.allSettled(rooms.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});
