import {randomInt} from 'node:crypto';
import {QUESTIONS} from './trivia-questions.js';
import type {TriviaView,TriviaPhase} from '../shared/trivia.js';
export function shuffle<T>(items:readonly T[]):T[]{const out=[...items];for(let i=out.length-1;i>0;i--){const j=randomInt(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
export class TriviaGame {
 phase:TriviaPhase='lobby';count=10;round=0;epoch=0;deadline=0;host='';code='';
 players=new Map<string,{name:string;connected:boolean;team:number}>();
 teams:{name:string;members:string[];score:number;time:number;answer:number|null;elapsed:number;correct:boolean}[]=[];
 deck=shuffle(QUESTIONS);order:number[]=[];
 add(id:string,name:string){if(this.phase!=='lobby'||this.players.size>=8)return false;this.players.set(id,{name,connected:true,team:-1});if(!this.host)this.host=id;this.assign();return true;}
 assign(){let i=0;for(const p of this.players.values())p.team=Math.floor(i++/2);}
 hostTransfer(){if(!this.players.get(this.host)?.connected)this.host=[...this.players].find(([,p])=>p.connected)?.[0]??'';}
 disconnect(id:string,remove=false){const p=this.players.get(id);if(p)p.connected=false;if(remove){this.players.delete(id);if(this.phase==='lobby')this.assign();}this.hostTransfer();}
 reconnect(id:string){const p=this.players.get(id);if(p){p.connected=true;if(!this.host)this.host=id;}}
 configure(id:string,n:unknown){if(id===this.host&&this.phase==='lobby'&&[5,10,15].includes(n as number))this.count=n as number;}
 start(id:string,now:number){if(id!==this.host||this.phase!=='lobby'||this.players.size<2||this.players.size%2||[...this.players.values()].some(p=>!p.connected))return false;
 this.assign();const ids=[...this.players.keys()];this.teams=[];for(let i=0;i<ids.length;i+=2)this.teams.push({name:'Team '+(i/2+1),members:ids.slice(i,i+2),score:0,time:0,answer:null,elapsed:0,correct:false});this.deck=shuffle(QUESTIONS).slice(0,this.count);this.round=0;this.begin(now);return true;}
 begin(now:number){this.phase='question';this.epoch++;this.deadline=now+20000;this.order=shuffle([0,1,2,3]);for(const t of this.teams){t.answer=null;t.correct=false;t.elapsed=0;}}
 role(id:string){const t=this.teams.find(t=>t.members.includes(id));if(!t)return undefined;return t.members.indexOf(id)===this.round%2?'reader':'selector';}
 answer(id:string,data:unknown,now:number){this.tick(now);if(this.phase!=='question'||!this.players.get(id)?.connected||this.role(id)!=='selector'||!data||typeof data!=='object')return false;const a=data as {choice:unknown;epoch:unknown};if(a.epoch!==this.epoch||!Number.isInteger(a.choice)||Number(a.choice)<0||Number(a.choice)>3)return false;const t=this.teams.find(t=>t.members.includes(id))!;if(t.answer!==null)return false;t.answer=Number(a.choice);t.elapsed=Math.max(0,20000-(this.deadline-now));t.correct=this.order[t.answer]===0;if(this.teams.every(t=>t.answer!==null))this.reveal(now);return true;}
 reveal(now:number){for(const t of this.teams)if(t.correct){t.score+=1000;t.time+=t.elapsed;}this.phase='reveal';this.deadline=now+6000;}
 tick(now:number){if(now<this.deadline)return;if(this.phase==='question')this.reveal(now);else if(this.phase==='reveal'){this.round++;if(this.round>=this.count){this.phase='podium';this.deadline=0;}else this.begin(now);}}
 lobby(id:string){if(id!==this.host)return false;this.phase='lobby';this.teams=[];this.assign();return true;}
 view(id:string,now:number):TriviaView {
 const reveal=this.phase==='reveal',active=this.phase==='question'||reveal,q=this.deck[this.round];const role=this.role(id),team=this.teams.find(t=>t.members.includes(id));
 const v:TriviaView={code:this.code,host:this.host,phase:this.phase,count:this.count,round:Math.min(this.round+1,this.count),remaining:Math.max(0,Math.ceil((this.deadline-now)/1000)),epoch:this.epoch,players:[...this.players].map(([id,p])=>({id,...p})),teams:this.teams.map(t=>({name:t.name,members:t.members.map(id=>this.players.get(id)?.name??'Departed worker'),score:t.score,time:t.time,answered:t.answer!==null,...(reveal?{correct:t.correct,choice:t.answer===null?'Timed out':q.answers[this.order[t.answer]]}:{})}))};
 if(active&&team){v.role=role;v.partner=this.players.get(team.members.find(p=>p!==id)!)?.name??'Departed worker';v.category=q.category;v.submitted=team.answer!==null;if(role==='reader'||reveal)v.question=q.question;if(role==='selector'||reveal)v.answers=this.order.map(i=>q.answers[i]);if(reveal)v.correct=q.answers[0];}return v;
 }
}
