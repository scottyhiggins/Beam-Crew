import {corridorFences,type Point,type Fence} from './fences.js';
import {WHEEL_TRACK,WHEEL_CONFIG,onDriveableArea,type WheelTrack} from './wheelbarrow.js';
export const COURSE_CONTRACT_VERSION=1;
export const SHARED_EXIT={x:-3,z:-36,width:5.6,height:0,direction:Math.PI};
// Module-local coordinates; assembly uses the same translation on server and client.
export const COURSE_TWO_MODULE={id:'scaffold-switchback',version:1,entry:{x:0,z:0},exit:{x:-2,z:-54},path:[{x:0,z:0},{x:0,z:-7},{x:8,z:-12},{x:8,z:-21},{x:-2,z:-25},{x:-2,z:-37}]};
export const COURSE_TWO_PATH=COURSE_TWO_MODULE.path.map(p=>({x:p.x+SHARED_EXIT.x,z:p.z+SHARED_EXIT.z}));
const edge=(x:number,z:number,bx:number,bz:number):Fence=>({a:{x,z},b:{x:bx,z:bz}});
// Clip caps at socket planes, never carry a hidden end fence across a shared yard.
function clip(f:Fence,min:number,max:number):Fence|undefined{let a={...f.a},b={...f.b};if(Math.max(a.z,b.z)<min||Math.min(a.z,b.z)>max)return;for(const z of [min,max]){if((a.z<z&&b.z>z)||(b.z<z&&a.z>z)){const q={x:a.x+(b.x-a.x)*(z-a.z)/(b.z-a.z),z};if(z===min){if(a.z<z)a=q;else b=q;}else{if(a.z>z)a=q;else b=q;}}}return {a,b};}
const r=WHEEL_CONFIG.corridorRadius;
const ropes=corridorFences(COURSE_TWO_PATH,r).map(f=>clip(f,-72,-36)).filter((f):f is Fence=>!!f);
const center=-5;
export const COURSE_TWO:WheelTrack={id:COURSE_TWO_MODULE.id,version:1,path:COURSE_TWO_PATH,
 gates:[{x:-3,z:-40,nx:0,nz:-1,halfWidth:r,label:'Pipe alley'}, {x:1,z:-45.5,nx:8/Math.sqrt(89),nz:-5/Math.sqrt(89),halfWidth:r,label:'Scaffold bend'}, {x:5,z:-52,nx:0,nz:-1,halfWidth:r,label:'Tower crane'}, {x:0,z:-59,nx:-10/Math.sqrt(116),nz:-4/Math.sqrt(116),halfWidth:r,label:'Lumber switchback'}, {x:-5,z:-66,nx:0,nz:-1,halfWidth:r,label:'Final straight'}, {x:-5,z:-72,nx:0,nz:-1,halfWidth:r,label:'Championship finish'}],
 fences:[...WHEEL_TRACK.fences.filter(f=>!(f.a.z===-36&&f.b.z===-36)),edge(-11,-36,-5.8,-36),edge(-.2,-36,5,-36),...ropes,edge(center-r,-72,center-r,-74),edge(center+r,-72,center+r,-74),edge(center-r,-74,-13,-74),edge(center+r,-74,3,-74),edge(-13,-74,-13,-90),edge(3,-74,3,-90),edge(-13,-90,3,-90)],
 obstacles:[],rough:{minX:2.4,maxX:7.6,minZ:-55,maxZ:-53.5},finishZ:-72,ramp:{startZ:-70.8,edgeZ:-72.2,height:.22},staging:{minX:-13,maxX:3,minZ:-90,maxZ:-70.25},
 startArea:(x,z)=>z<=-16.25&&z>=-36&&onDriveableArea(x,z,WHEEL_TRACK)};
// Static gate occupies the original yard's far boundary until authoritative GO.
export const CHAMPIONSHIP_ROUTE=[WHEEL_TRACK.id,COURSE_TWO.id] as const;
export const CHAMPIONSHIP_WORLD_FENCES=COURSE_TWO.fences;
export function championshipTrack(leg:number){return leg===1?COURSE_TWO:WHEEL_TRACK;}
export function championshipHeight(x:number,z:number){const t=z<-60?COURSE_TWO:WHEEL_TRACK;const c=(t.staging.minX+t.staging.maxX)/2;return Math.abs(x-c)<=r&&z<=t.ramp.startZ&&z>=t.ramp.edgeZ?t.ramp.height*(t.ramp.startZ-z)/(t.ramp.startZ-t.ramp.edgeZ):0;}
