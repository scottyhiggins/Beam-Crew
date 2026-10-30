import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CrewRoom} from '../server/room.js';
import {CrewState,Player} from '../server/state.js';
test('ten-leg eight-worker lifecycle preserves late DNF history, countdown reloads, permanent debris and immutable official totals',()=>{
 const room=new CrewRoom();room.setState(new CrewState());room.state.mode='championship';room.state.championshipLength=10;
 for(let i=0;i<8;i++){const p=new Player();p.color=i;p.name='P'+i;p.materialId=i;room.state.players.set(String(i),p);}room.restart(false);room.state.phase='test';room.state.racePhase='racing';const route=[...room.state.routeIds];assert.equal(route.length,10);assert.equal(new Set(route).size,10);
 for(let leg=0;leg<10;leg++){
  if(leg===3){room.departChampionship('7');room.state.players.delete('7');}
  const t=room.currentTrack();for(const p of room.state.players.values())Object.assign(p,{x:(t.staging.minX+t.staging.maxX)/2+(p.color%4-1.5)*1.5,z:t.finishZ-5-Math.floor(p.color/4)*2,checkpoint:t.gates.length+1,finishCrossed:true,legSpills:p.color,spills:Math.max(p.spills,p.color),lastInput:0});room.tick(1/30);
  const frozen=JSON.stringify(room.state.legResults);
  if(leg<9){assert.equal(room.state.racePhase,'intermission');for(let n=0;n<148;n++)room.tick(1/30);
   const p=room.state.players.get('0')!;Object.assign(p,{speed:5.5,instability:.999,inputX:1,inputZ:0,lastInput:Date.now()});room.tick(1/30);assert.ok(p.reload>0);const pose=[p.x,p.z,p.rotation,p.speed,p.reload,p.instability,p.materialId],debris=room.state.material.length;room.tick(1/30);assert.equal(room.state.leg,leg+1);assert.deepEqual([p.x,p.z,p.rotation,p.speed,p.reload,p.instability,p.materialId],pose);assert.equal(room.state.material.length,debris);assert.equal(JSON.stringify(room.state.legResults),frozen);
  }else{assert.equal(room.state.racePhase,'results');const totals=JSON.stringify(room.state.standings),time=room.state.elapsed;for(let n=0;n<120;n++)room.tick(1/30);assert.equal(JSON.stringify(room.state.legResults),frozen);assert.equal(JSON.stringify(room.state.standings),totals);assert.equal(room.state.elapsed,time);}
  assert.deepEqual([...room.state.routeIds],route);
 }
 for(const r of room.state.standings){assert.equal(r.completed,r.color===7?3:10);assert.equal(r.dnf,r.color===7);assert.equal(r.spills,r.color*(r.color===7?3:10));if(r.dnf)assert.equal(r.place,8);}
 assert.ok(room.state.material.length>0&&room.state.material.length<=192);assert.equal(room.state.players.get('0')!.materialId,0);
});
