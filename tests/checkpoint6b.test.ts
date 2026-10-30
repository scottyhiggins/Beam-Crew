import {test} from 'node:test';
import assert from 'node:assert/strict';
import {COURSE_MODULES,assembleRoute,selectCourseIds,routeWorld,validChampionshipLength} from '../shared/course-modules.js';
import {resetCart,stepCart,finishCarts,onDriveableArea,advanceCartProgress,spillMaterial,stepMaterial,type Cart} from '../shared/wheelbarrow.js';
import {fenceContact} from '../shared/fences.js';
import {CrewRoom} from '../server/room.js';
import {CrewState,Player} from '../server/state.js';
test('ten distinct modules have ten surfaces, three barrier families and deterministic unique 3/5/10 selection',()=>{
 assert.equal(COURSE_MODULES.length,10);assert.equal(new Set(COURSE_MODULES.map(m=>m.surface)).size,10);assert.equal(new Set(COURSE_MODULES.map(m=>m.barrier)).size,3);
 for(let seed=1;seed<=100;seed++)for(const n of [3,5,10]){const ids=selectCourseIds(n,seed);assert.equal(ids.length,n);assert.equal(new Set(ids).size,n);assert.deepEqual(ids,selectCourseIds(n,seed));}
 assert.ok(new Set(Array.from({length:20},(_,i)=>selectCourseIds(5,i).join(','))).size>10);for(const bad of [0,1,4,11,'5',NaN])assert.equal(validChampionshipLength(bad),false);assert.throws(()=>selectCourseIds(11,1));assert.throws(()=>assembleRoute(['original','original']));
});
test('every legal adjacent pair aligns level sockets with a driveable, uncapped 5.6m connection',()=>{
 for(const a of COURSE_MODULES)for(const b of COURSE_MODULES)if(a!==b){const [first,second]=assembleRoute([a.id,b.id]);assert.deepEqual(first.exit,second.entry);assert.ok(second.exit.z<first.exit.z-40);
  for(const dx of [-1,0,1])for(let dz=-2;dz<=2;dz+=.1){const x=second.entry.x+dx,z=second.entry.z+dz;assert.ok(onDriveableArea(x,z,second.track),a.id+' → '+b.id+' ground');assert.equal(fenceContact({x,z},.65,second.track.fences),undefined,a.id+' → '+b.id+' cap at '+x+','+z);}
  assert.ok(fenceContact(first.exit,.65,first.track.fences),'closed next gate');
 }
});
test('all twelve materials naturally drive every module including the marked gravel detour with continuous positions',()=>{
 for(const module of COURSE_MODULES)for(let materialId=0;materialId<12;materialId++){
  const course=assembleRoute([module.id])[0],t=course.track,p={} as Cart;resetCart(p,0,2);Object.assign(p,{materialId});let i=1;
  for(let n=0;n<5500&&!p.finishOrder;n++){let goal=course.drivePath[i];if(Math.hypot(p.x-goal.x,p.z-goal.z)<.35&&i<course.drivePath.length-1)goal=course.drivePath[++i];const dx=goal.x-p.x,dz=goal.z-p.z,len=Math.hypot(dx,dz)||1,x=p.x,z=p.z;stepCart(p,dx/len*.45,dz/len*.45,1/30,[],t);finishCarts([p],n/30,0,t);assert.ok(Math.hypot(p.x-x,p.z-z)<.25,'continuous pose');}
  assert.equal(p.finishOrder,1,module.id+' material '+materialId+' checkpoint '+p.checkpoint+' at '+p.x+','+p.z);assert.equal(p.materialId,materialId);
  for(let n=0;n<170;n++)stepCart(p,0,-.4,1/30,[],t);assert.ok(p.z<t.finishZ-3);
  for(let n=0;n<500;n++)stepCart(p,0,.4,1/30,[],t);assert.ok(p.z<=t.ramp.edgeZ-1.75+.001,'one-way final strip '+module.id);
 }
});
test('gravel blocks the visible part of the haul road and leaves a fair left route; truck footprint is authoritative',()=>{
 const c=assembleRoute(['asphalt-haul'])[0],pile=c.track.obstacles[0],p={} as Cart;resetCart(p,0,2);Object.assign(p,{x:pile.x,z:pile.z+1.75,rotation:Math.PI,speed:4});stepCart(p,0,-.8,1/30,[],c.track);assert.ok(p.speed<4||Math.abs(p.x-pile.x)>.1);
 assert.ok(onDriveableArea(c.origin.x-1.2,pile.z,c.track));assert.equal(fenceContact({x:c.origin.x-1.2,z:pile.z},.65,c.track.fences),undefined);
 assert.ok(fenceContact({x:c.origin.x+3,z:c.origin.z-11.5},.65,c.track.fences));
});
test('module gates reject skipped and reverse finishes and accept ordered crossing across the lane',()=>{
 for(const m of COURSE_MODULES){const c=assembleRoute([m.id])[0],t=c.track,p={} as Cart;resetCart(p,0,2);Object.assign(p,{x:t.gates.at(-1)!.x,z:t.finishZ-2});finishCarts([p],1,0,t);assert.equal(p.finishOrder,0);
  for(let i=0;i<t.gates.length;i++){const g=t.gates[i],offset=i===t.gates.length-1?1.75:0;Object.assign(p,{x:g.x+g.nx*(.2-offset),z:g.z+g.nz*(.2-offset),rotation:Math.atan2(g.nx,g.nz)});advanceCartProgress(p,{x:g.x-g.nx*(.2+offset),z:g.z-g.nz*(.2+offset),rotation:p.rotation},t);}
  finishCarts([p],2,0,t);assert.equal(p.finishOrder,1,m.id);
 }
});
test('five-leg room freezes each ledger, runs one three-second transition, preserves physical state, hazards and chosen loads',()=>{
 const room=new CrewRoom();room.setState(new CrewState());room.state.mode='championship';room.state.championshipLength=5;
 for(let i=0;i<8;i++){const p=new Player();p.name='P'+i;p.color=i;p.materialId=i;room.state.players.set(String(i),p);}room.restart(false);room.state.phase='test';room.state.racePhase='racing';assert.equal(room.state.routeIds.length,5);const route=[...room.state.routeIds];
 for(let leg=0;leg<5;leg++){const t=room.currentTrack();for(const p of room.state.players.values())Object.assign(p,{x:(t.staging.minX+t.staging.maxX)/2+(p.color%4-1.5)*1.5,z:t.finishZ-5-Math.floor(p.color/4)*2,checkpoint:t.gates.length+1,finishCrossed:true,legSpills:p.color});room.tick(1/30);assert.equal(room.state.legResults.length,(leg+1)*8);const scores=JSON.stringify(room.state.legResults),poses=[...room.state.players.values()].map(p=>[p.x,p.z,p.materialId]);
  if(leg<4){assert.equal(room.state.racePhase,'intermission');assert.equal(room.state.countdown,3);for(let n=0;n<89;n++)room.tick(1/30);assert.equal(room.state.leg,leg);const before=[...room.state.players.values()].map(p=>[p.x,p.z,p.rotation,p.speed,p.reload,p.instability,p.materialId]);room.tick(1/30);assert.equal(room.state.leg,leg+1);assert.deepEqual([...room.state.players.values()].map(p=>[p.x,p.z,p.rotation,p.speed,p.reload,p.instability,p.materialId]),before);assert.equal(JSON.stringify(room.state.legResults),scores);}
  else{assert.equal(room.state.racePhase,'results');for(let n=0;n<30;n++)room.tick(1/30);assert.equal(JSON.stringify(room.state.legResults),scores);}
  assert.deepEqual([...room.state.routeIds],route);assert.ok(poses.every((a,i)=>a[2]===i));
 }
 for(const r of room.state.standings){assert.equal(r.completed,5);assert.equal(r.spills,r.color*5);}
 const c=room.routePlan[0],p=room.state.players.get('0')!,material:any[]=[];Object.assign(p,{x:c.track.path[1].x,z:c.track.path[1].z,materialId:2});spillMaterial(p,material,v=>material.push(v),c.track);const quantities=material.map(m=>m.amount);stepMaterial(material,1/30,routeWorld(room.routePlan));assert.deepEqual(material.map(m=>m.amount),quantities);assert.equal(material.length,6);
});
