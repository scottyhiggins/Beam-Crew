import {Room,Client,ServerError} from '@colyseus/core';
import {randomBytes} from 'node:crypto';
import {arena,action,step,ranking,type Arena} from '../shared/crane.js';
export const craneRooms=new Map<string,CraneRoom>();
type Worker={id:string,name:string,order:number,score:number,connected:boolean,arena:Arena,dir:number,last:number,acted:number};
export class CraneRoom extends Room{
 maxClients=8;code='';host='';phase='lobby';elapsed=0;target=100;players=new Map<string,Worker>();serial=0;
 onCreate(){this.code=randomBytes(3).toString('hex').toUpperCase();craneRooms.set(this.code,this);this.setSimulationInterval(()=>this.tick(),1000/30);
 this.onMessage('input',(c,d)=>{const p=this.players.get(c.sessionId);if(p&&typeof d==='number'&&Number.isFinite(d)){p.dir=Math.max(-1,Math.min(1,d));p.last=Date.now();}});
 this.onMessage('action',c=>{const p=this.players.get(c.sessionId);if(p&&this.phase==='playing'&&Date.now()-p.acted>250){action(p.arena);p.acted=Date.now();}});
 this.onMessage('target',(c,t)=>{if(c.sessionId===this.host&&this.phase!=='playing'&&[0,50,100,150].includes(t))this.target=t;});
 this.onMessage('start',c=>{if(c.sessionId!==this.host||this.phase==='playing'||this.clients.length<2)return;for(const p of this.players.values()){p.arena=arena();p.score=0;p.dir=0;}this.elapsed=0;this.phase='playing';this.lock();});
 this.onMessage('lobby',c=>{if(c.sessionId===this.host){this.phase='lobby';this.unlock();}});
 }
 tick(){if(this.phase==='playing'){this.elapsed=Math.min(60,this.elapsed+1/30);for(const p of this.players.values()){step(p.arena,p.connected&&Date.now()-p.last<500?p.dir:0,1/30);p.score=p.arena.score;}if(this.elapsed>=60||(this.target>0&&[...this.players.values()].some(p=>p.score>=this.target)))this.phase='results';}
 const leaders=ranking([...this.players.values()]).map(({id,name,score,connected})=>({id,name,score,connected}));
 for(const c of this.clients)c.send('snapshot',{code:this.code,host:this.host,phase:this.phase,elapsed:this.elapsed,target:this.target,leaders,arena:this.players.get(c.sessionId)?.arena});
 }
 onJoin(c:Client,o:{name?:string}){if(this.phase!=='lobby')throw new ServerError(409,'Round in progress');this.players.set(c.sessionId,{id:c.sessionId,name:typeof o.name==='string'?o.name.replace(/[\u0000-\u001f]/g,'').slice(0,18):'Worker',order:this.serial++,score:0,connected:true,arena:arena(),dir:0,last:0,acted:0});if(!this.host)this.host=c.sessionId;}
 async onLeave(c:Client,consented:boolean){const p=this.players.get(c.sessionId);if(!p)return;p.connected=false;p.dir=0;if(this.host===c.sessionId)this.host=[...this.players.values()].find(p=>p.connected)?.id??'';try{if(consented)throw Error();await this.allowReconnection(c,30);p.connected=true;if(!this.host)this.host=c.sessionId;}catch{if(this.phase==='lobby')this.players.delete(c.sessionId);}}
 onDispose(){craneRooms.delete(this.code);}
}
