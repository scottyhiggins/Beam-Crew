import { Room, Client, ServerError } from '@colyseus/core';
import { randomInt } from 'node:crypto';
import { CrewState, Player, RaceResult, SpilledMaterial } from './state.js';
import { CONFIG, movement } from '../shared/movement.js';
import { GRIPS, gripPosition, nearestGrip, resetBeam, stepBeam, workerCollides } from '../shared/beam.js';
import { WHEEL_CONFIG, resetCart, stepCart, finishCarts, spillMaterial, stepMaterial, compareResults, shouldEndRace } from '../shared/wheelbarrow.js';
export const roomsByCode=new Map<string,CrewRoom>();
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export class CrewRoom extends Room<CrewState> {
  maxClients=CONFIG.maxPlayers;
  private accumulator=0;
  onCreate(){
    this.setState(new CrewState());
    do {this.state.code=Array.from({length:5},()=>alphabet[randomInt(alphabet.length)]).join('');}while(roomsByCode.has(this.state.code));
    roomsByCode.set(this.state.code,this);this.setMetadata({code:this.state.code});this.setPatchRate(50);
    this.setSimulationInterval(dt=>{this.accumulator+=Math.min(dt/1000,.1);const step=1/CONFIG.tickRate;while(this.accumulator>=step){this.tick(step);this.accumulator-=step;}},1000/CONFIG.tickRate);
    this.onMessage('input',(c,data)=>{const p=this.state.players.get(c.sessionId);if(!p||!data||!Number.isFinite(data.x)||!Number.isFinite(data.z))return;p.inputX=Math.max(-1,Math.min(1,data.x));p.inputZ=Math.max(-1,Math.min(1,data.z));p.lastInput=Date.now();});
    this.onMessage('action',c=>{
      const p=this.state.players.get(c.sessionId);
      if(this.state.mode==='wheel'||!p||this.state.phase!=='test'||Date.now()-p.lastAction<=200)return;
      p.lastAction=Date.now();p.actions++;
      if(p.grip>=0){p.grip=-1;p.vx=p.vz=0;this.feedback(p,'Released');return;}
      if(this.state.beam.delivered){this.feedback(p,'Delivered! Host can restart the course.');return;}
      const occupied=new Set(Array.from(this.state.players.values(),p=>p.grip).filter(g=>g>=0));
      const grip=nearestGrip(this.state.beam,p.x,p.z,occupied);
      if(grip<0){this.feedback(p,'Move closer to an empty grip');return;}
      p.grip=grip;p.vx=p.vz=0;this.positionCarrier(p);this.feedback(p,`Gripping ${grip+1} — press again to release`);
    });
    this.onMessage('signal',(c,value)=>{const p=this.state.players.get(c.sessionId);if(p&&['LIFT','WAIT','LEFT','RIGHT'].includes(value)&&Date.now()-p.lastSignal>500){p.signal=value;p.lastSignal=Date.now();p.signalUntil=Date.now()+2000;}});
    this.onMessage('mode',(c,value)=>{if(c.sessionId===this.state.host&&this.state.phase==='lobby'&&['beam','wheel'].includes(value))this.state.mode=value;});
    this.onMessage('start',c=>{if(c.sessionId===this.state.host&&this.state.phase==='lobby'&&this.clients.length>=2){this.restart(false);this.state.phase='test';this.lock();}});
    this.onMessage('reset',c=>{if(c.sessionId===this.state.host&&this.state.phase==='test'&&Date.now()-this.lastReset>1000){this.restart(true);}});
    this.onMessage('restart',c=>{if(c.sessionId===this.state.host&&this.state.phase==='test'&&Date.now()-this.lastReset>1000){this.restart(false);}});
    this.onMessage('lobby',c=>{if(c.sessionId===this.state.host){this.state.phase='lobby';this.unlock();for(const p of this.state.players.values()){p.grip=-1;p.inputX=p.inputZ=p.vx=p.vz=0;}}});
  }
  private lastReset=0;
  feedback(p:Player,text:string){p.feedback=text;p.feedbackUntil=Date.now()+2500;}
  restart(checkpoint:boolean){
    this.lastReset=Date.now();
    if(this.state.mode==='wheel'){this.state.racePhase='countdown';this.state.countdown=WHEEL_CONFIG.countdownSeconds;this.state.elapsed=0;this.state.raceResets++;this.state.finishCount=0;this.state.firstFinishAt=-1;this.state.results.clear();this.state.material.clear();let slot=0;for(const p of this.state.players.values()){resetCart(p,slot++,this.state.players.size);p.grip=-1;p.inputX=p.inputZ=p.vx=p.vz=0;p.lastInput=0;}return;}
    resetBeam(this.state.beam,checkpoint);this.state.beam.resets++;
    for(const p of this.state.players.values()){
      p.grip=-1;p.inputX=p.inputZ=p.vx=p.vz=0;p.lastInput=0;p.feedback='';
      const spawnGrip=[0,7,2,5,1,6,3,4][p.color];const point=gripPosition(this.state.beam,spawnGrip);p.x=point.x;p.z=point.z;
      p.rotation=this.state.beam.angle-GRIPS[spawnGrip].side*Math.PI/2;
    }
  }
  positionCarrier(p:Player){const point=gripPosition(this.state.beam,p.grip);p.x=point.x;p.z=point.z;p.rotation=this.state.beam.angle-GRIPS[p.grip].side*Math.PI/2;}
  onJoin(c:Client,options:{name?:unknown}){
    if(this.state.phase!=='lobby')throw new ServerError(409,'The test has already started');
    const p=new Player();p.name=typeof options.name==='string'?options.name.trim().replace(/[\u0000-\u001f]/g,'').slice(0,18)||'Worker':'Worker';
    const used=new Set(Array.from(this.state.players.values(),p=>p.color));p.color=Array.from({length:8},(_,i)=>i).find(i=>!used.has(i))??0;
    p.x=(p.color%4)*2-3;p.z=Math.floor(p.color/4)*2;p.lastInput=Date.now();this.state.players.set(c.sessionId,p);
    if(!this.state.host)this.state.host=c.sessionId;
  }
  async onLeave(c:Client,consented:boolean){
    const p=this.state.players.get(c.sessionId);if(!p)return;
    p.connected=false;p.grip=-1;p.inputX=p.inputZ=p.vx=p.vz=0;this.transferHost(c.sessionId);
    try{if(consented)throw Error('left');await this.allowReconnection(c,CONFIG.reconnectSeconds);p.connected=true;p.lastInput=Date.now();this.feedback(p,this.state.mode==='wheel'?'Reconnected — continue racing':'Reconnected — grab again when ready');if(!this.state.host)this.state.host=c.sessionId;}
    catch{this.state.players.delete(c.sessionId);this.transferHost(c.sessionId);}
  }
  transferHost(id:string){if(this.state.host===id)this.state.host=Array.from(this.state.players.entries()).find(([key,p])=>key!==id&&p.connected)?.[0]??'';}
  tick(dt:number){
    const now=Date.now();
    if(this.state.phase==='test'&&this.state.mode==='wheel'){
      if(this.state.racePhase==='countdown'){this.state.countdown=Math.max(0,this.state.countdown-dt);if(this.state.countdown===0)this.state.racePhase='racing';return;}
      if(this.state.racePhase!=='racing')return;
      this.state.elapsed+=dt;
      const players=Array.from(this.state.players.values());
      const material=Array.from(this.state.material);
      stepMaterial(material,dt);
      for(const p of players){const active=p.connected&&now-p.lastInput<300,spills=p.spills;stepCart(p,active?p.inputX:0,active?p.inputZ:0,dt,material);
        if(p.spills>spills)spillMaterial(p,material,value=>{const brick=new SpilledMaterial();Object.assign(brick,value);this.state.material.push(brick);material.push(brick);});
      }
      this.state.finishCount=finishCarts(players,this.state.elapsed,this.state.finishCount);
      if(this.state.finishCount&&this.state.firstFinishAt<0)this.state.firstFinishAt=this.state.elapsed;
      for(const p of players)if(p.finishOrder&&!this.state.results.some(r=>r.finishOrder===p.finishOrder)){const result=new RaceResult();Object.assign(result,{name:p.name,color:p.color,spills:p.spills,time:p.finishTime,finishOrder:p.finishOrder});this.state.results.push(result);}
      [...this.state.results].sort(compareResults).forEach((r,i)=>{r.place=i+1;});
      if(shouldEndRace(players,this.state.elapsed,this.state.firstFinishAt))this.state.racePhase='results';
      return;
    }
    for(const p of this.state.players.values()){
      if(p.signalUntil<now)p.signal='';if(p.feedbackUntil<now)p.feedback='';
      if(this.state.phase==='test'&&p.grip<0){
        const active=p.connected&&now-p.lastInput<300,oldX=p.x,oldZ=p.z;
        movement(p,active?p.inputX:0,active?p.inputZ:0,dt);
        // Slide along obstacles rather than crossing the test-course walls.
        if(workerCollides(p.x,oldZ)){p.x=oldX;p.vx=0;}
        if(workerCollides(p.x,p.z)){p.z=oldZ;p.vz=0;}
      }
    }
    if(this.state.phase!=='test')return;
    const carriers=Array.from(this.state.players.values()).filter(p=>p.connected&&p.grip>=0);
    stepBeam(this.state.beam,carriers.map(p=>({grip:p.grip,inputX:now-p.lastInput<300?p.inputX:0,inputZ:now-p.lastInput<300?p.inputZ:0})),dt);
    for(const p of carriers)this.positionCarrier(p);
  }
  onDispose(){roomsByCode.delete(this.state.code);}
}
