import {performance} from 'node:perf_hooks';import fs from 'node:fs';
import {CrewState,ChampionshipResult,Player} from '../build/server/state.js';
import {validateWorkerLook} from '../build/shared/cosmetics.js';
import {validateWorkerLook as oldLook} from '../baseline-m22/build/shared/cosmetics.js';
const s=new CrewState();s.mode='championship';s.leg=9;s.championshipLength=10;
for(let i=0;i<8;i++){const p=new Player();p.name='Worker '+i;s.players.set(''+i,p);const total=new ChampionshipResult();Object.assign(total,{playerId:''+i,name:p.name,spills:i*10,time:200+i,completed:10,place:i+1});s.standings.push(total);for(let leg=0;leg<10;leg++){const r=new ChampionshipResult();Object.assign(r,{playerId:''+i,name:p.name,leg,spills:i,time:20+i/10,place:i+1});s.legResults.push(r);}}
const oldKey=()=>JSON.stringify([s.mode,s.leg,s.routeSeed,s.standings,s.legResults,s.results,s.teams]);
const newKey=()=>JSON.stringify([...s.standings].sort((a,b)=>a.place-b.place).map(r=>'#'+r.place+' '+r.name+' · '+r.spills+' spills · '+r.time.toFixed(2)+'s · '+r.completed+'/10'));
function bench(fn,n){for(let i=0;i<100;i++)fn();const trials=[];for(let j=0;j<7;j++){const t=performance.now();for(let i=0;i<n;i++)fn();trials.push(performance.now()-t);}trials.sort((a,b)=>a-b);return {iterations:n,medianMs:trials[3],trialsMs:trials};}
const look={hat:0xffce36,vest:0xf08230,expression:'happy'};
const report={scope:'CPU microbench only; eight workers, ten completed races. Does not measure rendering or device FPS.',scoreKey:{beforeBytes:Buffer.byteLength(oldKey()),afterBytes:Buffer.byteLength(newKey()),before:bench(oldKey,2000),after:bench(newKey,2000)},cosmeticValidation:{before:bench(()=>oldLook(look),100000),after:bench(()=>validateWorkerLook(look),100000)}};
fs.writeFileSync('qa/m23/performance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
