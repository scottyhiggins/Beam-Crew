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
export type Material={x:number;z:number;vx:number;vz:number;amount:number};
export function spillMaterial(p:Cart,material:Material[],create:(value:Material)=>void){
  for(let i=0;i<WHEEL_CONFIG.bricksPerSpill;i++){
    const forward=1.65+Math.floor(i/2)*.45,side=(i%2-.5)*.8;
    const x=p.x+Math.sin(p.rotation)*forward+Math.cos(p.rotation)*side,z=p.z+Math.cos(p.rotation)*forward-Math.sin(p.rotation)*side;
    const value={x:onCourse(x,z)?x:p.x,z:onCourse(x,z)?z:p.z,vx:0,vz:0,amount:1};
    if(material.length<WHEEL_CONFIG.maxMaterial){create(value);}else{
      // At the cap, retain the material as an existing movable pile, never erase it.
      const nearest=material.reduce((a,b)=>Math.hypot(a.x-x,a.z-z)<Math.hypot(b.x-x,b.z-z)?a:b);nearest.amount++;
    }
  }
}
export function stepMaterial(material:Material[],dt:number){
  for(const b of material){
    const x=b.x+b.vx*dt,z=b.z+b.vz*dt;
    if(onCourse(x,z)&&!WHEEL_OBSTACLES.some(o=>Math.hypot(x-o.x,z-o.z)<o.radius+WHEEL_CONFIG.materialRadius)){b.x=x;b.z=z;}
    else {b.vx*=-.25;b.vz*=-.25;}
    b.vx*=Math.exp(-5*dt);b.vz*=Math.exp(-5*dt);
    if(Math.hypot(b.vx,b.vz)<.01)b.vx=b.vz=0;
  }
}
export function compareResults(a:{spills:number;time:number;finishOrder:number},b:{spills:number;time:number;finishOrder:number}){return a.spills-b.spills||a.time-b.time||a.finishOrder-b.finishOrder;}
export function shouldEndRace(players:Cart[],elapsed:number,firstFinishAt:number,timeout=WHEEL_CONFIG.postFinishTimeoutSeconds){return players.length>0&&(players.every(p=>p.finishOrder>0)||(timeout>0&&firstFinishAt>=0&&elapsed-firstFinishAt>=timeout));}
export type Cart = {x:number;z:number;rotation:number;speed:number;instability:number;spills:number;reload:number;checkpoint:number;finishTime:number;finishOrder:number;lean:number};
export function resetCart(p:Cart,slot:number,count=8){
  Object.assign(p,{x:-6+(slot%4-(Math.min(count,4)-1)/2)*1.15,z:7+Math.floor(slot/4)*1.4,rotation:Math.PI,speed:0,instability:0,spills:0,reload:0,checkpoint:1,finishTime:0,finishOrder:0,lean:0});
}
const angle=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
export function onCourse(x:number,z:number){
  return WHEEL_COURSE.slice(1).some((b,i)=>{const a=WHEEL_COURSE[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<=WHEEL_CONFIG.corridorRadius;});
}
export function stepCart(p:Cart,inputX:number,inputZ:number,dt:number,material:Material[]=[]){
  if(p.finishOrder)return;
  if(p.reload>0){p.reload=Math.max(0,p.reload-dt);p.speed=0;if(p.reload===0){p.instability=0;p.lean=0;}return;}
  const magnitude=Math.min(1,Math.hypot(inputX,inputZ));
  const target=magnitude*WHEEL_CONFIG.maxSpeed;
  p.speed+=Math.max(-(target<p.speed?WHEEL_CONFIG.braking:WHEEL_CONFIG.acceleration)*dt,Math.min(WHEEL_CONFIG.acceleration*dt,target-p.speed));
  const turn=magnitude>.05?Math.max(-WHEEL_CONFIG.steering*dt,Math.min(WHEEL_CONFIG.steering*dt,angle(Math.atan2(inputX,inputZ)-p.rotation))):0;
  p.rotation=angle(p.rotation+turn);p.lean=turn/dt;
  const ratio=p.speed/WHEEL_CONFIG.maxSpeed;
  const rough=p.x>WHEEL_ROUGH.minX&&p.x<WHEEL_ROUGH.maxX&&p.z>WHEEL_ROUGH.minZ&&p.z<WHEEL_ROUGH.maxZ;
  p.instability=Math.max(0,p.instability+dt*(WHEEL_CONFIG.speedGain*ratio**3+WHEEL_CONFIG.turnGain*Math.abs(p.lean)*ratio**2+(rough?WHEEL_CONFIG.roughGain*ratio**2:0)-WHEEL_CONFIG.recovery));
  const x=p.x+Math.sin(p.rotation)*p.speed*dt,z=p.z+Math.cos(p.rotation)*p.speed*dt;
  if(onCourse(x,z)){p.x=x;p.z=z;}else{p.instability+=WHEEL_CONFIG.impactGain*ratio**2;p.speed*=.15;}
  const sin=Math.sin(p.rotation),cos=Math.cos(p.rotation);
  for(const o of [...WHEEL_OBSTACLES,...material]){
    const movable='amount' in o;
    const radius=WHEEL_CONFIG.cartRadius+(movable?WHEEL_CONFIG.materialRadius:o.radius);
    const dx=p.x+sin*WHEEL_CONFIG.cartOffset-o.x,dz=p.z+cos*WHEEL_CONFIG.cartOffset-o.z,distance=Math.hypot(dx,dz);
    if(distance>=radius)continue;
    const nx=distance>.0001?dx/distance:-sin,nz=distance>.0001?dz/distance:-cos;
    const severity=Math.max(0,-(sin*nx+cos*nz))*p.speed/WHEEL_CONFIG.maxSpeed;
    p.instability+=WHEEL_CONFIG.impactGain*severity**2*(movable?.6:1);
    p.speed*=1-Math.min(.8,severity*(movable?.5:.8));
    const separation=radius-distance+.001;
    if(movable){
      const pushX=o.x-nx*separation,pushZ=o.z-nz*separation;
      if(onCourse(pushX,pushZ)){o.x=pushX;o.z=pushZ;}else{p.x+=nx*separation;p.z+=nz*separation;}
      o.vx=Math.max(-3,Math.min(3,o.vx-nx*severity*3));o.vz=Math.max(-3,Math.min(3,o.vz-nz*severity*3));
    }else{
      const px=p.x+nx*separation,pz=p.z+nz*separation;
      if(onCourse(px,pz)){p.x=px;p.z=pz;}
      // A glancing impact turns away from the obstacle; head-on impacts brake.
      p.rotation=angle(p.rotation+(sin*nz-cos*nx)*severity*.3);
    }
  }
  if(p.instability>=WHEEL_CONFIG.spillThreshold){p.spills++;p.reload=WHEEL_CONFIG.reloadSeconds;p.speed=0;p.instability=WHEEL_CONFIG.spillThreshold;return;}
  const next=WHEEL_COURSE[p.checkpoint];
  if(next&&Math.hypot(p.x-next.x,p.z-next.z)<=WHEEL_CONFIG.checkpointRadius)p.checkpoint++;
}
export function finishCarts(players:Cart[],elapsed:number,previousOrder=0){
  let order=Math.max(previousOrder,...players.map(p=>p.finishOrder));
  // Arrival order is recorded independently from spill-first ranking.
  for(const p of players)if(!p.finishOrder&&p.checkpoint===WHEEL_COURSE.length&&p.z<=-18){p.finishTime=elapsed;p.finishOrder=++order;p.speed=0;}
  return order;
}

