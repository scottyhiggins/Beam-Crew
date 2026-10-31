import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CrewRoom} from '../server/room.js';
import {CrewState,Player} from '../server/state.js';
import {COURSE_TWO,COURSE_TWO_PATH,SHARED_EXIT,championshipTrack} from '../shared/championship.js';
import {WHEEL_TRACK,WHEEL_COURSE,resetCart,stepCart,onDriveableArea,trackRampHeight,finishCarts,spillMaterial,type Cart} from '../shared/wheelbarrow.js';
import {fenceContact} from '../shared/fences.js';
function room(){const r=new CrewRoom();r.setState(new CrewState());r.state.mode='championship';r.state.championshipLength=2;for(let i=0;i<2;i++){const p=new Player();p.name='P'+i;p.color=i;p.materialId=i?11:0;r.state.players.set(''+i,p);}r.restart(false);/* Explicit historical geometry fixture, never a selectable/replay length. */r.routePlan=[];(r as any).routeMaterialWorld=undefined;r.state.routeIds.clear();r.state.championshipLength=2;r.state.phase='test';r.state.racePhase='racing';return r;}
function finish(r:CrewRoom,id:string){const p=r.state.players.get(id)!,t=championshipTrack(r.state.leg);Object.assign(p,{x:(t.staging.minX+t.staging.maxX)/2,z:t.finishZ-3,checkpoint:t.gates.length+1,finishCrossed:true});r.tick(1/30);}
function tick(r:CrewRoom,n:number){for(let i=0;i<n;i++)r.tick(1/30);}
test('Championship keeps Course 1 unchanged and the socket has continuous driveable ground and matching fences',()=>{
 assert.deepEqual(championshipTrack(0).path,WHEEL_COURSE);assert.deepEqual(COURSE_TWO_PATH[0],{x:SHARED_EXIT.x,z:SHARED_EXIT.z});
 for(let z=-34;z>=-39;z-=.1){assert.ok(onDriveableArea(-3,z,COURSE_TWO),'ground at '+z);assert.equal(fenceContact({x:-3,z},.65,COURSE_TWO.fences),undefined,'seam at '+z);}
 assert.ok(fenceContact({x:-3,z:-36},.65,WHEEL_TRACK.fences));
 const p={} as Cart;resetCart(p,0,2);Object.assign(p,{x:-3,z:-34,rotation:Math.PI,speed:2,finishOrder:1});for(let i=0;i<180;i++)stepCart(p,0,-.5,1/30,[],WHEEL_TRACK);assert.ok(p.z>-35.4,'closed gate blocks entry');
});
test('last racer starts exactly one five-second countdown; GO preserves every pose, load and physical state',()=>{
 const r=room();r.state.players.get('0')!.legSpills=2;finish(r,'0');assert.equal(r.state.racePhase,'racing');tick(r,60);assert.equal(r.state.legResults.length,1);
 finish(r,'1');assert.equal(r.state.racePhase,'intermission');assert.equal(r.state.countdown,5);const elapsed=r.state.elapsed,snapshot=JSON.stringify(r.state.legResults);tick(r,149);assert.equal(r.state.leg,0);assert.ok(r.state.countdown>0);assert.equal(r.state.elapsed,elapsed);
 const before=[...r.state.players.values()].map(p=>[p.x,p.z,p.rotation,p.speed,p.instability,p.reload,p.materialId,p.spills]);r.tick(1/30);assert.equal(r.state.leg,1);assert.equal(r.state.racePhase,'racing');assert.equal(r.state.elapsed,0);assert.equal(r.state.countdown,0);
 assert.deepEqual([...r.state.players.values()].map(p=>[p.x,p.z,p.rotation,p.speed,p.instability,p.reload,p.materialId,p.spills]),before);assert.equal(JSON.stringify(r.state.legResults),snapshot);assert.ok([...r.state.players.values()].every(p=>p.checkpoint===1&&!p.finishOrder&&!p.legSpills));tick(r,100);assert.equal(r.state.leg,1);
});
test('staging and countdown spills stay physical while both official leg and cumulative snapshots stay frozen',()=>{
 const r=room(),p=r.state.players.get('0')!;p.legSpills=1;finish(r,'0');const result=JSON.stringify(r.state.legResults),total=r.state.standings.find(p=>p.playerId==='0')!;
 Object.assign(p,{x:-8,z:-27,speed:5.5,rotation:0,instability:.999,inputX:1,inputZ:0,lastInput:Date.now()});r.tick(1/30);assert.ok(p.spills>0);assert.equal(p.legSpills,1);assert.equal(total.spills,1);assert.equal(JSON.stringify(r.state.legResults),result);assert.equal(r.state.material.length,6);
 finish(r,'1');const count=r.state.material.length;tick(r,150);assert.equal(r.state.material.length,count);assert.ok(p.reload>=0);assert.equal(p.materialId,0);assert.equal(r.state.players.get('1')!.materialId,11);
 p.legSpills=3;finish(r,'0');r.state.players.get('1')!.legSpills=2;finish(r,'1');assert.equal(r.state.racePhase,'results');assert.equal(total.spills,4);assert.equal(total.completed,2);assert.equal(r.state.legResults.length,4);const all=JSON.stringify(r.state.legResults),final=JSON.stringify(r.state.standings),elapsed=r.state.elapsed;tick(r,120);assert.equal(JSON.stringify(r.state.legResults),all);assert.equal(JSON.stringify(r.state.standings),final);assert.equal(r.state.elapsed,elapsed);
});
test('reserved racers remain eligible; a permanently departed last racer becomes DNF and releases the transition',()=>{
 const r=room();finish(r,'0');r.state.players.get('1')!.connected=false;tick(r,120);assert.equal(r.state.racePhase,'racing');r.departChampionship('1');r.state.players.delete('1');r.reconcileWheelResults();assert.equal(r.state.racePhase,'intermission');assert.equal(r.state.standings.find(r=>r.playerId==='1')!.dnf,true);tick(r,150);finish(r,'0');assert.equal(r.state.racePhase,'results');assert.equal(r.state.standings.find(r=>r.playerId==='0')!.place,1);assert.equal(r.state.legResults.filter(r=>r.playerId==='1').length,1);
});
test('cumulative score uses spills then racing time, and replay clears the ledger and world',()=>{
 const r=room();r.state.players.get('0')!.legSpills=2;finish(r,'0');finish(r,'1');tick(r,150);finish(r,'0');r.state.players.get('1')!.legSpills=1;finish(r,'1');assert.equal(r.state.standings.find(r=>r.playerId==='1')!.place,1);r.restart(false);assert.equal(r.state.leg,0);assert.equal(r.state.legResults.length,0);assert.equal(r.state.material.length,0);assert.equal(r.state.racePhase,'countdown');assert.ok([...r.state.standings].every(r=>!r.completed&&!r.spills&&!r.dnf));assert.equal(r.state.players.get('0')!.materialId,0);
});
test('all twelve loads traverse Course 2 without a seam teleport, and the second spike lip blocks reverse',()=>{
 for(let materialId=0;materialId<12;materialId++){
  const r=room();finish(r,'0');finish(r,'1');tick(r,150);const p=r.state.players.get('0')!;Object.assign(p,{x:-3,z:-32,rotation:Math.PI,materialId});let i=0,maxRise=0;
  for(let n=0;n<8000&&!p.finishOrder;n++){
   let goal=COURSE_TWO_PATH[i];if(Math.hypot(p.x-goal.x,p.z-goal.z)<.4&&i<COURSE_TWO_PATH.length-1)goal=COURSE_TWO_PATH[++i];const dx=goal.x-p.x,dz=goal.z-p.z,len=Math.hypot(dx,dz)||1;Object.assign(p,{inputX:dx/len*.5,inputZ:dz/len*.5,lastInput:Date.now()});const x=p.x,z=p.z;r.tick(1/30);assert.ok(Math.hypot(p.x-x,p.z-z)<.2,'continuous movement');maxRise=Math.max(maxRise,trackRampHeight(p.x,p.z,COURSE_TWO));
  }
  assert.equal(p.finishOrder,1,'material '+materialId+' route checkpoint '+p.checkpoint+' at '+p.x+','+p.z);assert.equal(p.materialId,materialId);
  for(let n=0;n<120;n++){p.inputX=0;p.inputZ=-.4;p.lastInput=Date.now();r.tick(1/30);maxRise=Math.max(maxRise,trackRampHeight(p.x,p.z,COURSE_TWO));}assert.ok(p.z<-75);assert.ok(maxRise>0);
  for(let n=0;n<500;n++){p.inputZ=.4;p.lastInput=Date.now();r.tick(1/30);}assert.ok(p.z<=-73.95);assert.equal(p.finishOrder,1);
 }
});
test('completed Course 1 cannot be reentered after next GO, including an arrival still on the wedge',()=>{
 const r=room();finish(r,'0');finish(r,'1');tick(r,150);const p=r.state.players.get('0')!;Object.assign(p,{x:-3,z:-17,rotation:0,inputZ:.5,lastInput:Date.now()});tick(r,5);assert.ok(p.z<=-17);Object.assign(p,{z:-25,inputZ:.5,lastInput:Date.now()});tick(r,200);assert.ok(p.z<=-19.95);
});
test('Course 2 rejects early finish and preserves each material load and hazard quantities',()=>{
 for(let id=0;id<12;id++){const p={} as Cart;resetCart(p,0,2);Object.assign(p,{x:-5,z:-73,materialId:id,checkpoint:1});assert.equal(finishCarts([p],4,0,COURSE_TWO),0);const debris:any[]=[];spillMaterial(p,debris,v=>debris.push(v),COURSE_TWO);assert.equal(debris.length,6);assert.ok(debris.every(v=>v.materialId===id&&onDriveableArea(v.x,v.z,COURSE_TWO)));}
});
