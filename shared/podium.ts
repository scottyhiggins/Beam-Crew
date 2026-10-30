import {validateWorkerLook,type WorkerLook} from './cosmetics.js';
export interface PodiumWorker {id:string;name:string;look?:WorkerLook;connected:boolean}
export interface PodiumEntry {id:string;name:string;place:number;dnf?:boolean;detail:string;award?:string;workers:PodiumWorker[]}
/** Presentation only: never assigns or repairs authoritative places. */
export function crewPodium(state:any):PodiumEntry[]{
 const players=[...state.players.entries()] as [string,any][];
 const worker=([id,p]:[string,any]):PodiumWorker=>({id,name:p.name,look:validateWorkerLook(p),connected:p.connected});
 const team=state.mode==='competitive', championship=state.mode==='championship';
 const rows=team?[...state.teams]:championship?[...state.standings]:[...state.results];
 const used=new Set<string>();
 const entries:PodiumEntry[]=rows.map((r:any,i:number)=>{
 const members=players.filter(([id,p])=>team?p.team===i:championship?id===r.playerId:p.color===r.color&&p.finishOrder===r.finishOrder);
 members.forEach(([id])=>used.add(id));
 return {id:team?'team-'+i:championship?r.playerId:'finish-'+r.finishOrder,name:r.name,place:r.place,dnf:!!r.dnf,
 detail:team?r.members+' · '+(r.dnf?'DNF':r.finishTime.toFixed(2)+'s'):r.spills+' spills · '+r.time.toFixed(2)+'s'+(championship?' · '+r.completed+'/'+state.championshipLength+' courses':''),
 award:!r.dnf&&r.place===1?'Employee of the Month':!team&&!r.dnf&&r.spills===0?'Toolbox Genius · zero spills':undefined,workers:members.map(worker)};
 });
 for(const pair of players)if(!used.has(pair[0]))entries.push({id:pair[0],name:pair[1].name,place:0,dnf:true,detail:pair[1].connected?'Did not finish':'Disconnected · did not finish',workers:[worker(pair)]});
 return entries.sort((a,b)=>(a.dnf||!a.place?999:a.place)-(b.dnf||!b.place?999:b.place));
}
export function podiumPlace(entry:PodiumEntry){return !entry.dnf&&Number.isInteger(entry.place)&&entry.place>0&&entry.place<=3?entry.place:0;}
