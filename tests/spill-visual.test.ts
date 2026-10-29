import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createLoadVisual,MATERIAL_PIECE_COUNTS} from '../client/load-visual.js';
import {planSpills} from '../client/spill-plan.js';
import {createSpillVisual,updateSpillVisual} from '../client/spill-visual.js';
import {resetCart,spillMaterial,type Cart,type Material,WHEEL_CONFIG} from '../shared/wheelbarrow.js';

function vertices(g:THREE.Object3D){let total=0;g.traverse(o=>{if(o instanceof THREE.Mesh)total+=o.geometry.index?.count??o.geometry.getAttribute('position').count;});return total;}
function colors(g:THREE.Object3D){const histogram:Record<string,number>={};g.traverse(o=>{if(!(o instanceof THREE.Mesh))return;const attribute=o.geometry.getAttribute('color');const uniform=(o.material as THREE.MeshLambertMaterial).color;const count=o.geometry.index?.count??o.geometry.getAttribute('position').count;for(let i=0;i<count;i++){const key=(attribute?[attribute.getX(i),attribute.getY(i),attribute.getZ(i)]:[uniform.r,uniform.g,uniform.b]).map(v=>Math.round(v*1000)).join(',');histogram[key]=(histogram[key]??0)+1;}});return histogram;}
test('one real server spill has exactly one load of solid objects or loose volume, for all twelve materials',()=>{
 for(let id=0;id<12;id++){
  const p={materialId:id} as Cart;resetCart(p,0,2);p.materialId=id;
  const records:Material[]=[];spillMaterial(p,records,b=>records.push(b));assert.equal(records.length,6);
  const plans=planSpills(records),load=new THREE.Group();createLoadVisual(load,id);
  let pieceVertices=0,count=0,volume=0,scaledVolume=0;const spilledPieces=new THREE.Group();
  for(const plan of plans){const root=createSpillVisual(plan);updateSpillVisual(root,plan,1);
   assert.equal(root.children.length,plan.pieces>0?1:0); // No rings or geometry at empty slots.
   const pieces=root.getObjectByName('pieces') as THREE.Mesh|undefined;
   if(pieces){const again=createSpillVisual(plan).getObjectByName('pieces') as THREE.Mesh;assert.equal(pieces.geometry,again.geometry);pieceVertices+=pieces.geometry.getAttribute('position').count;spilledPieces.add(pieces.clone());scaledVolume+=pieces.scale.x**3;
    for(const value of pieces.geometry.getAttribute('position').array)assert.ok(Number.isFinite(value));
    assert.equal(pieces.geometry.getAttribute('color').count,pieces.geometry.getAttribute('position').count);
   }
   count+=root.userData.visiblePieces;volume+=plan.volume;
  }
  assert.ok(Math.abs(volume-1)<1e-9);
  if(id>=2){assert.equal(count,MATERIAL_PIECE_COUNTS[id]);assert.equal(pieceVertices,vertices(load));assert.deepEqual(colors(spilledPieces),colors(load));}
  else {assert.equal(count,6);assert.ok(Math.abs(scaledVolume-1)<1e-9);} // Six 1/6-volume patches.
 }
});
test('mixed repeated spills and cap aggregation conserve quantities with bounded visible geometry',()=>{
 const records:Material[]=[];
 for(let round=0;round<3;round++)for(let id=0;id<12;id++){
  const p={materialId:id} as Cart;resetCart(p,0,2);p.materialId=id;spillMaterial(p,records,b=>records.push(b));
 }
 assert.equal(records.length,WHEEL_CONFIG.maxMaterial);
 const plans=planSpills(records);
 for(let id=0;id<12;id++){
  const selected=plans.filter(p=>p.id===id);
  if(id>=2)assert.equal(selected.reduce((sum,p)=>sum+p.pieces,0),3*MATERIAL_PIECE_COUNTS[id]);
  else assert.ok(Math.abs(selected.reduce((sum,p)=>sum+p.volume,0)-3)<1e-9);
 }
 for(const plan of planSpills([{materialId:3,amount:9999}])){const root=createSpillVisual(plan);updateSpillVisual(root,plan,1);assert.equal(root.userData.visiblePieces,12);assert.ok(vertices(root)<15000);}
});
