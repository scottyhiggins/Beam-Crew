// All values are world units / seconds. Tune the mechanic here; no physics engine.
export const BEAM_CONFIG = {
  length: 6.4, width: .32, gripSideOffset: .95, grabRadius: 1.25,
  carriedEffectiveness: .9, draggingEffectiveness: .2,
  driveSpeed: 2.8, turnGain: 1.6, acceleration: 7, maxTurnSpeed: 1.25,
  carriedHeight: 1.05, groundedHeight: .22, heightResponse: 7,
  halfSize: 10, collisionMargin: .04, deliveryHoldSeconds: .7,
};
export const GRIPS = [-2.7, -.9, .9, 2.7].flatMap(u => [-1, 1].map(side => ({u, side})));
export type Obstacle = {x:number; z:number; halfX:number; halfZ:number};
export const COURSE = {
  start: {x:-5, z:6, angle:Math.PI/2},
  checkpoint: {x:-5, z:-3.8, angle:Math.PI/2},
  doorwayZ: 1.5,
  obstacles: [
    {x:-8.35,z:1.5,halfX:1.65,halfZ:.25},
    {x:3.35,z:1.5,halfX:6.65,halfZ:.25},
    {x:-1,z:-3.8,halfX:.8,halfZ:.9},
  ] satisfies Obstacle[],
  goal: {x:4.3,z:-7.5,halfX:4.6,halfZ:1.8},
};
export type BeamMotion = {
  x:number; z:number; angle:number; vx:number; vz:number; angularVelocity:number;
  leftHeight:number; rightHeight:number; leftSupported:boolean; rightSupported:boolean;
  checkpoint:boolean; delivered:boolean; deliveryTime:number; blocked:boolean;
};
export type Carrier = {grip:number; inputX:number; inputZ:number};
export function createBeam():BeamMotion {
  return {...COURSE.start,vx:0,vz:0,angularVelocity:0,leftHeight:BEAM_CONFIG.groundedHeight,
    rightHeight:BEAM_CONFIG.groundedHeight,leftSupported:false,rightSupported:false,
    checkpoint:false,delivered:false,deliveryTime:0,blocked:false};
}
export function resetBeam(b:BeamMotion,fromCheckpoint=true) {
  const checkpoint=fromCheckpoint&&b.checkpoint;
  Object.assign(b,createBeam(),checkpoint?COURSE.checkpoint:COURSE.start,{checkpoint});
}
export function gripPosition(b:Pick<BeamMotion,'x'|'z'|'angle'>,index:number) {
  const g=GRIPS[index], c=Math.cos(b.angle), s=Math.sin(b.angle);
  return {x:b.x+c*g.u-s*g.side*BEAM_CONFIG.gripSideOffset,
    z:b.z+s*g.u+c*g.side*BEAM_CONFIG.gripSideOffset};
}
export function nearestGrip(b:BeamMotion,x:number,z:number,occupied:Set<number>) {
  let result=-1, distance=BEAM_CONFIG.grabRadius;
  GRIPS.forEach((_,i)=>{if(occupied.has(i))return;const p=gripPosition(b,i),d=Math.hypot(p.x-x,p.z-z);
    if(d<distance){distance=d;result=i;}});
  return result;
}
export function beamCorners(b:Pick<BeamMotion,'x'|'z'|'angle'>) {
  const c=Math.cos(b.angle),s=Math.sin(b.angle);
  return [-1,1].flatMap(end=>[-1,1].map(side=>({
    x:b.x+c*end*BEAM_CONFIG.length/2-s*side*BEAM_CONFIG.width/2,
    z:b.z+s*end*BEAM_CONFIG.length/2+c*side*BEAM_CONFIG.width/2,
  })));
}
export function beamCollides(b:Pick<BeamMotion,'x'|'z'|'angle'>) {
  const c=Math.cos(b.angle),s=Math.sin(b.angle),half=BEAM_CONFIG.length/2;
  const width=BEAM_CONFIG.width/2+BEAM_CONFIG.collisionMargin;
  if(beamCorners(b).some(p=>Math.abs(p.x)>BEAM_CONFIG.halfSize-.1||Math.abs(p.z)>BEAM_CONFIG.halfSize-.1))return true;
  return COURSE.obstacles.some(o=>[[1,0],[0,1],[c,s],[-s,c]].every(([ax,az])=>{
    const distance=Math.abs((b.x-o.x)*ax+(b.z-o.z)*az);
    const beamRadius=half*Math.abs(c*ax+s*az)+width*Math.abs(-s*ax+c*az);
    const boxRadius=o.halfX*Math.abs(ax)+o.halfZ*Math.abs(az);
    return distance<beamRadius+boxRadius;
  }));
}
export function workerCollides(x:number,z:number,radius=.45) {
  return COURSE.obstacles.some(o=>Math.hypot(Math.max(Math.abs(x-o.x)-o.halfX,0),Math.max(Math.abs(z-o.z)-o.halfZ,0))<radius);
}
export function stepBeam(b:BeamMotion,carriers:Carrier[],dt:number) {
  const cfg=BEAM_CONFIG, c=Math.cos(b.angle),s=Math.sin(b.angle);
  b.leftSupported=carriers.some(p=>GRIPS[p.grip]?.u<0);
  b.rightSupported=carriers.some(p=>GRIPS[p.grip]?.u>0);
  const blend=1-Math.exp(-cfg.heightResponse*dt);
  b.leftHeight+=((b.leftSupported?cfg.carriedHeight:cfg.groundedHeight)-b.leftHeight)*blend;
  b.rightHeight+=((b.rightSupported?cfg.carriedHeight:cfg.groundedHeight)-b.rightHeight)*blend;
  let fx=0,fz=0,torque=0;
  for(const p of carriers){const g=GRIPS[p.grip];if(!g)continue;
    const n=Math.max(1,Math.hypot(p.inputX,p.inputZ)),x=p.inputX/n,z=p.inputZ/n;
    fx+=x;fz+=z;torque+=(c*g.u)*z-(s*g.u)*x;
  }
  const count=Math.max(1,carriers.length),half=cfg.length/2;
  const translationX=fx/count*cfg.driveSpeed,translationZ=fz/count*cfg.driveSpeed;
  const turn=Math.max(-cfg.maxTurnSpeed,Math.min(cfg.maxTurnSpeed,torque/count/half/half*cfg.driveSpeed*cfg.turnGain));
  const left=b.leftSupported?cfg.carriedEffectiveness:cfg.draggingEffectiveness;
  const right=b.rightSupported?cfg.carriedEffectiveness:cfg.draggingEffectiveness;
  // Mobility at each end couples dragging to turning in a predictable way.
  const lx=(translationX+s*half*turn)*left,lz=(translationZ-c*half*turn)*left;
  const rx=(translationX-s*half*turn)*right,rz=(translationZ+c*half*turn)*right;
  const response=1-Math.exp(-cfg.acceleration*dt);
  b.vx+=((lx+rx)/2-b.vx)*response;b.vz+=((lz+rz)/2-b.vz)*response;
  const targetTurn=(-s*(rx-lx)+c*(rz-lz))/(2*half);
  b.angularVelocity+=(targetTurn-b.angularVelocity)*response;
  const collides=()=>beamCollides(b)||carriers.some(p=>{const point=gripPosition(b,p.grip);return workerCollides(point.x,point.z)||Math.abs(point.x)>cfg.halfSize-.45||Math.abs(point.z)>cfg.halfSize-.45;});
  b.blocked=false;
  if(b.delivered){b.vx=b.vz=b.angularVelocity=0;return;}
  // Tiny deterministic substeps prevent tunneling; split axes permit wall sliding.
  const steps=Math.max(1,Math.ceil(Math.max(Math.hypot(b.vx,b.vz),Math.abs(b.angularVelocity)*half)*dt/.04));
  for(let i=0;i<steps;i++){
    const oldX=b.x;b.x+=b.vx*dt/steps;if(collides()){b.x=oldX;b.vx=0;b.blocked=true;}
    const oldZ=b.z;b.z+=b.vz*dt/steps;if(collides()){b.z=oldZ;b.vz=0;b.blocked=true;}
    const oldAngle=b.angle;b.angle+=b.angularVelocity*dt/steps;if(collides()){b.angle=oldAngle;b.angularVelocity=0;b.blocked=true;}
  }
  b.angle=Math.atan2(Math.sin(b.angle),Math.cos(b.angle));
  if(!b.checkpoint&&beamCorners(b).every(p=>p.z<COURSE.doorwayZ-.5))b.checkpoint=true;
  const goal=COURSE.goal;
  const inside=beamCorners(b).every(p=>Math.abs(p.x-goal.x)<=goal.halfX&&Math.abs(p.z-goal.z)<=goal.halfZ);
  b.deliveryTime=inside?b.deliveryTime+dt:0;
  if(b.deliveryTime>=cfg.deliveryHoldSeconds){b.delivered=true;b.vx=b.vz=b.angularVelocity=0;}
}
