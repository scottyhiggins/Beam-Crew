import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createModularWorld} from '../client/modular-world.js';
import {COURSE_MODULES,assembleRoute,selectCourseIds} from '../shared/course-modules.js';
test('ten-course scene batches repeated geometry, culls distant legs and reuses a bounded scene on replay',()=>{
 const world=createModularWorld(),ids=COURSE_MODULES.map(c=>c.id),route=assembleRoute(ids);let maxCalls=0;
 for(let leg=0;leg<10;leg++){world.update(route[leg].entry.z-5,leg,true,ids);let calls=0,triangles=0;world.root.traverseVisible(object=>{if(object instanceof THREE.Mesh){calls++;triangles+=(object.geometry.index?.count??object.geometry.getAttribute('position').count)/3*(object instanceof THREE.InstancedMesh?object.count:1);}});maxCalls=Math.max(maxCalls,calls);assert.ok(calls<130,'course draw batches '+calls);assert.ok(triangles<100000,'active triangles '+triangles);assert.ok(world.root.children.filter(g=>g.visible).length<=3);}
 assert.ok(maxCalls>0);const baseline=world.root.children.length;for(let seed=1;seed<12;seed++)world.update(0,0,true,selectCourseIds(10,seed));assert.equal(world.root.children.length,baseline);world.update(0,0,false,ids);assert.equal(world.root.visible,false);
});
