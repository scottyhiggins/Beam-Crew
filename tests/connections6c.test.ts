import {test} from 'node:test';
import assert from 'node:assert/strict';
import {COURSE_MODULES,assembleRoute,courseSurfacePolygons,courseVisibleFences} from '../shared/course-modules.js';
import {fenceContact,type Point} from '../shared/fences.js';
function inside(p:Point,polygon:Point[]){let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)hit=!hit;}return hit;}
test('all 90 connections have owned non-overlapping surfaces, covered yards and clear visible socket barriers',()=>{
 for(const a of COURSE_MODULES)for(const b of COURSE_MODULES)if(a!==b){
  const route=assembleRoute([a.id,b.id]),[first,next]=route;
  for(const c of route)for(const polygon of courseSurfacePolygons(c))for(const p of polygon){assert.ok(p.z<=c.entry.z+1e-7&&p.z>=c.exit.z-1e-7,a.id+' → '+b.id+' surface ownership');}
  const polygons=route.flatMap(courseSurfacePolygons),fences=route.flatMap((c,i)=>courseVisibleFences(c,i,2));
  for(let dz=-3;dz<17;dz+=.2)for(const dx of [-2,-1,0,1,2]){const p={x:first.exit.x+dx,z:first.exit.z+dz+.013};assert.ok(polygons.some(poly=>inside(p,poly)),a.id+' → '+b.id+' missing ground '+JSON.stringify(p));}
  for(let dz=-2;dz<=2;dz+=.1)for(const dx of [-1,0,1])assert.equal(fenceContact({x:next.entry.x+dx,z:next.entry.z+dz},.65,fences),undefined,'visible barrier must not cap open socket');
 }
});
