import {Client,ServerError} from '@colyseus/core';
import {randomInt} from 'node:crypto';
import {CrewRoom,roomsByCode} from './room.js';
import {TriviaGame} from './trivia-game.js';
import {Beam} from './state.js';
import {PARTY_PLAYLIST,applyPartyResult,partyRanking,partyPodium,type PartyPerson,type PartyModeResult} from '../shared/party.js';
export const partyRooms=new Map<string,PartyRoom>();

/** Runs existing native simulations inside one room; no child rooms or client scores. */
export class PartyRoom extends CrewRoom {
 partyPhase='lobby';index=-1;epoch=0;session=0;deadline=0;earliest=0;people=new Map<string,PartyPerson>();results:PartyModeResult[]=[];trivia:TriviaGame|null=null;notice='';roster:string[]=[];
 override acceptModeMessage(c:Client,data:unknown){return this.partyPhase==='playing'&&this.index<2&&this.roster.includes(c.sessionId)&&!!data&&typeof data==='object'&&(data as {partyEpoch?:unknown}).partyEpoch===this.epoch;}
 override onCreate(){
  super.onCreate();this.publicMatch=true; // disables native host start/reset/mode/lobby messages
  if(partyRooms.has(this.state.code)){roomsByCode.delete(this.state.code);const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';do{this.state.code=Array.from({length:5},()=>alphabet[randomInt(alphabet.length)]).join('');}while(partyRooms.has(this.state.code)||roomsByCode.has(this.state.code));this.setMetadata({code:this.state.code});}
  partyRooms.set(this.state.code,this);roomsByCode.delete(this.state.code);
  this.onMessage('partySync',c=>this.sendParty(c));
  this.onMessage('partyContinue',(c,data)=>{if(c.sessionId!==this.state.host||data?.epoch!==this.epoch)return;this.continueParty();this.publishParty();});
  this.onMessage('partyReplay',(c,data)=>{if(c.sessionId!==this.state.host||data?.epoch!==this.epoch||this.partyPhase!=='final')return;this.newSession();this.publishParty();});
  this.onMessage('partyAnswer',(c,data)=>{if(this.partyPhase==='playing'&&this.index===2&&data?.partyEpoch===this.epoch)this.trivia?.answer(c.sessionId,data,Date.now());});
  // CrewRoom owns the single Colyseus simulation interval; tick drives both layers.
 }
 override onJoin(c:Client,options:{name?:unknown;cosmetics?:unknown}){if(this.partyPhase!=='lobby')throw new ServerError(409,'Party in progress. Reconnect with your reserved place.');super.onJoin(c,options);this.publishParty();}
 override async onLeave(c:Client,consented:boolean){const leaving=super.onLeave(c,consented);this.trivia?.disconnect(c.sessionId);this.publishParty();await leaving;if(this.state.players.get(c.sessionId)?.connected)this.trivia?.reconnect(c.sessionId);this.publishParty();}
 connected(){return [...this.state.players.entries()].filter(([,p])=>p.connected);}
 newSession(){this.session++;this.index=-1;this.epoch++;this.partyPhase='lobby';this.results=[];this.people.clear();this.trivia=null;this.deadline=0;this.notice='';this.clearNative();void this.unlock();}
 clearNative(){this.state.phase='lobby';this.state.racePhase='waiting';this.state.elapsed=this.state.countdown=this.state.leg=this.state.finishCount=0;this.state.firstFinishAt=-1;this.state.results.clear();this.state.standings.clear();this.state.legResults.clear();this.state.teams.clear();this.state.routeIds.clear();this.routePlan=[];this.state.material.clear();this.state.beam=new Beam();for(const p of this.state.players.values()){Object.assign(p,{grip:-1,team:-1,end:-1,inputX:0,inputZ:0,vx:0,vz:0,speed:0,spills:0,legSpills:0,finishOrder:0,finishTime:0,finishCrossed:false,actions:0,feedback:'',signal:''});}}
 continueParty(){
  const now=Date.now();
  if(this.partyPhase==='lobby'){
   if(this.connected().length<2){this.notice='Invite at least two connected workers to start.';return;}
   this.people.clear();[...this.state.players].forEach(([id,p],order)=>this.people.set(id,{id,name:p.name,order,points:0,wins:0,look:{hat:p.hat,vest:p.vest,expression:p.expression},stats:{}}));
   void this.lock();this.next(now);return;
  }
  if(this.partyPhase==='intermission'&&now>=this.earliest){this.startMode(now);return;}
  if(this.partyPhase==='pairing'){
   if(this.connected().length>=2&&(this.index!==1||this.connected().length%2===0))this.startMode(now);
   else this.finishMode({mode:PARTY_PLAYLIST[this.index].id,entries:[],skipped:'Incomplete pairs: skipped for everyone; no Party Night points.'},now);
  }
 }
 next(now:number){this.clearNative();this.trivia=null;this.index++;this.epoch++;this.notice='';if(this.index>=PARTY_PLAYLIST.length){this.partyPhase='final';this.deadline=0;return;}this.partyPhase='intermission';this.earliest=now+3000;this.deadline=now+20000;}
 startMode(now:number){
  const active=this.connected().filter(([id])=>this.people.has(id));
  if(active.length<2||this.index===1&&active.length%2){this.partyPhase='pairing';this.epoch++;this.deadline=now+20000;this.notice=this.index===1?'Beam needs complete pairs. Reconnect within 20 seconds, or skip Beam for everyone.':'At least two workers needed. Reconnect within 20 seconds, or skip this game for everyone.';return;}
  // Reservations remain in the shared state; native modes only pair connected players.
  // Preserve reserved Player objects across mode boundaries.
  this.clearNative();this.roster=active.map(([id])=>id);this.epoch++;this.partyPhase='playing';this.notice='';
  if(this.index===2){this.trivia=new TriviaGame();this.trivia.code=this.state.code;this.trivia.count=5;for(const [id,p]of active)this.trivia.add(id,p.name);this.trivia.host=active.some(([id])=>id===this.state.host)?this.state.host:active[0][0];this.trivia.start(this.trivia.host,now);this.deadline=now+140000;return;}
  this.state.mode=this.index===0?'championship':'competitive';this.state.championshipLength=3;this.state.beamMap=2;
  this.restart(false);this.state.phase='test';this.deadline=now+(this.index===0?540000:250000);
 }
 private lastPartyPublish=0;
 override tick(dt:number){if(this.partyPhase==='playing'&&this.index<2)super.tick(dt);const now=Date.now();if(now-this.lastPartyPublish>=250){this.lastPartyPublish=now;this.partyTick(now);this.publishParty();}}
 partyTick(now:number){
  // Native reconnection restores the same Player; mirror connectivity into trivia every tick.
  if(this.trivia)for(const [id,p]of this.trivia.players)p.connected=!!this.state.players.get(id)?.connected;
  if(this.partyPhase==='intermission'&&now>=this.deadline){this.startMode(now);return;}
  if(this.partyPhase==='pairing'&&now>=this.deadline){if(this.connected().length>=2&&(this.index!==1||this.connected().length%2===0))this.startMode(now);else this.finishMode({mode:PARTY_PLAYLIST[this.index].id,entries:[],skipped:'Incomplete pairs: skipped for everyone; no Party Night points.'},now);return;}
  if(this.partyPhase!=='playing')return;
  if(this.index===2){this.trivia!.tick(now);if(this.trivia!.phase==='podium'||now>=this.deadline){const individuals=this.trivia!.ranking();this.finishMode({mode:'trivia',entries:individuals.map(t=>({members:[t.id],eligible:t.score>0,rank:individuals.findIndex(q=>q.score===t.score&&q.time===t.time)+1,native:`${t.score} points · ${(t.time/1000).toFixed(2)}s`,stats:{triviaCorrect:t.score/1000}}))},now);}return;}
  if(this.index===0&&this.state.racePhase==='racing'&&this.state.elapsed>=120){for(const [id,p]of this.state.players)if(!p.finishOrder){this.departChampionship(id);p.finishOrder=999;}this.reconcileChampionship();}
  if(this.state.racePhase==='results'||now>=this.deadline){
   if(this.index===0){const totals=[...this.state.standings].sort((a,b)=>b.completed-a.completed||a.spills-b.spills||a.time-b.time);this.finishMode({mode:'wheel',entries:totals.map(t=>({members:[t.playerId],eligible:t.completed===3,rank:totals.findIndex(q=>q.completed===t.completed&&q.spills===t.spills&&q.time===t.time)+1,native:`${t.completed}/3 races · ${t.spills} spills · ${t.time.toFixed(2)}s`,stats:{wheelSpills:t.spills,wheelCompleted:t.completed}}))},now);}
   else {const teams=[...this.state.teams].map((t,i)=>({t,members:this.roster.slice(i*2,i*2+2)})).sort((a,b)=>Number(b.t.delivered)-Number(a.t.delivered)||a.t.finishTime-b.t.finishTime);this.finishMode({mode:'beam',entries:teams.map(({t,members})=>({members,eligible:t.delivered,rank:teams.findIndex(q=>q.t.delivered===t.delivered&&q.t.finishTime===t.finishTime)+1,native:t.delivered?`${t.finishTime.toFixed(2)}s including penalties`:'DNF',stats:{beamRecoveries:t.recoveries,beamDelivered:Number(t.delivered)}}))},now);}
  }
 }
 finishMode(result:PartyModeResult,now:number){applyPartyResult(this.people,result);this.results.push(result);this.next(now);}
 sendParty(c:Client){c.send('partyView',{phase:this.partyPhase,index:this.index,epoch:this.epoch,session:this.session,code:this.state.code,host:this.state.host,remaining:Math.max(0,Math.ceil((this.deadline-Date.now())/1000)),canContinue:Date.now()>=this.earliest,notice:this.notice,players:[...this.state.players].map(([id,p])=>({id,name:p.name,connected:p.connected})),ranking:partyRanking(this.people.values()),results:this.results,trivia:this.trivia?.view(c.sessionId,Date.now()),podium:this.partyPhase==='final'?partyPodium(this.people.values(),this.results):null});}
 publishParty(){for(const [id,p]of this.state.players){const person=this.people.get(id);if(person)person.look={hat:p.hat,vest:p.vest,expression:p.expression};}for(const c of this.clients)this.sendParty(c);}
 override onDispose(){partyRooms.delete(this.state.code);}
}
