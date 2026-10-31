import {validateWorkerLook,type WorkerLook} from '../shared/cosmetics.js';
import {PROTOCOL_VERSION} from '../shared/version.js';
import {Room,Client,ServerError} from '@colyseus/core';
import {derbyArena,derbyAction,derbyHeight,stepDerby,type DerbyArena} from '../shared/derby.js';
import {randomBytes} from 'node:crypto';
import {arena,action,step,ranking,type Arena} from '../shared/crane.js';
export const craneRooms=new Map<string,CraneRoom>();
type Worker={look:WorkerLook,id:string,name:string,order:number,score:number,connected:boolean,arena:Arena,derby:DerbyArena,dir:number,lift?:number,last:number,acted:number,retired?:boolean};
export class CraneRoom extends Room{
 maxClients=8;mode:'tower'|'derby'='tower';code='';host='';phase='lobby';elapsed=0;ticks=0;winner='';reason='';players=new Map<string,Worker>();serial=0;accumulator=0;
 onCreate(options?:{mode?:unknown}){this.mode=options?.mode==='derby'?'derby':'tower';this.code=randomBytes(3).toString('hex').toUpperCase();craneRooms.set(this.code,this);this.setSimulationInterval(dt=>this.advance(dt),1000/30);
 this.onMessage('cosmetics',(c,d)=>{const p=this.players.get(c.sessionId);if(p)p.look=validateWorkerLook(d);});
 this.onMessage('input',(c,d)=>{const p=this.players.get(c.sessionId);if(p&&typeof d==='number'&&Number.isFinite(d)){p.dir=Math.max(-1,Math.min(1,d));p.last=Date.now();}});
 this.onMessage('height',(c,d)=>{const p=this.players.get(c.sessionId);if(p&&typeof d==='number'&&Number.isFinite(d)){p.lift=Math.max(-1,Math.min(1,d));p.last=Date.now();}});
 this.onMessage('action',c=>{const p=this.players.get(c.sessionId);if(p&&this.phase==='playing'&&Date.now()-p.acted>250){if(this.mode==='derby')derbyAction(p.derby,p.dir);else action(p.arena);p.acted=Date.now();}});
 this.onMessage('mode',(c,mode)=>{if(c.sessionId!==this.host||this.phase!=='lobby'||!['tower','derby'].includes(mode))return;this.mode=mode;for(const p of this.players.values()){p.arena=arena();p.derby=derbyArena();p.score=0;p.dir=0;}});
 this.onMessage('start',c=>{if(c.sessionId!==this.host||this.phase==='playing'||this.clients.length<2)return;for(const [id,p] of this.players){if(p.retired){this.players.delete(id);continue;}p.arena=arena();p.derby=derbyArena();p.score=0;p.dir=0;}const seed=randomBytes(4).readUInt32LE();for(const p of this.players.values()){p.derby=derbyArena(seed);p.lift=0;}this.elapsed=0;this.ticks=0;this.accumulator=0;this.winner='';this.reason='';this.phase='playing';this.lock();});
 this.onMessage('lobby',c=>{if(c.sessionId===this.host){this.phase='lobby';this.unlock();}});
 }
 advance(milliseconds:number){if(this.phase!=='playing'){this.tick();this.accumulator=0;return;}this.accumulator+=Math.min(60000,Math.max(0,milliseconds))*.03;while(this.accumulator+1e-8>=1){this.tick();this.accumulator-=1;if(this.phase!=='playing'){this.accumulator=0;break;}}}
 tick(){if(this.phase==='playing'){
 this.elapsed=Math.min(60,++this.ticks/30);
 for(const p of this.players.values()){const dir=p.connected&&Date.now()-p.last<500?p.dir:0;if(this.mode==='derby'){derbyHeight(p.derby,p.connected&&Date.now()-p.last<500?p.lift??0:0,1/30);stepDerby(p.derby,dir,1/30);p.score=p.derby.score;}else{step(p.arena,dir,1/30);p.score=p.arena.score;}}
 const finishers=[...this.players.values()].filter(p=>this.mode==='tower'&&p.score>=100).sort((a,b)=>a.order-b.order);
 if(finishers.length||this.ticks>=1800){this.phase='results';this.winner=finishers[0]?.id??ranking([...this.players.values()])[0]?.id??'';this.reason=finishers.length?'100 ft reached':'60 seconds complete';for(const p of this.players.values())p.derby.debris=[];}
 }
 const leaders=ranking([...this.players.values()]).map(({id,name,score,connected,look})=>({id,name,score,connected,look}));
 for(const c of this.clients)c.send('snapshot',{protocol:PROTOCOL_VERSION,code:this.code,host:this.host,phase:this.phase,elapsed:this.elapsed,mode:this.mode,target:this.mode==='tower'?100:0,winner:this.winner,reason:this.reason,leaders,arena:this.players.get(c.sessionId)?.arena,derby:this.mode==='derby'?this.players.get(c.sessionId)?.derby:undefined});
 }

 onJoin(c:Client,o:{name?:string;cosmetics?:unknown;protocol?:number}){if(o.protocol!==undefined&&o.protocol!==PROTOCOL_VERSION)throw new ServerError(409,'Game version mismatch. Refresh before joining.');if(this.phase!=='lobby')throw new ServerError(409,'Round in progress');this.players.set(c.sessionId,{look:validateWorkerLook(o.cosmetics),id:c.sessionId,name:typeof o.name==='string'?o.name.replace(/[\u0000-\u001f]/g,'').slice(0,18):'Worker',order:this.serial++,score:0,connected:true,arena:arena(),derby:derbyArena(),dir:0,last:0,acted:0});if(!this.host)this.host=c.sessionId;}
 async onLeave(c:Client,consented:boolean){const p=this.players.get(c.sessionId);if(!p)return;p.connected=false;p.dir=0;if(this.host===c.sessionId)this.host=[...this.players.values()].find(p=>p.connected)?.id??'';try{if(consented)throw Error();await this.allowReconnection(c,30);p.connected=true;if(!this.host)this.host=c.sessionId;}catch{p.retired=true;if(this.phase==='lobby')this.players.delete(c.sessionId);}}
 onDispose(){craneRooms.delete(this.code);}
}
