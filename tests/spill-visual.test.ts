import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createLoadVisual} from '../client/load-visual.js';
import {createSpillVisual} from '../client/spill-visual.js';

test('all 12 ground/spilling models preserve loaded geometry and colors in one cached draw call',()=>{
 for(let id=0;id<12;id++){
  const load=new THREE.Group();createLoadVisual(load,id);let vertices=0;
  load.traverse(o=>{if(o instanceof THREE.Mesh)vertices+=o.geometry.index?.count??o.geometry.getAttribute('position').count;});
  const spill=createSpillVisual(id),again=createSpillVisual(id);
  assert.equal(spill.geometry.getAttribute('position').count,vertices);
  assert.equal(spill.geometry,again.geometry);assert.equal(spill.material,again.material);
  assert.equal(spill.children.length,0);assert.ok(vertices<12000);
  const bounds=new THREE.Box3().setFromObject(spill);assert.ok(bounds.max.x-bounds.min.x<.85);assert.ok(bounds.max.z-bounds.min.z<.9);
  assert.equal(spill.geometry.getAttribute('color').count,vertices);
  for(const value of spill.geometry.getAttribute('position').array)assert.ok(Number.isFinite(value));
 }
});
