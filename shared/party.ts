/** Mode boundary consumed by Party Night and the future shared podium. */
export interface PartyModeResult { mode:string; entries:{members:string[];eligible:boolean;rank:number;native:string;stats:Record<string,number>}[]; skipped?:string }
export interface PartyModeAdapter { id:string; title:string; available:boolean; controls:string; maxPoints:100 }
/** Future #16 implementation contract. Register only after native Tower Rush is integrated.
 * Inputs/results stay server-owned; member IDs are Party session IDs, never display names.
 * reset/dispose must cancel every timer and release every listener. */
export interface TowerRushPartyAdapter {
 start(players:readonly Pick<PartyPerson,'id'|'name'|'look'>[],options:{durationSeconds:60;epoch:number;now:number}):void;
 input(playerId:string,data:unknown,epoch:number):void;
 tick(now:number):void;
 view(playerId:string):unknown;
 result():PartyModeResult|null;
 reset():void;
 dispose():void;
}
export const PARTY_MODES:PartyModeAdapter[]=[
 {id:'wheel',title:'Wheelbarrow Championship · 3 races',available:true,controls:'WASD or joystick. Protect your load: spills rank before time.',maxPoints:100},
 {id:'beam',title:'Beam Carry · Construction Chaos',available:true,controls:'WASD or joystick. Space / ACTION grabs or releases. Carry with your partner. Recover team costs 5 seconds.',maxPoints:100},
 {id:'trivia',title:'Toolbox Trivia · 5 questions',available:true,controls:'Reader reads aloud; selector taps an answer. Roles swap each question. A connected partner covers a disconnected worker.',maxPoints:100},
 {id:'tower',title:'Crane Challenge · 60-second Tower Rush',available:false,controls:'Awaiting finished milestone #16 adapter.',maxPoints:100},
];
export const PARTY_PLAYLIST=PARTY_MODES.filter(m=>m.available);
export type PartyPerson={id:string;name:string;order:number;points:number;wins:number;look:{hat:number;vest:number;expression:string};stats:Record<string,number>};
// Competition ranks share points; a DNF always earns zero. One team earns 100
// only by completing the objective (or answering at least one trivia question).
export function partyPoints(rank:number,competitors:number,eligible:boolean){return eligible?competitors<=1?100:Math.round(100*(competitors-rank)/(competitors-1)):0;}
export function applyPartyResult(people:Map<string,PartyPerson>,result:PartyModeResult){
 if(result.skipped)return;
 for(const entry of result.entries)for(const id of entry.members){const p=people.get(id);if(!p)continue;p.points+=partyPoints(entry.rank,result.entries.length,entry.eligible);if(entry.rank===1&&entry.eligible)p.wins++;for(const [key,value]of Object.entries(entry.stats))p.stats[key]=(p.stats[key]??0)+value;}
}
export function partyRanking(people:Iterable<PartyPerson>){return [...people].sort((a,b)=>b.points-a.points||b.wins-a.wins||a.order-b.order);}
export function partyPodium(people:Iterable<PartyPerson>,results:PartyModeResult[]){
 const ranking=partyRanking(people).map((p,i)=>({...p,place:i+1}));
 const award=(key:string,title:string,low=false)=>{const entries=ranking.filter(p=>Number.isFinite(p.stats[key]));entries.sort((a,b)=>(low?1:-1)*(a.stats[key]-b.stats[key])||a.order-b.order);return entries[0]?{title,playerId:entries[0].id,value:entries[0].stats[key],stat:key}:null;};
 return {version:1,kind:'party-night',winnerId:ranking[0]?.id??null,topThree:ranking.slice(0,3),ranking,results,awards:[award('wheelSpills','Steady Hands',true),award('beamRecoveries','Safety Comeback Crew'),award('triviaCorrect','Toolbox Brain')].filter(Boolean)};
}
