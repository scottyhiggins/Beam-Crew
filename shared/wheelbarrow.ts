import {corridorFences,fenceContact,type Fence} from './fences.js';
import {materialCategory} from './materials.js';
import {planSpills,recordContact,HAZARDS_PER_LOAD} from './debris.js';
export const WHEEL_CONFIG = {
  maxSpeed: 5.5, acceleration: 3.8, braking: 7, steering: 2.8,
  speedGain: .24, turnGain: .65, roughGain: 1.35, recovery: .3,
  spillThreshold: 1, reloadSeconds: 2.4, countdownSeconds: 3,
  corridorRadius: 2.8, checkpointRadius: 2.4,
  cartRadius: .65, cartOffset: 1.1, impactGain: .65,
  materialRadius: .25, maxMaterial: 192, bricksPerSpill: HAZARDS_PER_LOAD,
  // Zero disables the optional grace period after the first finisher.
  postFinishTimeoutSeconds: 0,
};
export const WHEEL_COURSE = [
  {x:-6,z:7}, {x:-6,z:-2}, {x:2,z:-6},
  {x:4,z:-10}, {x:-3,z:-10}, {x:-3,z:-19},
];
// Full-lane gates sit at unavoidable cross-sections, not small circles at bend vertices.
// The short hairpin overlaps its neighboring lanes, so it has no hidden apex target.
export const WHEEL_GATES = [
  {x:-6,z:2.5,nx:0,nz:-1,halfWidth:2.8,label:'Start straight'},
  {x:-2,z:-4,nx:2/Math.sqrt(5),nz:-1/Math.sqrt(5),halfWidth:2.8,label:'Bend exit'},
  {x:-3,z:-13.5,nx:0,nz:-1,halfWidth:2.8,label:'Finish approach'},
  {x:-3,z:-18,nx:0,nz:-1,halfWidth:2.8,label:'Finish line'},
];
export const WHEEL_FINISH_CHECKPOINT=WHEEL_GATES.length+1;
export const WHEEL_FINISH_Z=WHEEL_GATES[WHEEL_GATES.length-1].z;
// A short entrance neck joins a large shared staging yard. No cap across the finish.
export const FINISH_STAGING={minX:-11,maxX:5,minZ:-36,maxZ:-16.25};
export const FINISH_RAMP={startZ:-16.8,edgeZ:-18.2,height:.22};
export function rampHeight(x:number,z:number){return Math.abs(x+3)<=2.8&&z<=FINISH_RAMP.startZ&&z>=FINISH_RAMP.edgeZ?FINISH_RAMP.height*(FINISH_RAMP.startZ-z)/(FINISH_RAMP.startZ-FINISH_RAMP.edgeZ):0;}
export function onStaging(x:number,z:number,track:WheelTrack=WHEEL_TRACK){const a=track.staging,c=(a.minX+a.maxX)/2;return z<=track.finishZ-2?x>=a.minX&&x<=a.maxX&&z>=a.minZ:Math.abs(x-c)<=2.8&&z<=track.finishZ;}
export function onDriveableArea(x:number,z:number,track:WheelTrack=WHEEL_TRACK){return onCourse(x,z,track)||onStaging(x,z,track)||!!track.startArea?.(x,z);}
const edge=(ax:number,az:number,bx:number,bz:number)=>({a:{x:ax,z:az},b:{x:bx,z:bz}});
const courseFences=corridorFences(WHEEL_COURSE,WHEEL_CONFIG.corridorRadius).filter(f=>f.a.z>=-18||f.b.z>=-18).map(f=>{
 // Clip a crossing segment, preserving the entire approach-side rope.
 const clip=(a:{x:number;z:number},b:{x:number;z:number})=>a.z>=-18?a:{x:a.x+(b.x-a.x)*(-18-a.z)/(b.z-a.z),z:-18};
 return {a:clip(f.a,f.b),b:clip(f.b,f.a)};
});
export const WHEEL_FENCES=[...courseFences,edge(-5.8,-18,-5.8,-20),edge(-.2,-18,-.2,-20),edge(-5.8,-20,-11,-20),edge(-.2,-20,5,-20),edge(-11,-20,-11,-36),edge(5,-20,5,-36),edge(-11,-36,5,-36)];
export const WHEEL_ROUGH={minX:-2,maxX:2,minZ:-11.5,maxZ:-8.5};
// Shared posts are both rendered and collided with; no separate visual walls.
export const WHEEL_OBSTACLES=WHEEL_COURSE.slice(1).flatMap((b,i)=>{
  const a=WHEEL_COURSE[i],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
  const posts:{x:number;z:number;radius:number}[]=[];
  for(let t=0;t<=length;t+=2)for(const side of [-1,1])posts.push({x:a.x+dx*t/length+side*dz/length*WHEEL_CONFIG.corridorRadius,z:a.z+dz*t/length-side*dx/length*WHEEL_CONFIG.corridorRadius,radius:.18});
  return posts;
}).filter(p=>!WHEEL_COURSE.slice(1).some((b,i)=>{
  const a=WHEEL_COURSE[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz)));
  return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz)<WHEEL_CONFIG.corridorRadius-.3;
}));
// Course data is shared by rendering and authoritative simulation. Defaults retain the single race.
export type WheelTrack={id:string;version:number;path:{x:number;z:number}[];gates:typeof WHEEL_GATES;fences:Fence[];obstacles:typeof WHEEL_OBSTACLES;rough:typeof WHEEL_ROUGH;finishZ:number;ramp:typeof FINISH_RAMP;staging:typeof FINISH_STAGING;startArea?:(x:number,z:number)=>boolean};
export const WHEEL_TRACK:WheelTrack={id:'original',version:1,path:WHEEL_COURSE,gates:WHEEL_GATES,fences:WHEEL_FENCES,obstacles:WHEEL_OBSTACLES,rough:WHEEL_ROUGH,finishZ:WHEEL_FINISH_Z,ramp:FINISH_RAMP,staging:FINISH_STAGING};
export function trackRampHeight(x:number,z:number,track:WheelTrack=WHEEL_TRACK){const center=(track.staging.minX+track.staging.maxX)/2,r=track.ramp;return Math.abs(x-center)<=2.8&&z<=r.startZ&&z>=r.edgeZ?r.height*(r.startZ-z)/(r.startZ-r.edgeZ):0;}
export type Material={x:number;z:number;vx:number;vz:number;amount:number;materialId?:number};
export function spillMaterial(p:Cart,material:Material[],create:(value:Material)=>void,track:WheelTrack=WHEEL_TRACK){
  for(let i=0;i<WHEEL_CONFIG.bricksPerSpill;i++){
    const forward=1.65+Math.floor(i/2)*.45,side=(i%2-.5)*.8;
    const x=p.x+Math.sin(p.rotation)*forward+Math.cos(p.rotation)*side,z=p.z+Math.cos(p.rotation)*forward-Math.sin(p.rotation)*side;
    const value={x:onDriveableArea(x,z,track)?x:p.x,z:p.finishOrder?Math.min(track.finishZ-.3,onDriveableArea(x,z,track)?z:p.z):onDriveableArea(x,z,track)?z:p.z,vx:0,vz:0,amount:1,materialId:p.materialId??6};
    if(material.length<WHEEL_CONFIG.maxMaterial){create(value);}else{
      // At the cap, retain the material as an existing movable pile, never erase it.
      const matching=material.filter(b=>(b.materialId??6)===(p.materialId??6));
      // Preserve existing behavior at the cap; aggregate only into the same material.
      if(matching.length){const nearest=matching.reduce((a,b)=>Math.hypot(a.x-x,a.z-z)<Math.hypot(b.x-x,b.z-z)?a:b);nearest.amount=Math.min(9999,nearest.amount+1);}
    }
  }
}
export function stepMaterial(material:Material[],dt:number,track:WheelTrack=WHEEL_TRACK){
  const plans=planSpills(material);
  for(const [index,b] of material.entries()){
    const category=materialCategory(b.materialId);if(category!==1&&category!==3){b.vx=b.vz=0;continue;}
    const x=b.x+b.vx*dt,z=b.z+b.vz*dt;
    if(onDriveableArea(x,z,track)&&!track.obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.radius+1.8&&recordContact(plans[index],index,{x,z},o,o.radius))){b.x=x;b.z=z;}
    else {b.vx*=-.25;b.vz*=-.25;}
    b.vx*=Math.exp(-(materialCategory(b.materialId)===1?1.2:5)*dt);b.vz*=Math.exp(-(materialCategory(b.materialId)===1?1.2:5)*dt);
    if(Math.hypot(b.vx,b.vz)<.01)b.vx=b.vz=0;
  }
}
export function compareResults(a:{spills:number;time:number;finishOrder:number},b:{spills:number;time:number;finishOrder:number}){return a.spills-b.spills||a.time-b.time||a.finishOrder-b.finishOrder;}
export function shouldEndRace(players:Cart[],elapsed:number,firstFinishAt:number,timeout=WHEEL_CONFIG.postFinishTimeoutSeconds){return players.length>0&&(players.every(p=>p.finishOrder>0)||(timeout>0&&firstFinishAt>=0&&elapsed-firstFinishAt>=timeout));}
export type Cart = {x:number;z:number;rotation:number;speed:number;instability:number;spills:number;reload:number;checkpoint:number;finishTime:number;finishOrder:number;lean:number;materialId?:number;finishCrossed?:boolean};
export function resetCart(p:Cart,slot:number,count=8){
  Object.assign(p,{x:-6+(slot%4-(Math.min(count,4)-1)/2)*1.15,z:7+Math.floor(slot/4)*1.4,rotation:Math.PI,speed:0,instability:0,spills:0,reload:0,checkpoint:1,finishTime:0,finishOrder:0,finishCrossed:false,lean:0});
}
const angle=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
export function onCourse(x:number,z:number,track:WheelTrack=WHEEL_TRACK){
  return track.path.slice(1).some((b,i)=>{const a=track.path[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<=WHEEL_CONFIG.corridorRadius;});
}
export function stepCart(p:Cart,inputX:number,inputZ:number,dt:number,material:Material[]=[],track:WheelTrack=WHEEL_TRACK){

  if(p.reload>0){p.reload=Math.max(0,p.reload-dt);p.speed=0;if(p.reload===0){p.instability=0;p.lean=0;}return;}
  const previous={x:p.x,z:p.z,rotation:p.rotation};
  const allowed=(x:number,z:number)=>onDriveableArea(x,z,track);
  const magnitude=Math.min(1,Math.hypot(inputX,inputZ));
  const target=magnitude*WHEEL_CONFIG.maxSpeed;
  p.speed+=Math.max(-(target<p.speed?WHEEL_CONFIG.braking:WHEEL_CONFIG.acceleration)*dt,Math.min(WHEEL_CONFIG.acceleration*dt,target-p.speed));
  const turn=magnitude>.05?Math.max(-WHEEL_CONFIG.steering*dt,Math.min(WHEEL_CONFIG.steering*dt,angle(Math.atan2(inputX,inputZ)-p.rotation))):0;
  p.rotation=angle(p.rotation+turn);p.lean=turn/dt;
  const ratio=p.speed/WHEEL_CONFIG.maxSpeed;
  const rough=p.x>track.rough.minX&&p.x<track.rough.maxX&&p.z>track.rough.minZ&&p.z<track.rough.maxZ;
  p.instability=Math.max(0,p.instability+dt*(WHEEL_CONFIG.speedGain*ratio**3+WHEEL_CONFIG.turnGain*Math.abs(p.lean)*ratio**2+(rough?WHEEL_CONFIG.roughGain*ratio**2:0)-WHEEL_CONFIG.recovery));
  const x=p.x+Math.sin(p.rotation)*p.speed*dt,z=p.z+Math.cos(p.rotation)*p.speed*dt;
  if(allowed(x,z)&&!fenceContact({x,z},WHEEL_CONFIG.cartRadius,track.fences)){p.x=x;p.z=z;}else{p.instability+=WHEEL_CONFIG.impactGain*ratio**2;p.speed*=.15;}
  const sin=Math.sin(p.rotation),cos=Math.cos(p.rotation);
  const contact=fenceContact({x:p.x+sin*WHEEL_CONFIG.cartOffset,z:p.z+cos*WHEEL_CONFIG.cartOffset},WHEEL_CONFIG.cartRadius,track.fences,allowed);
  if(contact){const px=p.x+contact.x,pz=p.z+contact.z;if(allowed(px,pz)){p.x=px;p.z=pz;}p.instability+=WHEEL_CONFIG.impactGain*ratio**2;p.speed*=.15;}
  const materialPlans=planSpills(material);
  for(const [obstacleIndex,o] of [...track.obstacles,...material].entries()){
    const movable='amount' in o;
    if(!p.finishOrder&&movable&&o.z<=track.finishZ)continue;
    const category=movable?materialCategory(o.materialId):-1;
    const point={x:p.x+sin*WHEEL_CONFIG.cartOffset,z:p.z+cos*WHEEL_CONFIG.cartOffset};
    const index=obstacleIndex-track.obstacles.length;
    const dx=point.x-o.x,dz=point.z-o.z,distance=Math.hypot(dx,dz);
    const radius=WHEEL_CONFIG.cartRadius+(movable?0:o.radius);
    const contact=movable?recordContact(materialPlans[index],index,o,point,WHEEL_CONFIG.cartRadius):
      distance<radius?{nx:distance>.0001?dx/distance:-sin,nz:distance>.0001?dz/distance:-cos,depth:radius-distance}:null;
    if(!contact)continue;
    if(category===0){p.speed*=Math.exp(-2.5*dt);continue;}
    if(category===5||category===4){p.instability+=dt*(category===5?1.4:.85)*(p.speed/WHEEL_CONFIG.maxSpeed)**2;p.speed*=Math.exp(-.5*dt);continue;}
    const {nx,nz}=contact;
    const severity=Math.max(0,-(sin*nx+cos*nz))*p.speed/WHEEL_CONFIG.maxSpeed;
    p.instability+=WHEEL_CONFIG.impactGain*severity**2*(movable?.6:1);
    p.speed*=1-Math.min(.8,severity*(movable?.5:.8));
    const separation=contact.depth+.001;
    if(movable&&(category===1||category===3)){
      const pushX=o.x-nx*separation,pushZ=o.z-nz*separation;
      if(allowed(pushX,pushZ)){o.x=pushX;o.z=pushZ;}else{p.x+=nx*separation;p.z+=nz*separation;}
      o.vx=Math.max(-3,Math.min(3,o.vx-nx*severity*(category===1?3:1)));o.vz=Math.max(-3,Math.min(3,o.vz-nz*severity*(category===1?3:1)));
    }else{
      const px=p.x+nx*separation,pz=p.z+nz*separation;
      if(allowed(px,pz)){p.x=px;p.z=pz;}
      // A glancing impact turns away from the obstacle; head-on impacts brake.
      p.rotation=angle(p.rotation+(sin*nz-cos*nx)*severity*.3);
    }
  }
  // A finished cart must continue over the wedge without being relocated. Until its
  // body clears the lip it cannot retreat; afterwards the vertical face blocks it.
  enforceFinishLip(p,previous.z,track);
  advanceCartProgress(p,previous,track);
  if(p.instability>=WHEEL_CONFIG.spillThreshold){p.spills++;p.reload=WHEEL_CONFIG.reloadSeconds;p.speed=0;p.instability=WHEEL_CONFIG.spillThreshold;return;}
}
export function advanceCartProgress(p:Cart,previous:{x:number;z:number;rotation:number},track:WheelTrack=WHEEL_TRACK){
  if(p.finishOrder||p.finishCrossed)return;
  while(p.checkpoint>=1&&p.checkpoint<=track.gates.length){
    const gate=track.gates[p.checkpoint-1],finish=p.checkpoint===track.gates.length;
    // Credit a wheelbarrow as its leading edge crosses the actual painted finish.
    const offset=finish?WHEEL_CONFIG.cartOffset+WHEEL_CONFIG.cartRadius:0;
    const ax=previous.x+Math.sin(previous.rotation)*offset,az=previous.z+Math.cos(previous.rotation)*offset;
    const bx=p.x+Math.sin(p.rotation)*offset,bz=p.z+Math.cos(p.rotation)*offset;
    const before=(ax-gate.x)*gate.nx+(az-gate.z)*gate.nz,after=(bx-gate.x)*gate.nx+(bz-gate.z)*gate.nz;
    if(before>0||after<0||after-before<1e-8)return;
    const t=-before/(after-before),x=ax+(bx-ax)*t,z=az+(bz-az)*t;
    if(Math.abs((x-gate.x)*-gate.nz+(z-gate.z)*gate.nx)>gate.halfWidth)return;
    p.checkpoint++;
    if(finish){p.finishCrossed=true;return;}
  }
}
export function finishCarts(players:Cart[],elapsed:number,previousOrder=0,track:WheelTrack=WHEEL_TRACK){
  let order=Math.max(previousOrder,...players.map(p=>p.finishOrder));
  // Arrival order is recorded independently from spill-first ranking.
  for(const p of players)if(!p.finishOrder&&p.checkpoint===track.gates.length+1&&p.finishCrossed){p.finishTime=elapsed;p.finishOrder=++order;p.finishCrossed=false;}
  return order;
}


// Server-side invisible wedge face. Geometry/height are shared with rendering.
export function enforceFinishLip(p:Cart,previousZ:number,track:WheelTrack=WHEEL_TRACK){
 if(!p.finishOrder)return;
 const limit=Math.max(track.ramp.edgeZ-WHEEL_CONFIG.cartRadius-WHEEL_CONFIG.cartOffset,Math.min(previousZ,track.finishZ+WHEEL_CONFIG.cartOffset+WHEEL_CONFIG.cartRadius));
 if(p.z>limit){p.z=limit;p.speed=0;}
}
export function stepStaging(p:Cart,x:number,z:number,dt:number){stepCart(p,x,z,dt);}
// Small pushable cart contacts, bounded O(8�). Unfinished arrivals have priority:
// parked finishers are pushed into the yard, never an immovable finish barricade.
export function collideStagingCarts(players:Cart[],track:WheelTrack=WHEEL_TRACK){
 for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){
  const a=players[i],b=players[j];if(!(a.finishOrder||b.finishOrder)||a.z>track.finishZ||b.z>track.finishZ)continue;
  const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),radius=1.3;if(d>=radius)continue;
  const nx=d>.001?dx/d:1,nz=d>.001?dz/d:0,push=radius-d+.001;
  for(const [p,sign,share] of [[a,-1,b.finishOrder?.5:1],[b,1,a.finishOrder?.5:1]] as const){
   if(!p.finishOrder)continue;const oldZ=p.z,x=p.x+nx*sign*push*share,z=p.z+nz*sign*push*share;
   if(onDriveableArea(x,z,track)&&!fenceContact({x,z},WHEEL_CONFIG.cartRadius,track.fences)){p.x=x;p.z=z;}
   enforceFinishLip(p,oldZ,track);p.instability=Math.min(1,p.instability+.03);p.speed*=.8;
  }
 }
}
