import fs from 'node:fs';
import {CraneRoom} from '../build/server/crane-room.js';
import {derbyArena,stepDerby,MAX_DEBRIS} from '../build/shared/derby.js';
const results=[];
for(const density of ['normal','maximum-fragments']){
 const r=new CraneRoom();r.mode='derby';let bytes=0;for(let i=0;i<8;i++){const c={sessionId:String(i),send:(_,data)=>{bytes+=Buffer.byteLength(JSON.stringify(data));}};r.onJoin(c,{name:'Perf '+i,protocol:23});r.clients.push(c);}
 const times=[];let peak=0;
 for(let i=0;i<600;i++){
  if(density==='maximum-fragments'&&i%30===0)for(const p of r.players.values()){const d=derbyArena();d.yaw=-.47;d.turn=.85;d.targets=Array.from({length:31},(_,id)=>({...d.targets[0],id,x:-4.5,y:1,w:1,h:1,hp:1,maxHp:1}));stepDerby(d,1,1/30);if(d.debris.length!==MAX_DEBRIS)throw Error('stress setup missing cap');p.derby=d;}
  for(const p of r.players.values()){p.last=Date.now();p.dir=Math.sin(i/45);p.lift=Math.cos(i/60);peak=Math.max(peak,p.derby.debris.length);}
  r.phase='playing';const start=performance.now();r.tick();times.push(performance.now()-start);
 }
 times.sort((a,b)=>a-b);results.push({mode:'derby',density,players:8,ticks:600,includes:'CraneRoom.tick plus JSON encoding of all eight private snapshots; excludes real socket/network transport',peakDebrisPerArena:peak,p50:times[300],p95:times[570],max:times.at(-1),encodedBytes:bytes,budgetMs:1000/30});r.onDispose();
}
fs.writeFileSync('qa/m32/room-performance.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
