import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
const endpoint=process.env.TEST_URL,pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(fn:()=>boolean){const deadline=Date.now()+8000;while(!fn()){if(Date.now()>deadline)throw Error('M27 clients failed to synchronize');await pause(25);}}
for(const count of [2,4,6,8])for(const map of [3,4])test(`M27 real sockets: ${count} players, map ${map}, carry/release, reconnect, host transfer, rematch`,{skip:!endpoint,timeout:25000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws')),rooms:Room[]=[];
 try{
  const h=await client.create('crew',{name:'Foreman',cosmetics:{hat:0xf78b24,vest:0x76be45,expression:'goofy'}});rooms.push(h);
  for(let i=1;i<count;i++)rooms.push(await client.joinById(h.roomId,{name:'Worker '+i}));
  await until(()=>rooms.every(r=>r.state.players?.size===count));h.send('mode','competitive');h.send('beamMap',map);
  await until(()=>rooms.every(r=>r.state.beamMap===map));rooms[1].send('beamMap',-1);await pause(100);assert.equal(h.state.beamRandom,false);
  h.send('start');await until(()=>rooms.every(r=>r.state.racePhase==='racing'));
  rooms.forEach(r=>r.send('action'));await until(()=>rooms.every(r=>r.state.teams.every((b:any)=>b.leftSupported&&b.rightSupported)));
  await pause(250);rooms.forEach(r=>r.send('action'));await until(()=>rooms.every(r=>r.state.teams.every((b:any)=>!b.leftSupported&&!b.rightSupported)));
  const guest=rooms[1],id=guest.sessionId,token=guest.reconnectionToken;guest.connection.close();await until(()=>!h.state.players.get(id).connected);
  rooms[1]=await client.reconnect(token);await until(()=>h.state.players.get(id).connected&&rooms[1].state.beamMap===map);
  assert.equal(rooms[1].state.players.get(id).end,7);assert.equal(h.state.players.get(h.sessionId).hat,0xf78b24);
  const oldResets=h.state.raceResets;await h.leave();await until(()=>rooms[1].state.host===rooms[1].sessionId);
  rooms[1].send('restart');await until(()=>rooms[1].state.raceResets>oldResets||rooms[1].state.players.get(id).feedback.startsWith('Waiting for a teammate'));
  if(count===2){rooms[1].send('lobby');await until(()=>rooms[1].state.phase==='lobby');rooms.push(await client.joinById(rooms[1].roomId));rooms[1].send('start');}
  await until(()=>rooms[1].state.racePhase==='racing'&&rooms[1].state.raceResets>oldResets);assert.equal(rooms[1].state.beamMap,map);
 }finally{await Promise.allSettled(rooms.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});
