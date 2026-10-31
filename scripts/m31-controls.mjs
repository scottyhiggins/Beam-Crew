import {Client} from 'colyseus.js';import assert from 'node:assert/strict';
const client=new Client('ws://127.0.0.1:2731');
const until=async f=>{for(let i=0;i<160;i++){if(f())return;await new Promise(r=>setTimeout(r,25));}throw Error('control snapshot timeout');};
for(let count=2;count<=8;count++){
 const rooms=[],states=new Map();let timer;
 try{for(let i=0;i<count;i++){const r=i?await client.joinById(rooms[0].roomId,{name:'QA '+i}):await client.create('crane',{mode:'derby',name:'QA host'});rooms.push(r);r.onMessage('snapshot',s=>states.set(r.sessionId,s));}
 const host=rooms[0];await until(()=>states.get(host.sessionId)?.leaders.length===count);host.send('start');await until(()=>rooms.every(r=>states.get(r.sessionId)?.phase==='playing'));
 const seed=states.get(host.sessionId).derby.seed;for(const r of rooms)assert.equal(states.get(r.sessionId).derby.seed,seed);
 const yaw=states.get(host.sessionId).derby.yaw;timer=setInterval(()=>{host.send('input',1);host.send('height',1);},40);
 await until(()=>states.get(host.sessionId).derby.height>6&&states.get(host.sessionId).derby.yaw>yaw+.1);clearInterval(timer);timer=undefined;host.send('input',0);host.send('height',0);host.send('action');
 for(const r of rooms.slice(1)){assert.equal(states.get(r.sessionId).derby.height,5);assert.equal(states.get(r.sessionId).derby.yaw,yaw);assert.equal(states.get(r.sessionId).derby.score,0);}
 host.send('lobby');await until(()=>states.get(host.sessionId).phase==='lobby');host.send('start');await until(()=>states.get(host.sessionId).phase==='playing'&&states.get(host.sessionId).derby.height===5);assert.equal(states.get(host.sessionId).derby.score,0);console.log(`PASS ${count} players: rotation, height, shared seed, private arenas, boost and replay`);
 }finally{if(timer)clearInterval(timer);for(const r of rooms)if(r.connection.isOpen)await r.leave();}
}
