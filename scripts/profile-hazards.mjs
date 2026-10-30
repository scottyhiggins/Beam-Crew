import {performance} from 'node:perf_hooks';
import {CrewRoom} from '../build/server/room.js';
import {CrewState,Player,SpilledMaterial} from '../build/server/state.js';
import {resetCart} from '../build/shared/wheelbarrow.js';
const output=[];
for(const count of [75,150,192]){
 const room=new CrewRoom();room.setState(new CrewState());room.state.mode='championship';room.restart(false);room.state.phase='test';room.state.racePhase='results';
 for(let i=0;i<8;i++){const p=new Player();resetCart(p,i,8);p.materialId=i;room.state.players.set(String(i),p);}
 for(let i=0;i<count;i++){const h=new SpilledMaterial();Object.assign(h,{x:-8+(i%12)*.4,z:2-Math.floor(i/12)*.6,materialId:i%12});room.state.material.push(h);}
 for(let i=0;i<100;i++)room.tick(1/30);
 const samples=[];for(let i=0;i<1000;i++){const start=performance.now();room.tick(1/30);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);
 output.push({players:8,hazards:count,meanMs:samples.reduce((a,b)=>a+b,0)/samples.length,p95Ms:samples[950],p99Ms:samples[990],maxMs:samples.at(-1)});
}
console.log(JSON.stringify({description:'Local Node server simulation only; excludes browser rendering, network patches and iPhone performance.',samples:output},null,2));
