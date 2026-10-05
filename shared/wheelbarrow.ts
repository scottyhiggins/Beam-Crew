export const WHEEL_CONFIG = {
  maxSpeed: 5.5, acceleration: 3.8, braking: 7, steering: 2.8,
  speedGain: .24, turnGain: .65, roughGain: .65, recovery: .3,
  spillThreshold: 1, reloadSeconds: 2.4, countdownSeconds: 3,
  corridorRadius: 2.8, checkpointRadius: 2.4,
};
export const WHEEL_COURSE = [
  {x:-6,z:7}, {x:-6,z:-2}, {x:2,z:-6},
  {x:4,z:-10}, {x:-3,z:-10}, {x:-3,z:-19},
];
export type Cart = {x:number;z:number;rotation:number;speed:number;instability:number;spills:number;reload:number;checkpoint:number;finishTime:number;finishOrder:number;lean:number};
export function resetCart(p:Cart,slot:number,count=8){
  Object.assign(p,{x:-6+(slot%4-(Math.min(count,4)-1)/2)*1.15,z:7+Math.floor(slot/4)*1.4,rotation:Math.PI,speed:0,instability:0,spills:0,reload:0,checkpoint:1,finishTime:0,finishOrder:0,lean:0});
}
const angle=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
export function onCourse(x:number,z:number){
  return WHEEL_COURSE.slice(1).some((b,i)=>{const a=WHEEL_COURSE[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<=WHEEL_CONFIG.corridorRadius;});
}
export function stepCart(p:Cart,inputX:number,inputZ:number,dt:number){
  if(p.finishOrder)return;
  if(p.reload>0){p.reload=Math.max(0,p.reload-dt);p.speed=0;if(p.reload===0){p.instability=0;p.lean=0;}return;}
  const magnitude=Math.min(1,Math.hypot(inputX,inputZ));
  const target=magnitude*WHEEL_CONFIG.maxSpeed;
  p.speed+=Math.max(-(target<p.speed?WHEEL_CONFIG.braking:WHEEL_CONFIG.acceleration)*dt,Math.min(WHEEL_CONFIG.acceleration*dt,target-p.speed));
  const turn=magnitude>.05?Math.max(-WHEEL_CONFIG.steering*dt,Math.min(WHEEL_CONFIG.steering*dt,angle(Math.atan2(inputX,inputZ)-p.rotation))):0;
  p.rotation=angle(p.rotation+turn);p.lean=turn/dt;
  const ratio=p.speed/WHEEL_CONFIG.maxSpeed;
  const rough=p.checkpoint===4&&p.x<2&&p.x>-2;
  p.instability=Math.max(0,p.instability+dt*(WHEEL_CONFIG.speedGain*ratio**3+WHEEL_CONFIG.turnGain*Math.abs(p.lean)*ratio**2+(rough?WHEEL_CONFIG.roughGain*ratio**2:0)-WHEEL_CONFIG.recovery));
  if(p.instability>=WHEEL_CONFIG.spillThreshold){p.spills++;p.reload=WHEEL_CONFIG.reloadSeconds;p.speed=0;p.instability=WHEEL_CONFIG.spillThreshold;return;}
  const x=p.x+Math.sin(p.rotation)*p.speed*dt,z=p.z+Math.cos(p.rotation)*p.speed*dt;
  if(onCourse(x,z)){p.x=x;p.z=z;}else{p.speed=0;}
  const next=WHEEL_COURSE[p.checkpoint];
  if(next&&Math.hypot(p.x-next.x,p.z-next.z)<=WHEEL_CONFIG.checkpointRadius)p.checkpoint++;
}
export function finishCarts(players:Cart[],elapsed:number,previousOrder=0){
  let order=Math.max(previousOrder,...players.map(p=>p.finishOrder));
  // Same simulation tick is a tie in time; stable player insertion order resolves placing.
  for(const p of players)if(!p.finishOrder&&p.checkpoint===WHEEL_COURSE.length&&p.z<=-18){p.finishTime=elapsed;p.finishOrder=++order;p.speed=0;}
  return order;
}

