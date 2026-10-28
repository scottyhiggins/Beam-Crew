import {corridorFences,fenceContact} from './fences.js';
import {materialCategory} from './materials.js';
export const WHEEL_CONFIG = {
  maxSpeed: 5.5, acceleration: 3.8, braking: 7, steering: 2.8,
  speedGain: .24, turnGain: .65, roughGain: 1.35, recovery: .3,
  spillThreshold: 1, reloadSeconds: 2.4, countdownSeconds: 3,
  corridorRadius: 2.8, checkpointRadius: 2.4,
  cartRadius: .65, cartOffset: 1.1, impactGain: .65,
  materialRadius: .25, maxMaterial: 192, bricksPerSpill: 6,
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
export const WHEEL_FENCES=corridorFences(WHEEL_COURSE,WHEEL_CONFIG.corridorRadius);
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
export type Material={x:number;z:number;vx:number;vz:number;amount:number;materialId?:number};
export function spillMaterial(p:Cart,material:Material[],create:(value:Material)=>void){
  for(let i=0;i<WHEEL_CONFIG.bricksPerSpill;i++){
    const forward=1.65+Math.floor(i/2)*.45,side=(i%2-.5)*.8;
    const x=p.x+Math.sin(p.rotation)*forward+Math.cos(p.rotation)*side,z=p.z+Math.cos(p.rotation)*forward-Math.sin(p.rotation)*side;
    const value={x:onCourse(x,z)?x:p.x,z:onCourse(x,z)?z:p.z,vx:0,vz:0,amount:1,materialId:p.materialId??6};
    if(material.length<WHEEL_CONFIG.maxMaterial){create(value);}else{
      // At the cap, retain the material as an existing movable pile, never erase it.
      const matching=material.filter(b=>(b.materialId??6)===(p.materialId??6));
      // Preserve existing behavior at the cap; aggregate only into the same material.
      if(matching.length){const nearest=matching.reduce((a,b)=>Math.hypot(a.x-x,a.z-z)<Math.hypot(b.x-x,b.z-z)?a:b);nearest.amount=Math.min(9999,nearest.amount+1);}
    }
  }
}
export function stepMaterial(material:Material[],dt:number){
  for(const b of material){
    const category=materialCategory(b.materialId);if(category!==1&&category!==3){b.vx=b.vz=0;continue;}
    const x=b.x+b.vx*dt,z=b.z+b.vz*dt;
    if(onCourse(x,z)&&!WHEEL_OBSTACLES.some(o=>Math.hypot(x-o.x,z-o.z)<o.radius+WHEEL_CONFIG.materialRadius)){b.x=x;b.z=z;}
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
export function onCourse(x:number,z:number){
  return WHEEL_COURSE.slice(1).some((b,i)=>{const a=WHEEL_COURSE[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<=WHEEL_CONFIG.corridorRadius;});
}
export function stepCart(p:Cart,inputX:number,inputZ:number,dt:number,material:Material[]=[]){
  if(p.finishOrder){stepStaging(p,inputX,inputZ,dt);return;}
  if(p.reload>0){p.reload=Math.max(0,p.reload-dt);p.speed=0;if(p.reload===0){p.instability=0;p.lean=0;}return;}
  const previous={x:p.x,z:p.z,rotation:p.rotation};
  const magnitude=Math.min(1,Math.hypot(inputX,inputZ));
  const target=magnitude*WHEEL_CONFIG.maxSpeed;
  p.speed+=Math.max(-(target<p.speed?WHEEL_CONFIG.braking:WHEEL_CONFIG.acceleration)*dt,Math.min(WHEEL_CONFIG.acceleration*dt,target-p.speed));
  const turn=magnitude>.05?Math.max(-WHEEL_CONFIG.steering*dt,Math.min(WHEEL_CONFIG.steering*dt,angle(Math.atan2(inputX,inputZ)-p.rotation))):0;
  p.rotation=angle(p.rotation+turn);p.lean=turn/dt;
  const ratio=p.speed/WHEEL_CONFIG.maxSpeed;
  const rough=p.x>WHEEL_ROUGH.minX&&p.x<WHEEL_ROUGH.maxX&&p.z>WHEEL_ROUGH.minZ&&p.z<WHEEL_ROUGH.maxZ;
  p.instability=Math.max(0,p.instability+dt*(WHEEL_CONFIG.speedGain*ratio**3+WHEEL_CONFIG.turnGain*Math.abs(p.lean)*ratio**2+(rough?WHEEL_CONFIG.roughGain*ratio**2:0)-WHEEL_CONFIG.recovery));
  const x=p.x+Math.sin(p.rotation)*p.speed*dt,z=p.z+Math.cos(p.rotation)*p.speed*dt;
  if(onCourse(x,z)&&!fenceContact({x,z},WHEEL_CONFIG.cartRadius,WHEEL_FENCES)){p.x=x;p.z=z;}else{p.instability+=WHEEL_CONFIG.impactGain*ratio**2;p.speed*=.15;}
  const sin=Math.sin(p.rotation),cos=Math.cos(p.rotation);
  const contact=fenceContact({x:p.x+sin*WHEEL_CONFIG.cartOffset,z:p.z+cos*WHEEL_CONFIG.cartOffset},WHEEL_CONFIG.cartRadius,WHEEL_FENCES,onCourse);
  if(contact){const px=p.x+contact.x,pz=p.z+contact.z;if(onCourse(px,pz)){p.x=px;p.z=pz;}p.instability+=WHEEL_CONFIG.impactGain*ratio**2;p.speed*=.15;}
  for(const o of [...WHEEL_OBSTACLES,...material]){
    const movable='amount' in o;
    const category=movable?materialCategory(o.materialId):-1;
    const radius=WHEEL_CONFIG.cartRadius+(movable?(category===0||category===5?.65:WHEEL_CONFIG.materialRadius):o.radius);
    const dx=p.x+sin*WHEEL_CONFIG.cartOffset-o.x,dz=p.z+cos*WHEEL_CONFIG.cartOffset-o.z,distance=Math.hypot(dx,dz);
    if(distance>=radius)continue;
    if(category===0){p.speed*=Math.exp(-2.5*dt);continue;}
    if(category===5||category===4){p.instability+=dt*(category===5?1.4:.85)*(p.speed/WHEEL_CONFIG.maxSpeed)**2;p.speed*=Math.exp(-.5*dt);continue;}
    const nx=distance>.0001?dx/distance:-sin,nz=distance>.0001?dz/distance:-cos;
    const severity=Math.max(0,-(sin*nx+cos*nz))*p.speed/WHEEL_CONFIG.maxSpeed;
    p.instability+=WHEEL_CONFIG.impactGain*severity**2*(movable?.6:1);
    p.speed*=1-Math.min(.8,severity*(movable?.5:.8));
    const separation=radius-distance+.001;
    if(movable&&(category===1||category===3)){
      const pushX=o.x-nx*separation,pushZ=o.z-nz*separation;
      if(onCourse(pushX,pushZ)){o.x=pushX;o.z=pushZ;}else{p.x+=nx*separation;p.z+=nz*separation;}
      o.vx=Math.max(-3,Math.min(3,o.vx-nx*severity*(category===1?3:1)));o.vz=Math.max(-3,Math.min(3,o.vz-nz*severity*(category===1?3:1)));
    }else{
      const px=p.x+nx*separation,pz=p.z+nz*separation;
      if(onCourse(px,pz)){p.x=px;p.z=pz;}
      // A glancing impact turns away from the obstacle; head-on impacts brake.
      p.rotation=angle(p.rotation+(sin*nz-cos*nx)*severity*.3);
    }
  }
  advanceCartProgress(p,previous);
  if(p.instability>=WHEEL_CONFIG.spillThreshold){p.spills++;p.reload=WHEEL_CONFIG.reloadSeconds;p.speed=0;p.instability=WHEEL_CONFIG.spillThreshold;return;}
}
export function advanceCartProgress(p:Cart,previous:{x:number;z:number;rotation:number}){
  if(p.finishOrder||p.finishCrossed)return;
  while(p.checkpoint>=1&&p.checkpoint<=WHEEL_GATES.length){
    const gate=WHEEL_GATES[p.checkpoint-1],finish=p.checkpoint===WHEEL_GATES.length;
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
export function finishCarts(players:Cart[],elapsed:number,previousOrder=0){
  let order=Math.max(previousOrder,...players.map(p=>p.finishOrder));
  // Arrival order is recorded independently from spill-first ranking.
  for(const p of players)if(!p.finishOrder&&p.checkpoint===WHEEL_FINISH_CHECKPOINT&&p.finishCrossed){p.finishTime=elapsed;p.finishOrder=++order;p.finishCrossed=false;p.speed=0;p.instability=0;p.lean=0;p.reload=0;p.x=-3+(order-1)%4;p.z=-23-Math.floor((order-1)/4);}
  return order;
}


// Isolated staging has no course/hazard interaction and cannot award another finish.
export const FINISH_STAGING={minX:-6,maxX:1,minZ:-27,maxZ:-22};
export function stepStaging(p:Cart,x:number,z:number,dt:number){
 const n=Math.max(1,Math.hypot(x,z));p.x=Math.max(FINISH_STAGING.minX,Math.min(FINISH_STAGING.maxX,p.x+x/n*2.5*dt));p.z=Math.max(FINISH_STAGING.minZ,Math.min(FINISH_STAGING.maxZ,p.z+z/n*2.5*dt));
 if(Math.hypot(x,z)>.05)p.rotation=Math.atan2(x,z);p.speed=0;p.lean=0;
}
