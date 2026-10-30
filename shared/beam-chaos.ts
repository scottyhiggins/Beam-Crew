import {BEAM_CONFIG, COURSE, GRIPS, beamCorners, gripPosition, movingLoads, resetBeam, stepBeam, type BeamMotion, type BeamWorld, type Carrier, type Obstacle} from './beam.js';

export const EXCAVATOR={x:20,z:-2.6,length:5.5,speed:.38};
export function excavatorAngle(seconds:number){return seconds*EXCAVATOR.speed;}
// Closely spaced conservative boxes cover the boom and bucket at every angle.
export function excavatorBoxes(seconds:number):Obstacle[]{
 const a=excavatorAngle(seconds),c=Math.cos(a),s=Math.sin(a);
 return Array.from({length:16},(_,i)=>{const d=(i+.5)*EXCAVATOR.length/16;return {x:EXCAVATOR.x+c*d,z:EXCAVATOR.z+s*d,halfX:.38,halfZ:.38};});
}
export const BEAM_MAPS=[
 {name:'1 · Crew training',description:'Doorway, tight turn and moving loads.',elevated:false,edge:-10,excavator:false},
 {name:'2 · Skyway haul',description:'Elevated dogleg around a parked load. Watch both ends and the edges.',elevated:true,edge:-4.4,excavator:false},
 {name:'3 · Excavator alley',description:'Narrow skyway and a sweeping excavator. Wait for your opening.',elevated:true,edge:-5.1,excavator:true},
] as const;
export function validBeamMap(id:unknown):id is number{return Number.isInteger(id)&&Number(id)>=0&&Number(id)<BEAM_MAPS.length;}
export function beamWorld(id:number):BeamWorld {
 const map=BEAM_MAPS[id]??BEAM_MAPS[0];
 const fixed=id===1?[...COURSE.obstacles.filter(o=>o.x!==17),{x:17,z:-5,halfX:1.2,halfZ:.35}]:COURSE.obstacles;
 return {obstacles:[...fixed,...(map.excavator?[{x:20,z:-2.6,halfX:1.15,halfZ:.8}]:[])],
 hazards:t=>[...movingLoads(t),...(map.excavator?excavatorBoxes(t):[])]};
}
export function onBeamPlatform(x:number,z:number,mapId:number,margin=0){
 const map=BEAM_MAPS[mapId]??BEAM_MAPS[0];
 return x>=-10+margin&&x<=32-margin&&z>=-10+margin&&z<=10-margin&&(!map.elevated||x<=9-margin||x>=25+margin||z<=map.edge-margin);
}
type Shape={x:number;z:number;angle:number;halfX:number;halfZ:number};
// Minimum separating translation for two convex boxes. The same axes as beamCollides.
export function separation(a:Shape,b:Obstacle){
 const c=Math.cos(a.angle),s=Math.sin(a.angle);let depth=Infinity,dx=0,dz=0;
 for(const [ax,az]of [[1,0],[0,1],[c,s],[-s,c]]){
  const signed=(a.x-b.x)*ax+(a.z-b.z)*az;
  const overlap=a.halfX*Math.abs(c*ax+s*az)+a.halfZ*Math.abs(-s*ax+c*az)+b.halfX*Math.abs(ax)+b.halfZ*Math.abs(az)-Math.abs(signed);
  if(overlap<=0)return null;
  if(overlap<depth){depth=overlap;const sign=signed<0?-1:1;dx=ax*sign;dz=az*sign;}
 }
 return {x:dx*(depth+.0001),z:dz*(depth+.0001)};
}
export type ChaosWorker={x:number;z:number;grip:number;end:number;inputX:number;inputZ:number;vx:number;vz:number;connected:boolean};
export type ChaosBeam=BeamMotion & {stage:number;penalty:number;protection:number;resets:number;recoveries:number};
function shapes(b:BeamMotion,carriers:Carrier[]):Shape[]{return [
 {...b,halfX:BEAM_CONFIG.length/2,halfZ:BEAM_CONFIG.width/2+BEAM_CONFIG.collisionMargin},
 ...carriers.map(p=>({...gripPosition(b,p.grip),angle:0,halfX:.45,halfZ:.45})),
];}
// Solve contacts even when inputs and velocity are zero. A bounded solver recovers
// crushing contacts instead of permitting overlap or an indefinite wall pin.
export function pushAssembly(b:BeamMotion,carriers:Carrier[],obstacles:Obstacle[]){
 for(let pass=0;pass<24;pass++){
  let moved=false;
  for(const o of obstacles)for(const shape of shapes(b,carriers)){
   const push=separation(shape,o);if(!push)continue;
   b.x+=push.x;b.z+=push.z;moved=true;b.blocked=true;
   // Refresh after each translation; stale shapes would overcorrect the group.
   break;
  }
  if(!moved)return true;
 }
 return !obstacles.some(o=>shapes(b,carriers).some(s=>separation(s,o)));
}
export function pushWorker(p:ChaosWorker,obstacles:Obstacle[]){
 for(let pass=0;pass<24;pass++){
  let moved=false;
  for(const o of obstacles){const push=separation({...p,angle:0,halfX:.45,halfZ:.45},o);if(push){p.x+=push.x;p.z+=push.z;moved=true;}}
  if(!moved)return true;
 }
 return false;
}
export function recoverTeam(b:ChaosBeam,members:ChaosWorker[]){
 const resets=b.resets+1,penalty=b.penalty+5,recoveries=b.recoveries+1;
 const stage=b.stage;resetBeam(b,true);if(stage>=2)Object.assign(b,{x:5,z:-7.5,angle:0});Object.assign(b,{resets,penalty,recoveries,protection:1.2});
 for(const p of members){Object.assign(p,gripPosition(b,p.end),{grip:-1,inputX:0,inputZ:0,vx:0,vz:0});}
}
export function stepChaosTeam(b:ChaosBeam,members:ChaosWorker[],dt:number,seconds:number,mapId:number){
 if(b.protection>0){b.protection=Math.max(0,b.protection-dt);return;}
 const world=beamWorld(mapId),carriers=members.filter(p=>p.grip===p.end).map(p=>({grip:p.end,inputX:p.inputX,inputZ:p.inputZ}));
 // Max hazard tip speed is under 3 world units/s; <= 1/120 s gives < .025 units.
 const count=Math.max(1,Math.ceil(dt*120)),slice=dt/count;
 for(let i=0;i<count;i++){
  const t=seconds-dt+(i+1)*slice,obstacles=[...world.obstacles,...world.hazards(t)];
  const before={x:b.x,z:b.z};
  if(!pushAssembly(b,carriers,obstacles)){recoverTeam(b,members);return;}
  if(b.x!==before.x||b.z!==before.z)b.vx=b.vz=b.angularVelocity=0;
  stepBeam(b,carriers,slice,t,world);
  if(b.checkpoint)b.stage=Math.max(b.stage,1);
  if(b.checkpoint&&b.x>3&&b.x<9&&b.z<-6.5&&Math.abs(b.angle)<.15)b.stage=2;
  for(const p of members){
   if(p.grip===p.end)Object.assign(p,gripPosition(b,p.end));
   else {
    const n=Math.max(1,Math.hypot(p.inputX,p.inputZ));p.x+=p.inputX/n*3.6*slice;p.z+=p.inputZ/n*3.6*slice;
    if(!pushWorker(p,obstacles)){recoverTeam(b,members);return;}
   }
  }
  if(beamCorners(b).some(p=>!onBeamPlatform(p.x,p.z,mapId,.1))||members.some(p=>!onBeamPlatform(p.x,p.z,mapId,.45))){recoverTeam(b,members);return;}
 }
}
