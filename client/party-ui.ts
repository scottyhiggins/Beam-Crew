import {copyInvite,copyCode} from './invite';
import {Podium} from './podium';
import type {Room} from 'colyseus.js';
import {PARTY_PLAYLIST,PARTY_MODES,partyPoints} from '../shared/party';
import './party.css';
export const partyPage=location.pathname==='/party.html';
const epochs=new WeakMap<Room,number>();
export function partyEpochFor(room:Room|null){return room?epochs.get(room):undefined;}
let shell:HTMLElement|undefined;
export function installParty(room:Room){
 shell?.remove();shell=document.createElement('section');shell.id='partyShell';shell.setAttribute('aria-label','Party Night');document.body.append(shell);document.body.classList.add('party-connected');
 const root=shell;const podiumHost=document.createElement('div');const podium=new Podium(podiumHost);let lastKey='';let view:any;let pendingAnswer='';
 const node=(tag:string,text:string,parent:HTMLElement=root)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};
 const button=(text:string,fn:()=>void,parent:HTMLElement=root)=>{const b=node('button',text,parent) as HTMLButtonElement;b.onclick=fn;return b;};
 room.onMessage('partyView',(v:any)=>{if(epochs.get(room)!==v.epoch)window.dispatchEvent(new Event('blur'));epochs.set(room,v.epoch);view=v;const tv=v.trivia;
  // Avoid replacing keyboard-focused controls on every timer update.
  const key=JSON.stringify({...v,remaining:0,trivia:tv?{...tv,remaining:0}:undefined});
  const timer=root.querySelector('[data-timer]');if(timer)timer.textContent=`${tv&&v.index===2?tv.remaining:v.remaining}s`;
  if(key===lastKey)return;lastKey=key;root.replaceChildren();if(v.phase!=='final')podium.clear();
  const playing=v.phase==='playing',trivia=playing&&v.index===2,host=v.host===room.sessionId;
  root.classList.toggle('trivia-playing',trivia);root.classList.toggle('compact',playing&&!trivia);document.body.classList.toggle('party-overlay',!playing||trivia);
  if(playing&&!trivia){node('p',`Round ${v.index+1}/${PARTY_PLAYLIST.length}`);return;}
  node('p',`PARTY NIGHT · ${v.code} · ${v.phase==='final'?'SHIFT COMPLETE':v.index<0?'LOBBY':`${Math.min(v.index+1,3)}/3`}`);
  if(!['lobby','final'].includes(v.phase)){const timerNode=node('span',`${trivia?tv.remaining:v.remaining}s`);timerNode.dataset.timer='true';}
  if(v.notice)node('p',v.notice);
  if(playing&&!trivia){node('strong',PARTY_PLAYLIST[v.index].title);node('small','Party points are awarded once this whole mode ends.');}
  else {
   node('h1',v.phase==='final'?'EMPLOYEE OF THE MONTH':v.phase==='lobby'?'CLOCK IN TO PARTY':v.phase==='pairing'?'WAITING FOR COMPLETE PAIRS':trivia?'TOOLBOX TRIVIA':'NEXT UP');
   if(['lobby','intermission','pairing'].includes(v.phase)){
    const code=node('strong',v.code);code.className='party-code';const codeButton=button('Copy Code',()=>void copyCode(v.code,codeButton));
    const inviteButton=button('Copy Invite Link',()=>void copyInvite(location.origin+'/party.html?room='+v.code,inviteButton));
   }
   if(v.phase==='lobby'){
    node('p','Wheelbarrow Championship (3 races) → Beam Carry (Construction Chaos) → Toolbox Trivia (5 questions).');

    const ul=node('ul','');v.players.forEach((p:any)=>node('li',`${p.name}${p.id===v.host?' · HOST':''}${p.connected?'':' · reconnecting'}`,ul));
    node('p','Beam pairs follow join order. Odd crews can skip Beam after a 20-second reconnect window.');

   }
   if(v.phase==='intermission'){node('h2',PARTY_PLAYLIST[v.index].title);node('p',PARTY_PLAYLIST[v.index].controls);node('p','Host can continue after 3 seconds. Automatically continues after 20 seconds.');}
   if(trivia){
    node('h2',`Question ${tv.round}/${tv.count} · FREE-FOR-ALL`);
    node('h2',tv.question??'');
    const answerGrid=node('div','');answerGrid.className='party-answers';if(tv.answers)tv.answers.forEach((answer:string,choice:number)=>{const key=v.epoch+':'+tv.epoch;const b=button(answer,()=>{},answerGrid);const submit=()=>{if(tv.phase!=='question'||tv.submitted||pendingAnswer===key)return;pendingAnswer=key;b.classList.add('locked');b.textContent='✓ '+answer;answerGrid.querySelectorAll('button').forEach(b=>b.disabled=true);room.send('partyAnswer',{choice,epoch:tv.epoch,partyEpoch:v.epoch});};b.onpointerdown=e=>{e.preventDefault();submit();};b.onclick=submit;b.disabled=tv.phase!=='question'||tv.submitted||pendingAnswer===key;});
    if(tv.correct)node('p','Correct: '+tv.correct);
    node('p',tv.standings.map((t:any)=>`${t.name}: ${t.score} pts`).join(' · '));
   }
   if(v.phase==='final'){
    const p=v.podium;root.append(podiumHost);podium.update(p.ranking.map((r:any)=>({id:r.id,name:r.name,place:r.place,detail:r.points+' Party points · '+r.wins+' mode wins',award:r.place===1?'Employee of the Month':p.awards.find((a:any)=>a.playerId===r.id)?.title,workers:[{id:r.id,name:r.name,look:r.look,connected:v.players.find((w:any)=>w.id===r.id)?.connected??false}]})));node('h2',p.ranking[0]?.name??'Shift complete');node('p','Top three: '+p.topThree.map((r:any)=>`#${r.place} ${r.name} · ${r.points} pts`).join(' | '));
    for(const a of p.awards)node('p',`${a.title}: ${p.ranking.find((r:any)=>r.id===a.playerId)?.name} · ${a.value} ${{wheelSpills:'racing spills',beamRecoveries:'team recoveries',triviaCorrect:'correct answers'}[a.stat as string]??'recorded actions'}`);
    if(host)button('Play another Party Night',()=>room.send('partyReplay',{epoch:v.epoch}));
   }
  }
  if(!playing&&v.ranking.length){const details=node('details','') as HTMLDetailsElement;details.open=!playing;node('summary','Overall leaderboard · up to 100 points per mode',details);const ol=node('ol','',details);v.ranking.forEach((p:any)=>node('li',`${p.name} · ${p.points} pts · ${p.wins} mode wins`,ol));
   for(const result of v.results){node('h3',PARTY_MODES.find(m=>m.id===result.mode)?.title??result.mode,details);if(result.skipped)node('p',result.skipped,details);else for(const e of result.entries)node('p',`${e.members.map((id:string)=>v.ranking.find((p:any)=>p.id===id)?.name??'Worker').join(' + ')} · ${e.native} → ${partyPoints(e.rank,result.entries.length,e.eligible)} Party pts each`,details);}
  }
  if(host&&['lobby','intermission','pairing'].includes(v.phase)){const b=button(v.phase==='lobby'?'Start Party Night':v.phase==='pairing'?'Continue with pairs / skip mode':'Continue to next game',()=>room.send('partyContinue',{epoch:view.epoch}));b.disabled=v.phase==='intermission'&&!v.canContinue;}
  const rules=node('details','');node('summary','How Party Night scoring works',rules);node('p','Each mode awards 0–100 points once, regardless of sub-rounds. Rank points = 100 × (competitors − rank) ÷ (competitors − 1), rounded. Beam teammates receive the full team award; Trivia awards each worker individually. A single team earns 100 only for a delivery. DNFs and zero-correct trivia earn 0. Native ties share rank and points. Overall ties: mode wins, then original join order. Wheelbarrow: complete all 3 races; completed races, spills first, then time. Beam: delivery time including penalties. Trivia: individual correct-answer points, then correct-answer time. Skipped modes award nobody points. Maximum for three scored modes: 300.',rules);
  button('Leave Party Night',()=>{void room.leave();});
 });
 room.onLeave(()=>{podium.clear();root.remove();document.body.classList.remove('party-connected','party-overlay');});room.send('partySync');
}
