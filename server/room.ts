import {validBeamMap,stepChaosTeam,recoverTeam} from '../shared/beam-chaos.js';
import {selectCourseIds,assembleRoute,routeWorld,validChampionshipLength,type CourseInstance} from '../shared/course-modules.js';
import {championshipTrack,COURSE_TWO} from '../shared/championship.js';
import { Room, Client, ServerError } from '@colyseus/core';
import { randomInt } from 'node:crypto';
import { CrewState, Player, RaceResult, ChampionshipResult, SpilledMaterial, BeamTeam } from './state.js';
import { CONFIG, movement } from '../shared/movement.js';
import { BEAM_CONFIG, GRIPS, gripPosition, nearestGrip, resetBeam, stepBeam, workerCollides } from '../shared/beam.js';
import { collideStagingCarts, WHEEL_CONFIG, resetCart, stepCart, finishCarts, spillMaterial, stepMaterial, compareResults, shouldEndRace } from '../shared/wheelbarrow.js';
import {validMaterial} from '../shared/materials.js';
export const roomsByCode=new Map<string,CrewRoom>();
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export class CrewRoom extends Room<CrewState> {
  maxClients=CONFIG.maxPlayers;
  private accumulator=0;
  routePlan:CourseInstance[]=[];
  private routeMaterialWorld:ReturnType<typeof routeWorld>|undefined;
  currentTrack(){return this.routePlan[this.state.leg]?.track??championshipTrack(this.state.leg); }
  onCreate(){
    this.setState(new CrewState());
    do {this.state.code=Array.from({length:5},()=>alphabet[randomInt(alphabet.length)]).join('');}while(roomsByCode.has(this.state.code));
    roomsByCode.set(this.state.code,this);this.setMetadata({code:this.state.code});this.setPatchRate(50);
    this.setSimulationInterval(dt=>{this.accumulator+=Math.min(dt/1000,.1);const step=1/CONFIG.tickRate;while(this.accumulator>=step){this.tick(step);this.accumulator-=step;}},1000/CONFIG.tickRate);
    this.onMessage('input',(c,data)=>{const p=this.state.players.get(c.sessionId);if(!p||!data||!Number.isFinite(data.x)||!Number.isFinite(data.z))return;p.inputX=Math.max(-1,Math.min(1,data.x));p.inputZ=Math.max(-1,Math.min(1,data.z));p.lastInput=Date.now();});
    this.onMessage('action',c=>{
      const p=this.state.players.get(c.sessionId);
      if((this.state.mode==='wheel'||this.state.mode==='championship')||!p||this.state.phase!=='test'||Date.now()-p.lastAction<=200)return;
      p.lastAction=Date.now();p.actions++;
      if(p.grip>=0){p.grip=-1;p.vx=p.vz=0;this.feedback(p,'Released');return;}
      const beam=this.state.mode==='competitive'?this.state.teams[p.team]:this.state.beam;
      if(!beam||this.state.mode==='competitive'&&(this.state.racePhase!=='racing'||p.end<0))return;
      if(beam.delivered){this.feedback(p,'Delivered! Host can restart the course.');return;}
      const occupied=new Set(Array.from(this.state.players.values(),p=>p.grip).filter(g=>g>=0));
      const grip=this.state.mode==='competitive'?(Math.hypot(gripPosition(beam,p.end).x-p.x,gripPosition(beam,p.end).z-p.z)<=1.25?p.end:-1):nearestGrip(beam,p.x,p.z,occupied);
      if(grip<0){this.feedback(p,'Move closer to an empty grip');return;}
      p.grip=grip;p.vx=p.vz=0;this.positionCarrier(p);this.feedback(p,`Gripping ${grip+1} — press again to release`);
    });
    this.onMessage('signal',(c,value)=>{const p=this.state.players.get(c.sessionId);if(p&&['LIFT','WAIT','LEFT','RIGHT'].includes(value)&&Date.now()-p.lastSignal>500){p.signal=value;p.lastSignal=Date.now();p.signalUntil=Date.now()+2000;}});
    this.onMessage('mode',(c,value)=>{if(c.sessionId===this.state.host&&this.state.phase==='lobby'&&['beam','wheel','competitive','championship'].includes(value))this.state.mode=value==='beam'?'competitive':value;});
    this.onMessage('beamMap',(c,value)=>{if(c.sessionId===this.state.host&&this.state.phase==='lobby'&&validBeamMap(value))this.state.beamMap=value;});
    this.onMessage('rescue',c=>{const p=this.state.players.get(c.sessionId),b=p&&this.state.teams[p.team];if(this.state.mode==='competitive'&&this.state.racePhase==='racing'&&b&&!b.delivered&&!b.dnf&&b.protection===0)recoverTeam(b,[...this.state.players.values()].filter(q=>q.team===p!.team));});
    this.onMessage('championshipLength',(c,value)=>{if(c.sessionId===this.state.host&&this.state.phase==='lobby'&&validChampionshipLength(value))this.state.championshipLength=value;});
    this.onMessage('material',(c,id)=>{const p=this.state.players.get(c.sessionId);if(p&&this.state.phase==='lobby'&&validMaterial(id))p.materialId=id;});
    this.onMessage('start',c=>{if(c.sessionId===this.state.host&&this.state.phase==='lobby'&&this.clients.length>=2){this.restart(false);this.state.phase='test';this.lock();}});
    this.onMessage('reset',c=>{if(c.sessionId===this.state.host&&this.state.phase==='test'&&Date.now()-this.lastReset>1000){this.restart(true);}});
    this.onMessage('restart',c=>{if(c.sessionId===this.state.host&&this.state.phase==='test'&&Date.now()-this.lastReset>1000){this.restart(false);}});
    this.onMessage('lobby',c=>{if(c.sessionId===this.state.host){this.state.phase='lobby';this.unlock();for(const p of this.state.players.values()){p.grip=-1;p.inputX=p.inputZ=p.vx=p.vz=0;}}});
  }
  private lastReset=0;
  feedback(p:Player,text:string){p.feedback=text;p.feedbackUntil=Date.now()+2500;}
  restart(checkpoint:boolean){
    this.lastReset=Date.now();
    this.routePlan=[];this.routeMaterialWorld=undefined;this.state.routeIds.clear();
    if(this.state.mode==='championship'&&this.state.championshipLength>2){
      this.state.routeSeed=randomInt(0x100000000);const ids=selectCourseIds(this.state.championshipLength,this.state.routeSeed);this.state.routeIds.push(...ids);this.routePlan=assembleRoute(ids);this.routeMaterialWorld=routeWorld(this.routePlan);
    }
    if(this.state.mode==='competitive'){
      this.state.raceResets=Math.max(this.state.raceResets,...this.state.teams.map(b=>b.resets))+1;this.state.teams.clear();this.state.elapsed=0;this.state.racePhase='countdown';this.state.countdown=3;
      const players=[...this.state.players.entries()].filter(([,p])=>p.connected);
      for(const p of this.state.players.values()){p.team=p.end=p.grip=-1;p.inputX=p.inputZ=p.vx=p.vz=0;}
      for(let i=0;i+1<players.length;i+=2){const b=new BeamTeam();b.resets=this.state.raceResets;b.name='Team '+(i/2+1);b.members=players[i][1].name+' + '+players[i+1][1].name;this.state.teams.push(b);
        for(let end=0;end<2;end++){const p=players[i+end][1];p.team=i/2;p.end=end===0?0:7;p.rotation=b.angle-GRIPS[p.end].side*Math.PI/2;const point=gripPosition(b,p.end);p.x=point.x;p.z=point.z;}}
      for(const [,p] of players)if(p.team<0){p.x=8;p.z=7;this.feedback(p,'Spectating this round — Wheelbarrow supports odd counts');}
      return;
    }
    if((this.state.mode==='wheel'||this.state.mode==='championship')){this.state.leg=0;this.state.legResults.clear();this.state.standings.clear();for(const [id,p]of this.state.players){p.legSpills=0;const total=new ChampionshipResult();Object.assign(total,{playerId:id,name:p.name,color:p.color});this.state.standings.push(total);}this.state.racePhase='countdown';this.state.countdown=WHEEL_CONFIG.countdownSeconds;this.state.elapsed=0;this.state.raceResets++;this.state.finishCount=0;this.state.firstFinishAt=-1;this.state.results.clear();this.state.material.clear();let slot=0;for(const p of this.state.players.values()){resetCart(p,slot++,this.state.players.size);p.grip=-1;p.inputX=p.inputZ=p.vx=p.vz=0;p.lastInput=0;}return;}
    resetBeam(this.state.beam,checkpoint);this.state.beam.resets++;
    for(const p of this.state.players.values()){
      p.grip=-1;p.inputX=p.inputZ=p.vx=p.vz=0;p.lastInput=0;p.feedback='';
      const spawnGrip=[0,7,2,5,1,6,3,4][p.color];const point=gripPosition(this.state.beam,spawnGrip);p.x=point.x;p.z=point.z;
      p.rotation=this.state.beam.angle-GRIPS[spawnGrip].side*Math.PI/2;
    }
  }
  positionCarrier(p:Player){const point=gripPosition(this.state.mode==='competitive'?this.state.teams[p.team]:this.state.beam,p.grip);p.x=point.x;p.z=point.z;p.rotation=(this.state.mode==='competitive'?this.state.teams[p.team]:this.state.beam).angle-GRIPS[p.grip].side*Math.PI/2;}
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
    try{if(consented)throw Error('left');await this.allowReconnection(c,CONFIG.reconnectSeconds);p.connected=true;p.lastInput=Date.now();if(this.state.mode==='competitive'&&p.team>=0){const b=this.state.teams[p.team];if(b&&!b.delivered){const point=gripPosition(b,p.end);p.x=point.x;p.z=point.z;}}this.feedback(p,(this.state.mode==='wheel'||this.state.mode==='championship')?'Reconnected — continue racing':'Reconnected — grab again when ready');if(!this.state.host)this.state.host=c.sessionId;}
    catch{if(this.state.mode==='championship')this.departChampionship(c.sessionId);this.state.players.delete(c.sessionId);this.transferHost(c.sessionId);this.reconcileWheelResults();}
  }
  departChampionship(id:string){
    if(this.state.phase!=='test'||this.state.racePhase==='results')return;
    const total=this.state.standings.find(r=>r.playerId===id);if(total)total.dnf=true;
    if(!this.state.legResults.some(r=>r.playerId===id&&r.leg===this.state.leg)){
      const p=this.state.players.get(id);if(p){const r=new ChampionshipResult();Object.assign(r,{playerId:id,name:p.name,color:p.color,leg:this.state.leg,dnf:true,spills:p.legSpills,time:this.state.elapsed});this.state.legResults.push(r);}
    }
    this.rankChampionship();
  }
  rankChampionship(){
    for(const total of this.state.standings){const results=this.state.legResults.filter(r=>r.playerId===total.playerId&&!r.dnf);total.spills=results.reduce((sum,r)=>sum+r.spills,0);total.time=results.reduce((sum,r)=>sum+r.time,0);total.completed=results.length;total.finishOrder=results.at(-1)?.finishOrder??0;}
    [...this.state.standings].sort((a,b)=>Number(a.dnf)-Number(b.dnf)||b.completed-a.completed||compareResults(a,b)||a.color-b.color).forEach((r,i)=>r.place=i+1);
  }
  reconcileChampionship(){
    if(this.state.phase!=='test'||this.state.racePhase!=='racing')return;
    for(const [id,p]of this.state.players)if(p.finishOrder&&!this.state.legResults.some(r=>r.playerId===id&&r.leg===this.state.leg)){
      const r=new ChampionshipResult();Object.assign(r,{playerId:id,name:p.name,color:p.color,leg:this.state.leg,spills:p.legSpills,time:p.finishTime,finishOrder:p.finishOrder,completed:1});this.state.legResults.push(r);
    }
    const leg=this.state.legResults.filter(r=>r.leg===this.state.leg&&!r.dnf);[...leg].sort(compareResults).forEach((r,i)=>r.place=i+1);
    this.rankChampionship();
    if([...this.state.players.values()].every(p=>p.finishOrder>0)){
      if(this.state.leg<(this.routePlan.length||2)-1&&this.state.players.size){this.state.racePhase='intermission';this.state.countdown=5;}
      else this.state.racePhase='results';
    }
  }
  beginSecondLeg(){
    this.state.leg++;this.state.elapsed=0;this.state.finishCount=0;this.state.firstFinishAt=-1;this.state.racePhase='racing';this.state.countdown=0;
    // Keep positions, speed, instability, reload, materials and every earlier snapshot.
    for(const p of this.state.players.values()){p.checkpoint=1;p.finishOrder=0;p.finishTime=0;p.finishCrossed=false;p.legSpills=0;}
  }
  tickChampionship(dt:number,now:number){
    if(this.state.racePhase==='countdown'){this.state.countdown=Math.max(0,this.state.countdown-dt);if(this.state.countdown<1e-8){this.state.countdown=0;this.state.racePhase='racing';}return;}
    if(!['racing','intermission','results'].includes(this.state.racePhase))return;
    if(this.state.racePhase==='intermission'){
      this.state.countdown=Math.max(0,this.state.countdown-dt);
      if(this.state.countdown<1e-8){this.beginSecondLeg();return;}
    }
    const track=this.currentTrack(),players=[...this.state.players.values()],material=[...this.state.material];
    if(this.state.racePhase==='racing')this.state.elapsed+=dt;
    // Offscreen debris remains live in both courses; this world context includes both.
    const world={...COURSE_TWO,startArea:(x:number,z:number)=>COURSE_TWO.startArea!(x,z)||championshipTrack(0).path.some((a,i,path)=>i>0&&distanceToSegment(x,z,path[i-1],a)<2.8)};
    stepMaterial(material,dt,this.routeMaterialWorld??world);
    for(const p of players){const active=p.connected&&now-p.lastInput<300,spills=p.spills,previousZ=p.z,racing=this.state.racePhase==='racing'&&!p.finishOrder;
      stepCart(p,active?p.inputX:0,active?p.inputZ:0,dt,material,track);
      if(this.state.leg>0){const previous=this.routePlan[this.state.leg-1]?.track??championshipTrack(0),limit=Math.max(previous.ramp.edgeZ-WHEEL_CONFIG.cartRadius-WHEEL_CONFIG.cartOffset,Math.min(previousZ,previous.finishZ+WHEEL_CONFIG.cartOffset+WHEEL_CONFIG.cartRadius));if(p.z>limit){p.z=limit;p.speed=0;}}
      if(p.spills>spills){if(racing)p.legSpills+=p.spills-spills;spillMaterial(p,material,value=>{const b=new SpilledMaterial();Object.assign(b,value);this.state.material.push(b);material.push(b);},track);}
    }
    collideStagingCarts(players,track);
    if(this.state.racePhase==='racing'){this.state.finishCount=finishCarts(players,this.state.elapsed,this.state.finishCount,track);this.reconcileChampionship();}
  }
  reconcileWheelResults(){
    if(this.state.mode==='championship'){this.reconcileChampionship();return;}
    if(this.state.phase!=='test'||this.state.mode!=='wheel'||this.state.racePhase!=='racing')return;
    const players=[...this.state.players.values()];
    for(const p of players)if(p.finishOrder&&!this.state.results.some(r=>r.finishOrder===p.finishOrder)){const result=new RaceResult();Object.assign(result,{name:p.name,color:p.color,spills:p.spills,time:p.finishTime,finishOrder:p.finishOrder});this.state.results.push(result);}
    [...this.state.results].sort(compareResults).forEach((r,i)=>{r.place=i+1;});
    if(shouldEndRace(players,this.state.elapsed,this.state.firstFinishAt))this.state.racePhase='results';
  }
  transferHost(id:string){if(this.state.host===id)this.state.host=Array.from(this.state.players.entries()).find(([key,p])=>key!==id&&p.connected)?.[0]??'';}
  tick(dt:number){
    const now=Date.now();
    for(const p of this.state.players.values()){if(p.signalUntil<now)p.signal='';if(p.feedbackUntil<now)p.feedback='';}
    if(this.state.phase==='test'&&this.state.mode==='championship'){this.tickChampionship(dt,now);return;}
    if(this.state.phase==='test'&&this.state.mode==='competitive'){
      if(this.state.racePhase==='countdown'){this.state.countdown=Math.max(0,this.state.countdown-dt);if(!this.state.countdown)this.state.racePhase='racing';return;}
      if(this.state.racePhase!=='racing')return;
      this.state.elapsed+=dt;
      this.state.teams.forEach((b,index)=>{
        if(b.delivered||b.dnf)return;
        const members=[...this.state.players.values()].filter(p=>p.team===index);
        if(members.length<2){b.dnf=true;return;}
        if(members.some(p=>!p.connected)){b.leftSupported=members.some(p=>p.connected&&p.grip===0);b.rightSupported=members.some(p=>p.connected&&p.grip===7);b.waiting+=dt;if(this.state.elapsed>=240)b.dnf=true;return;}
        const inputs=members.map(p=>[p.inputX,p.inputZ]);
        members.forEach(p=>{if(now-p.lastInput>=300)p.inputX=p.inputZ=0;});
        stepChaosTeam(b,members,dt,this.state.elapsed,this.state.beamMap);
        members.forEach((p,i)=>{p.inputX=inputs[i][0];p.inputZ=inputs[i][1];if(p.grip>=0)this.positionCarrier(p);});
        if(b.delivered)b.finishTime=this.state.elapsed+b.penalty;
        if(!b.delivered&&this.state.elapsed>=240)b.dnf=true;

      });
      [...this.state.teams].filter(b=>b.delivered).sort((a,b)=>a.finishTime-b.finishTime).forEach((b,i)=>b.place=i+1);
      if(this.state.teams.every(b=>b.delivered||b.dnf))this.state.racePhase='results';return;
    }
    if(this.state.phase==='test'&&(this.state.mode==='wheel'||this.state.mode==='championship')){
      if(this.state.racePhase==='countdown'){this.state.countdown=Math.max(0,this.state.countdown-dt);if(this.state.countdown===0)this.state.racePhase='racing';return;}
      if(this.state.racePhase!=='racing'&&this.state.racePhase!=='results')return;
      if(this.state.racePhase==='racing')this.state.elapsed+=dt;
      const players=Array.from(this.state.players.values());
      const material=Array.from(this.state.material);
      stepMaterial(material,dt);
      for(const p of players){const active=p.connected&&now-p.lastInput<300,spills=p.spills;stepCart(p,active?p.inputX:0,active?p.inputZ:0,dt,material);
        if(p.spills>spills)spillMaterial(p,material,value=>{const brick=new SpilledMaterial();Object.assign(brick,value);this.state.material.push(brick);material.push(brick);});
      }
      collideStagingCarts(players);
      this.state.finishCount=finishCarts(players,this.state.elapsed,this.state.finishCount);
      if(this.state.finishCount&&this.state.firstFinishAt<0)this.state.firstFinishAt=this.state.elapsed;
      this.reconcileWheelResults();
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

function distanceToSegment(x:number,z:number,a:{x:number;z:number},b:{x:number;z:number}){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);}
