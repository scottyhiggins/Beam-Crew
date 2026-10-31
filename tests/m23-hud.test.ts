import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CrewRoom} from '../server/room.js';
import {CrewState,Player} from '../server/state.js';
import {validChampionshipLength} from '../shared/course-modules.js';
for(const length of [3,5,10])test(`M23 ${length} races retain official totals in staging, transition and replay`,()=>{
 const r=new CrewRoom();r.setState(new CrewState());r.state.championshipLength=length;
 for(let i=0;i<8;i++){const p=new Player();p.color=i;p.name='Worker '+i;r.state.players.set(''+i,p);}r.restart(false);r.state.phase='test';r.state.racePhase='racing';
 assert.equal(r.state.routeIds.length,length);assert.equal(new Set(r.state.routeIds).size,length);
 for(let leg=0;leg<length;leg++){const t=r.currentTrack();for(const [i,p]of [...r.state.players.values()].entries())Object.assign(p,{x:(t.staging.minX+t.staging.maxX)/2+(i%4-1.5)*1.5,z:t.finishZ-5-Math.floor(i/4)*2,checkpoint:t.gates.length+1,finishCrossed:true,legSpills:i%3});r.tick(1/30);assert.equal(r.state.legResults.length,(leg+1)*8);const frozen=JSON.stringify(r.state.standings);for(const p of r.state.players.values())p.spills+=20;r.tick(1/30);assert.equal(JSON.stringify(r.state.standings),frozen);if(leg<length-1){for(let n=0;n<150;n++)r.tick(1/30);assert.equal(r.state.leg,leg+1);}}
 assert.equal(r.state.racePhase,'results');for(const row of r.state.standings){assert.equal(row.completed,length);assert.equal(row.spills,(row.color%3)*length);}r.restart(false);assert.equal(r.state.routeIds.length,length);assert.equal(r.state.legResults.length,0);assert.ok(r.state.standings.every(s=>s.completed===0));
});
test('M23 two races rejected and stale replay normalizes to three unique courses',()=>{assert.equal(validChampionshipLength(2),false);const r=new CrewRoom();r.setState(new CrewState());r.state.championshipLength=2;r.restart(false);assert.equal(r.state.championshipLength,3);assert.equal(r.state.routeIds.length,3);});
