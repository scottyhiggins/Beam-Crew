import { Room, Client } from '@colyseus/core';
import { randomInt } from 'node:crypto';
import { CrewState, Player } from './state.js';
import { CONFIG, movement } from '../shared/movement.js';
export const roomsByCode=new Map<string,CrewRoom>();
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export class CrewRoom extends Room<CrewState> {
  maxClients=CONFIG.maxPlayers;
  onCreate(){
    this.setState(new CrewState());
    do { this.state.code=Array.from({length:5},()=>alphabet[randomInt(alphabet.length)]).join(''); } while(roomsByCode.has(this.state.code));
    roomsByCode.set(this.state.code,this); this.setMetadata({code:this.state.code});
    this.setPatchRate(50);
    this.setSimulationInterval(dt=>this.tick(Math.min(dt/1000,.1)),1000/CONFIG.tickRate);
    this.onMessage('input',(c,data)=>{const p=this.state.players.get(c.sessionId);if(!p||!data||!Number.isFinite(data.x)||!Number.isFinite(data.z))return;p.inputX=Math.max(-1,Math.min(1,data.x));p.inputZ=Math.max(-1,Math.min(1,data.z));p.lastInput=Date.now();});
    this.onMessage('action',c=>{const p=this.state.players.get(c.sessionId);if(p&&this.state.phase==='test'&&Date.now()-p.lastAction>200){p.actions++;p.lastAction=Date.now();}});
    this.onMessage('signal',(c,value)=>{const p=this.state.players.get(c.sessionId);if(p&&['LIFT','WAIT','LEFT','RIGHT'].includes(value)&&Date.now()-p.lastSignal>500){p.signal=value;p.lastSignal=Date.now();p.signalUntil=Date.now()+2000;}});
    this.onMessage('start',c=>{if(c.sessionId===this.state.host&&this.state.phase==='lobby'&&this.clients.length>=2){this.state.phase='test';this.lock();}});
    this.onMessage('lobby',c=>{if(c.sessionId===this.state.host){this.state.phase='lobby';this.unlock();for(const p of this.state.players.values()){p.inputX=p.inputZ=p.vx=p.vz=0;}}});
  }
  onJoin(c:Client,options:{name?:unknown}){
    const p=new Player();p.name=typeof options.name==='string'?options.name.trim().replace(/[\u0000-\u001f]/g,'').slice(0,18)||'Worker':'Worker';
    const used=new Set(Array.from(this.state.players.values(),p=>p.color));p.color=Array.from({length:8},(_,i)=>i).find(i=>!used.has(i))??0;
    p.x=(p.color%4)*2-3;p.z=Math.floor(p.color/4)*2;p.lastInput=Date.now();this.state.players.set(c.sessionId,p);
    if(!this.state.host)this.state.host=c.sessionId;
  }
  async onLeave(c:Client,consented:boolean){
    const p=this.state.players.get(c.sessionId);if(!p)return;p.connected=false;p.inputX=p.inputZ=p.vx=p.vz=0;
    this.transferHost(c.sessionId);
    try {if(consented)throw Error('left');await this.allowReconnection(c,CONFIG.reconnectSeconds);p.connected=true;p.lastInput=Date.now();if(!this.state.host)this.state.host=c.sessionId;}
    catch {this.state.players.delete(c.sessionId);this.transferHost(c.sessionId);}
  }
  transferHost(id:string){if(this.state.host===id)this.state.host=Array.from(this.state.players.entries()).find(([key,p])=>key!==id&&p.connected)?.[0]??'';}
  tick(dt:number){const now=Date.now();for(const p of this.state.players.values()){if(p.signalUntil<now)p.signal='';if(this.state.phase==='test'){const active=p.connected&&now-p.lastInput<300;movement(p,active?p.inputX:0,active?p.inputZ:0,dt);}}}
  onDispose(){roomsByCode.delete(this.state.code);}
}
