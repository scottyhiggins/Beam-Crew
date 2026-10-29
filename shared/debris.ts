import {MATERIAL_PIECE_COUNTS} from './materials.js';
export const HAZARDS_PER_LOAD=6;

export type HazardRecord={materialId?:number;amount:number};
export type SpillPlan={id:number;pieces:number;offset:number;volume:number};

// Each of the six unchanged server hazards contributes 1/6 of a load.
// Carry fractional objects across records, including aggregation at the cap.
export function planSpills(records:Iterable<HazardRecord>):SpillPlan[]{
 const units=Array<number>(12).fill(0);
 return Array.from(records,b=>{
  const id=b.materialId??6,count=MATERIAL_PIECE_COUNTS[id],before=units[id];
  units[id]+=b.amount;
  const first=Math.floor(before*count/HAZARDS_PER_LOAD);
  const end=Math.floor(units[id]*count/HAZARDS_PER_LOAD);
  return {id,pieces:end-first,offset:first%count,volume:id<2?end-first:b.amount/HAZARDS_PER_LOAD};
 });
}

export const debrisRotation=(index:number)=>index*2.399;
export function debrisScale(plan:SpillPlan){return plan.id<2?Math.min(1.6,Math.cbrt(plan.volume)):Math.min(1.6,Math.cbrt(Math.max(1,plan.pieces/12)));}
export function debrisParts(plan:SpillPlan){
 const visible=Math.min(12,plan.pieces),scale=debrisScale(plan);
 return Array.from({length:visible},(_,i)=>({
  index:(plan.offset+i)%MATERIAL_PIECE_COUNTS[plan.id],
  // Scatter individual full-size objects, never a repeated miniature stack.
  x:visible>1?Math.cos((plan.offset+i)*2.399)*.22:0,
  z:visible>1?Math.sin((plan.offset+i)*2.399)*.22:0,
  y:0,
  rotation:(plan.offset+i)*2.399,scale,
 }));
}

export type DebrisPoint={x:number;z:number};
export type DebrisShape={x:number;z:number;rotation:number;halfX:number;halfZ:number;kind:'box'|'circle'|'ellipse'};
// These dimensions match the existing loaded geometry, centered by the client.
const bounds:ReadonlyArray<readonly [number,number,'box'|'circle'|'ellipse']>=[
 [.52,.6,'ellipse'],[.52,.6,'ellipse'],[.09,.6,'box'],[.05,.6,'box'],
 [.475,.06,'box'],[.37,.37,'circle'],[.21,.25,'box'],[.205,.24,'box'],
 [.09,.575,'box'],[.4,.275,'box'],[.11,.11,'circle'],[.18,.18,'circle'],
];
export function debrisShapes(plan:SpillPlan,index:number,origin:DebrisPoint):DebrisShape[]{
 const yaw=debrisRotation(index),c=Math.cos(yaw),s=Math.sin(yaw),[hx,hz,kind]=bounds[plan.id];
 return debrisParts(plan).map(p=>({x:origin.x+(p.x*c+p.z*s)*p.scale,z:origin.z+(-p.x*s+p.z*c)*p.scale,
  rotation:yaw+p.rotation+(plan.id===8||plan.id===9?(p.index%2-.5)*.35:0),
  halfX:hx*p.scale,halfZ:hz*p.scale,kind}));
}

function localBoundary(shape:DebrisShape,p:DebrisPoint){
 if(shape.kind==='box'){
  const x=Math.max(-shape.halfX,Math.min(shape.halfX,p.x)),z=Math.max(-shape.halfZ,Math.min(shape.halfZ,p.z));
  if(Math.abs(p.x)>shape.halfX||Math.abs(p.z)>shape.halfZ)return {x,z,inside:false};
  const dx=shape.halfX-Math.abs(p.x),dz=shape.halfZ-Math.abs(p.z);
  return dx<dz?{x:(p.x>=0?1:-1)*shape.halfX,z:p.z,inside:true}:{x:p.x,z:(p.z>=0?1:-1)*shape.halfZ,inside:true};
 }
 // The loose heaps' top-down silhouette is the same ten-sided ellipse as
 // SphereGeometry(1,10,6), not a large circular patch around an invisible center.
 let best={x:0,z:0,inside:true},distance=Infinity;
 for(let i=0;i<10;i++){
  const a={x:Math.cos(i*Math.PI/5)*shape.halfX,z:Math.sin(i*Math.PI/5)*shape.halfZ};
  const b={x:Math.cos((i+1)*Math.PI/5)*shape.halfX,z:Math.sin((i+1)*Math.PI/5)*shape.halfZ};
  const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz)));
  const x=a.x+t*dx,z=a.z+t*dz,d=Math.hypot(p.x-x,p.z-z);
  if(dx*(p.z-a.z)-dz*(p.x-a.x)<-1e-9)best.inside=false;
  if(d<distance){distance=d;best.x=x;best.z=z;}
 }
 return best;
}

export function debrisContact(shape:DebrisShape,point:DebrisPoint,radius:number){
 const c=Math.cos(shape.rotation),s=Math.sin(shape.rotation),dx=point.x-shape.x,dz=point.z-shape.z;
 const p={x:dx*c-dz*s,z:dx*s+dz*c};
 if(Math.abs(p.x)>shape.halfX+radius||Math.abs(p.z)>shape.halfZ+radius)return null;
 let nx:number,nz:number,depth:number;
 if(shape.kind==='circle'){
  const d=Math.hypot(p.x,p.z);depth=radius+shape.halfX-d;if(depth<=0)return null;
  nx=d>1e-8?p.x/d:1;nz=d>1e-8?p.z/d:0;
 }else{
  const edge=localBoundary(shape,p),ex=p.x-edge.x,ez=p.z-edge.z,d=Math.hypot(ex,ez);
  depth=edge.inside?radius+d:radius-d;if(depth<=0)return null;
  const sign=edge.inside?-1:1;
  if(d>1e-8){nx=sign*ex/d;nz=sign*ez/d;}
  else if(shape.kind==='box'){nx=Math.abs(edge.x)>=shape.halfX-1e-8?Math.sign(edge.x):0;nz=nx?0:Math.sign(edge.z);}
  else {const gx=edge.x/shape.halfX**2,gz=edge.z/shape.halfZ**2,n=Math.hypot(gx,gz)||1;nx=gx/n;nz=gz/n;}
 }
 return {nx:nx*c+nz*s,nz:-nx*s+nz*c,depth};
}

export function recordContact(plan:SpillPlan,index:number,origin:DebrisPoint,point:DebrisPoint,radius:number){
 if(plan.pieces===0)return null;
 const reach=1.3*debrisScale(plan)+radius;
 if((point.x-origin.x)**2+(point.z-origin.z)**2>reach*reach)return null;
 let result:ReturnType<typeof debrisContact>=null;
 for(const shape of debrisShapes(plan,index,origin)){const contact=debrisContact(shape,point,radius);if(contact&&(!result||contact.depth>result.depth))result=contact;}
 return result;
}
