export const WAITING_FOR_TEAMMATE='Waiting for a teammate — return to lobby to invite another worker.';
interface Worker {connected:boolean;team:number;end:number;grip:number;}
interface Team {delivered:boolean;dnf:boolean;protection:number;}
interface Context {mode:string;phase:string;racePhase:string;teams:ArrayLike<Team>;players:{values():IterableIterator<Worker>};beam?:{delivered:boolean};}

// One action policy for authoritative messages and desktop/mobile presentation.
export function beamActionState(state:Context,me:Worker|undefined){
 const inactive=(message:string)=>({enabled:false,attached:false,message});
 if(!me?.connected)return inactive('Waiting for your worker to reconnect.');
 if(state.mode==='wheel'||state.mode==='championship')return inactive('');
 if(state.phase!=='test')return inactive('Waiting for the host to start.');
 if(state.mode==='competitive'){
  const team=state.teams[me.team];
  if(!team||![0,7].includes(me.end))return inactive('Spectating this round — no active team assignment.');
  if(team.dnf)return inactive('Team DNF — return to lobby or replay with a teammate.');
  if(team.delivered)return inactive('Delivered — wait for results or replay.');
  if(state.racePhase!=='racing')return inactive(state.racePhase==='countdown'?'Get ready — grab when the round starts.':'Round complete — wait for a teammate before replaying.');
  const members=[...state.players.values()].filter(p=>p.team===me.team&&[0,7].includes(p.end));
  if(members.length!==2)return inactive(WAITING_FOR_TEAMMATE);
  if(members.some(p=>!p.connected))return inactive('Partner reconnecting — controls paused.');
  if(team.protection>0)return inactive('Team recovered — controls resume shortly.');
 }else if(state.beam?.delivered)return inactive('Delivered — wait for the host to restart.');
 return {enabled:true,attached:me.grip>=0,message:''};
}
