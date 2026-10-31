import {randomInt} from 'node:crypto';
import {QUESTIONS} from './trivia-questions.js';
import type {TriviaView,TriviaPhase} from '../shared/trivia.js';
export function shuffle<T>(items:readonly T[]):T[]{const out=[...items];for(let i=out.length-1;i>0;i--){const j=randomInt(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
export class TriviaGame {
 phase:TriviaPhase='lobby';count=10;round=0;epoch=0;deadline=0;host='';code='';
 players=new Map<string,{name:string;connected:boolean}>();
 scores=new Map<string,{name:string;score:number;time:number;answer:number|null;elapsed:number;correct:boolean}>();
 deck=shuffle(QUESTIONS);order:number[]=[];
 add(id:string,name:string){if(this.phase!=='lobby'||this.players.size>=8||this.players.has(id))return false;this.players.set(id,{name,connected:true});if(!this.host)this.host=id;return true;}
 hostTransfer(){if(!this.players.get(this.host)?.connected)this.host=[...this.players].find(([,p])=>p.connected)?.[0]??'';}
 disconnect(id:string,remove=false){const p=this.players.get(id);if(p)p.connected=false;if(remove)this.players.delete(id);this.hostTransfer();}
 reconnect(id:string){const p=this.players.get(id);if(p){p.connected=true;if(!this.host)this.host=id;}}
 configure(id:string,n:unknown){if(id===this.host&&this.phase==='lobby'&&[5,10,15].includes(n as number))this.count=n as number;}
 start(id:string,now:number){if(id!==this.host||this.phase!=='lobby'||this.players.size<2||[...this.players.values()].some(p=>!p.connected))return false;
 this.scores.clear();for(const [id,p]of this.players)this.scores.set(id,{name:p.name,score:0,time:0,answer:null,elapsed:0,correct:false});this.deck=shuffle(QUESTIONS).slice(0,this.count);this.round=0;this.begin(now);return true;}
 begin(now:number){this.phase='question';this.epoch++;this.deadline=now+20000;this.order=shuffle([0,1,2,3]);for(const p of this.scores.values()){p.answer=null;p.correct=false;p.elapsed=0;}}
 answer(id:string,data:unknown,now:number){this.tick(now);if(this.phase!=='question'||!this.players.get(id)?.connected||!data||typeof data!=='object')return false;const a=data as {choice:unknown;epoch:unknown};if(a.epoch!==this.epoch||!Number.isInteger(a.choice)||Number(a.choice)<0||Number(a.choice)>3)return false;const p=this.scores.get(id);if(!p||p.answer!==null)return false;p.answer=Number(a.choice);p.elapsed=Math.max(0,20000-(this.deadline-now));p.correct=this.order[p.answer]===0;if([...this.scores].every(([id,p])=>!this.players.has(id)||p.answer!==null))this.reveal(now);return true;}
 reveal(now:number){if(this.phase!=='question')return;for(const p of this.scores.values())if(p.correct){p.score+=1000;p.time+=p.elapsed;}this.phase='reveal';this.deadline=now+4000;}
 tick(now:number){if(now<this.deadline)return;if(this.phase==='question')this.reveal(now);else if(this.phase==='reveal'){this.round++;if(this.round>=this.count){this.phase='podium';this.deadline=0;}else this.begin(now);}}
 lobby(id:string){if(id!==this.host||this.phase!=='podium')return false;this.phase='lobby';this.scores.clear();return true;}
 ranking(){return [...this.scores].map(([id,p])=>({id,...p})).sort((a,b)=>b.score-a.score||a.time-b.time);}
 view(id:string,now:number):TriviaView {
 const reveal=this.phase==='reveal',active=this.phase==='question'||reveal,q=this.deck[this.round],me=this.scores.get(id);
 const v:TriviaView={code:this.code,host:this.host,phase:this.phase,count:this.count,round:Math.min(this.round+1,this.count),remaining:Math.max(0,Math.ceil((this.deadline-now)/1000)),epoch:this.epoch,players:[...this.players].map(([id,p])=>({id,...p})),standings:this.ranking().map(p=>({id:p.id,name:p.name,score:p.score,time:p.time,answered:p.answer!==null,...(reveal?{correct:p.correct,choice:p.answer===null?'Timed out':q.answers[this.order[p.answer]]}:{})}))};
 if(active&&me&&this.players.has(id)){v.category=q.category;v.question=q.question;v.answers=this.order.map(i=>q.answers[i]);v.submitted=me.answer!==null;if(reveal){v.correct=q.answers[0];v.feedback=me.correct;}}return v;
 }
}
