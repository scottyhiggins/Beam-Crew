import {corridorFences,type Fence,type Point} from './fences.js';
import {WHEEL_TRACK,WHEEL_CONFIG,onDriveableArea,type WheelTrack} from './wheelbarrow.js';
export const MODULE_VERSION=2;
export type BarrierStyle='rope'|'chain'|'tape';
export type CourseModule={id:string;name:string;surface:number;surfaceName:string;barrier:BarrierStyle;landmark:'original'|'scaffold'|'dump'|'excavator'|'pipes'|'bricks'|'roller'|'tanks';track:WheelTrack;drivePath:Point[]};
export type CourseInstance={module:CourseModule;track:WheelTrack;origin:Point;entry:Point;exit:Point;drivePath:Point[]};
const r=WHEEL_CONFIG.corridorRadius;
const edge=(x:number,z:number,bx:number,bz:number):Fence=>({a:{x,z},b:{x:bx,z:bz}});
export function clipFence(f:Fence,min:number,max:number):Fence|undefined{
 let a={...f.a},b={...f.b};if(Math.max(a.z,b.z)<min||Math.min(a.z,b.z)>max)return;
 for(const z of [min,max])if((a.z<z&&b.z>z)||(b.z<z&&a.z>z)){const q={x:a.x+(b.x-a.x)*(z-a.z)/(b.z-a.z),z};if(z===min){if(a.z<z)a=q;else b=q;}else{if(a.z>z)a=q;else b=q;}}
 return Math.hypot(a.x-b.x,a.z-b.z)>.00001?{a,b}:undefined;
}
const translate=(p:Point,o:Point)=>({x:p.x+o.x,z:p.z+o.z});
function moveTrack(t:WheelTrack,o:Point):WheelTrack{return {...t,path:t.path.map(p=>translate(p,o)),gates:t.gates.map(p=>({...p,...translate(p,o)})),fences:t.fences.map(f=>({a:translate(f.a,o),b:translate(f.b,o)})),obstacles:t.obstacles.map(p=>({...p,...translate(p,o)})),rough:{minX:t.rough.minX+o.x,maxX:t.rough.maxX+o.x,minZ:t.rough.minZ+o.z,maxZ:t.rough.maxZ+o.z},finishZ:t.finishZ+o.z,ramp:{...t.ramp,startZ:t.ramp.startZ+o.z,edgeZ:t.ramp.edgeZ+o.z},staging:{minX:t.staging.minX+o.x,maxX:t.staging.maxX+o.x,minZ:t.staging.minZ+o.z,maxZ:t.staging.maxZ+o.z},startArea:undefined};}
function track(id:string,path:Point[],obstacles:WheelTrack['obstacles']=[]):WheelTrack{
 const end=path.at(-1)!,finish=end.z+1,yardZ=finish-18;
 const fences=corridorFences(path,r).map(f=>clipFence(f,finish,0)).filter((f):f is Fence=>!!f);
 fences.push(edge(end.x-r,finish,end.x-r,finish-2),edge(end.x+r,finish,end.x+r,finish-2),edge(end.x-r,finish-2,end.x-8,finish-2),edge(end.x+r,finish-2,end.x+8,finish-2),edge(end.x-8,finish-2,end.x-8,yardZ),edge(end.x+8,finish-2,end.x+8,yardZ),edge(end.x-8,yardZ,end.x+8,yardZ));
 const gates=path.slice(1).map((b,i)=>{const a=path[i],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);return {x:(a.x+b.x)/2,z:(a.z+b.z)/2,nx:dx/len,nz:dz/len,halfWidth:r,label:i===0?'Entry straight':'Turn '+(i+1)};});
 gates.push({x:end.x,z:finish,nx:0,nz:-1,halfWidth:r,label:'Finish strip'});
 return {id,version:MODULE_VERSION,path,gates,fences,obstacles,rough:{minX:end.x-2.3,maxX:end.x+2.3,minZ:finish+5,maxZ:finish+6.5},finishZ:finish,ramp:{startZ:finish+1.2,edgeZ:finish-.2,height:.22},staging:{minX:end.x-8,maxX:end.x+8,minZ:yardZ,maxZ:finish+1.75}};
}
const points=(pairs:number[][])=>pairs.map(([x,z])=>({x,z}));
const scaffold=points([[0,0],[0,-7],[8,-12],[8,-21],[-2,-25],[-2,-37]]);
const dump=points([[0,0],[0,-22],[-7,-28],[-7,-38]]);
const dirt=points([[0,0],[0,-8],[-8,-15],[-8,-24],[2,-30],[2,-40]]);
const grass=points([[0,0],[0,-9],[6,-15],[0,-22],[-5,-29],[-5,-40]]);
const original=moveTrack(WHEEL_TRACK,{x:6,z:-7});
const dumpTrack=track('asphalt-haul',dump,[{x:1.45,z:-15,radius:1.2}]);
// Truck chassis is also authoritative geometry. The gravel is the partial road obstruction.
dumpTrack.fences.push(edge(3,-13.8,5.2,-13.8),edge(5.2,-13.8,5.2,-9.2),edge(5.2,-9.2,3,-9.2),edge(3,-9.2,3,-13.8));
export const COURSE_MODULES:CourseModule[]=[
 {id:'original',name:'Original Jobsite',surface:0xbfa780,surfaceName:'Sandy tan',barrier:'rope',landmark:'original',track:original,drivePath:original.path},
 {id:'scaffold-switchback',name:'Concrete Scaffold',surface:0x9ca4a4,surfaceName:'Gray concrete',barrier:'chain',landmark:'scaffold',track:track('scaffold-switchback',scaffold),drivePath:scaffold},
 {id:'asphalt-haul',name:'Dump Truck Haul Road',surface:0x444d54,surfaceName:'Dark asphalt',barrier:'chain',landmark:'dump',track:dumpTrack,drivePath:points([[0,0],[0,-7],[-1.2,-11],[-1.2,-18],[0,-22],[-7,-28],[-7,-38]])},
 {id:'earthworks',name:'Earthworks Dig',surface:0x946648,surfaceName:'Brown dirt',barrier:'tape',landmark:'excavator',track:track('earthworks',dirt),drivePath:dirt},
 {id:'utility-green',name:'Utility Green',surface:0x698652,surfaceName:'Green grass',barrier:'tape',landmark:'pipes',track:track('utility-green',grass),drivePath:grass},
];
const brick=points([[0,0],[0,-10],[-6,-16],[2,-24],[2,-34],[2,-43]]);
const grade=points([[0,0],[0,-24],[5,-31],[5,-42]]);
const steel=points([[0,0],[0,-8],[7,-16],[7,-25],[-3,-33],[-3,-44]]);
const service=points([[0,0],[0,-12],[-7,-20],[-1,-27],[5,-34],[5,-44]]);
const clay=points([[0,0],[0,-9],[9,-17],[2,-25],[-6,-33],[-6,-45]]);
COURSE_MODULES.push(
 {id:'brickworks-red',name:'Brickworks Red',surface:0xb47762,surfaceName:'Red masonry dust',barrier:'tape',landmark:'bricks',track:track('brickworks-red',brick),drivePath:brick},
 {id:'gravel-grade',name:'Gravel Grade',surface:0xaaa489,surfaceName:'Pale compacted gravel',barrier:'chain',landmark:'roller',track:track('gravel-grade',grade),drivePath:grade},
 {id:'steel-deck',name:'Steel Deck Crossing',surface:0x667c87,surfaceName:'Blue-gray steel deck',barrier:'tape',landmark:'scaffold',track:track('steel-deck',steel),drivePath:steel},
 {id:'service-court',name:'Service Court',surface:0xc6bea3,surfaceName:'Cream concrete',barrier:'chain',landmark:'tanks',track:track('service-court',service),drivePath:service},
 {id:'clay-cut',name:'Clay Cut',surface:0xad844b,surfaceName:'Ochre clay',barrier:'tape',landmark:'excavator',track:track('clay-cut',clay),drivePath:clay}
);
export const AVAILABLE_LENGTHS=[2,3,5,10] as const;
export function validChampionshipLength(value:unknown):value is number{return typeof value==='number'&&AVAILABLE_LENGTHS.some(n=>n===value);}
export function selectCourseIds(count:number,seed:number){
 if(count!==3&&count!==5&&count!==10)throw Error('Uncertified Championship length');
 const ids=COURSE_MODULES.map(m=>m.id);let value=seed>>>0||0x9e3779b9;
 const random=()=>{value+=0x6d2b79f5;let t=value;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
 for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
 return ids.slice(0,count);
}
export function assembleRoute(ids:readonly string[]):CourseInstance[]{
 if(ids.length<1||ids.length>COURSE_MODULES.length||new Set(ids).size!==ids.length)throw Error('Invalid course order');
 const route:CourseInstance[]=[];let entry:Point={x:-6,z:7};
 for(const id of ids){
  const module=COURSE_MODULES.find(m=>m.id===id);if(!module)throw Error('Unknown course');
  const origin={...entry},t=moveTrack(module.track,origin),previous=route.at(-1);
  if(previous){
   t.fences=t.fences.map(f=>clipFence(f,-Infinity,entry.z)).filter((f):f is Fence=>!!f);
   const p=previous.track,c=(p.staging.minX+p.staging.maxX)/2;
   const entrance=p.fences.filter(f=>!(Math.abs(f.a.z-entry.z)<1e-7&&Math.abs(f.b.z-entry.z)<1e-7)).map(f=>clipFence(f,entry.z,p.finishZ+3)).filter((f):f is Fence=>!!f);
   t.fences.push(...entrance,edge(c-8,entry.z,c-r,entry.z),edge(c+r,entry.z,c+8,entry.z));
   t.startArea=(x,z)=>z>=p.staging.minZ&&z<=p.finishZ+1.75&&onDriveableArea(x,z,p);
  }
  const exit={x:(t.staging.minX+t.staging.maxX)/2,z:t.staging.minZ};
  route.push({module,track:t,origin,entry:{...entry},exit,drivePath:module.drivePath.map(p=>translate(p,origin))});entry=exit;
 }
 return route;
}
export function routeHeight(route:CourseInstance[],x:number,z:number){
 for(const {track:t}of route){const c=(t.staging.minX+t.staging.maxX)/2;if(Math.abs(x-c)<=r&&z<=t.ramp.startZ&&z>=t.ramp.edgeZ)return t.ramp.height*(t.ramp.startZ-z)/(t.ramp.startZ-t.ramp.edgeZ);}
 return 0;
}
export function routeWorld(route:CourseInstance[]):WheelTrack{
 if(!route.length)throw Error('Empty route');return {...route[0].track,fences:route.flatMap(c=>c.track.fences),obstacles:route.flatMap(c=>c.track.obstacles),startArea:(x,z)=>route.some(c=>onDriveableArea(x,z,c.track))};
}

export function clipSurface(points:Point[],minZ:number,maxZ:number):Point[]{
 let result=points;
 for(const [z,sign]of [[minZ,1],[maxZ,-1]]){
  const input=result;result=[];
  for(let i=0;i<input.length;i++){
   const a=input[i],b=input[(i+1)%input.length],inside=(a.z-z)*sign>=-1e-8,next=(b.z-z)*sign>=-1e-8;
   if(inside)result.push(a);
   if(inside!==next)result.push({x:a.x+(b.x-a.x)*(z-a.z)/(b.z-a.z),z});
  }
 }
 return result;
}
export function courseSurfacePolygons(c:CourseInstance){
 const t=c.track,r=2.8,polygons:Point[][]=[];
 for(let i=1;i<t.path.length;i++){
  const a=t.path[i-1],b=t.path[i],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),ox=dz/len*r,oz=-dx/len*r;
  polygons.push([{x:a.x+ox,z:a.z+oz},{x:b.x+ox,z:b.z+oz},{x:b.x-ox,z:b.z-oz},{x:a.x-ox,z:a.z-oz}]);
 }
 for(const p of t.path)polygons.push(Array.from({length:24},(_,i)=>({x:p.x+Math.cos(i*Math.PI/12)*r,z:p.z+Math.sin(i*Math.PI/12)*r})));
 const surfaces=polygons.map(p=>clipSurface(p,t.finishZ,c.entry.z)).filter(p=>p.length>=3),x=c.exit.x;
 // The neck and widened yard meet the finish and next entry exactly, without coplanar neighbor overlap.
 surfaces.push([{x:x-r,z:t.finishZ},{x:x+r,z:t.finishZ},{x:x+r,z:t.finishZ-2},{x:x+8,z:t.finishZ-2},{x:x+8,z:c.exit.z},{x:x-8,z:c.exit.z},{x:x-8,z:t.finishZ-2},{x:x-r,z:t.finishZ-2}]);
 return surfaces;
}
export function courseVisibleFences(c:CourseInstance,index:number,total:number):Fence[]{
 const x=c.exit.x;
 return c.module.track.fences.map(f=>({a:translate(f.a,c.origin),b:translate(f.b,c.origin)}))
  .map(f=>clipFence(f,c.exit.z,c.entry.z)).filter((f):f is Fence=>!!f).flatMap(f=>
   index<total-1&&Math.abs(f.a.z-c.exit.z)<1e-7&&Math.abs(f.b.z-c.exit.z)<1e-7?
    [edge(x-8,c.exit.z,x-r,c.exit.z),edge(x+r,c.exit.z,x+8,c.exit.z)]:[f]);
}
