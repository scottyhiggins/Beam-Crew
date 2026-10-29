import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {planSpills,debrisShapes,debrisContact,recordContact,debrisRotation} from '../shared/debris.js';
import {createSpillVisual,updateSpillVisual} from '../client/spill-visual.js';
import {resetCart,stepCart,type Cart,type Material} from '../shared/wheelbarrow.js';

const records=(id:number):Material[]=>Array.from({length:6},()=>({x:40,z:40,amount:1,materialId:id,vx:0,vz:0}));
const cartAt=(x:number,z:number)=>{const p={} as Cart;resetCart(p,0,2);Object.assign(p,{x,z:z+1.1,rotation:Math.PI,speed:2});return p;};

test('all 12 material meshes fit their shared authoritative contact shapes, including rotation and aggregation',()=>{
 for(let id=0;id<12;id++)for(const amount of [1,3,100]){
  const b=records(id);for(const value of b)value.amount=amount;const plans=planSpills(b);
  for(const [index,plan]of plans.entries()){
   const root=createSpillVisual(plan);updateSpillVisual(root,plan,0);root.rotation.y=debrisRotation(index);root.updateMatrixWorld(true);
   const shapes=debrisShapes(plan,index,{x:0,z:0});
   assert.equal(root.children.length,shapes.length?1:0); // No marks/rings at empty records.
   root.traverse(o=>{if(!(o instanceof THREE.Mesh))return;
    assert.notEqual(o.geometry.type,'RingGeometry');assert.equal((o.material as THREE.Material).transparent,false);
    const positions=o.geometry.getAttribute('position');
    for(let i=0;i<positions.count;i++){
     const p=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld);
     assert.ok(shapes.some(shape=>debrisContact(shape,p,.001)),`material ${id} mesh vertex outside collider`);
    }
   });
   for(const shape of shapes){
    assert.ok(debrisContact(shape,{x:shape.x,z:shape.z},.65));
    // Past the actual object plus cart body radius, even at a large cap pile.
    const d=shape.halfX+.65+.02,c=Math.cos(shape.rotation),s=Math.sin(shape.rotation);
    assert.equal(debrisContact(shape,{x:shape.x+c*d,z:shape.z-s*d},.65),null);
   }
  }
 }
});

test('empty slots have no server effect while visible debris retains all six material behaviors',()=>{
 for(let id=0;id<12;id++){
  const b=records(id),plans=planSpills(b);
  const empty=plans.findIndex(p=>p.pieces===0);
  if(empty>=0){b[empty].x=-6;b[empty].z=2;
   assert.equal(recordContact(plans[empty],empty,b[empty],{x:-6,z:2},.65),null);
   const actual=cartAt(-6,2),expected={...actual};stepCart(actual,0,-1,1/30,b);stepCart(expected,0,-1,1/30,[]);assert.deepEqual(actual,expected);
   b[empty].x=b[empty].z=40;
  }
  const occupied=plans.findIndex(p=>p.pieces>0);b[occupied].x=-6;b[occupied].z=2;
  const shape=debrisShapes(plans[occupied],occupied,b[occupied])[0];
  const actual=cartAt(shape.x,shape.z),expected={...actual},before={...b[occupied]};
  stepCart(actual,0,-1,1/30,b);stepCart(expected,0,-1,1/30,[]);
  const category=Math.floor(id/2);
  if(category===0)assert.ok(actual.speed<expected.speed);
  else if(category>=4)assert.ok(actual.instability>expected.instability);
  else if(category===1||category===3)assert.ok(Math.hypot(b[occupied].x-before.x,b[occupied].z-before.z)>0);
  else assert.ok(Math.hypot(actual.x-expected.x,actual.z-expected.z)>0);
  const clear=cartAt(shape.x+2.5,shape.z),clearExpected={...clear};stepCart(clear,0,-1,1/30,b);stepCart(clearExpected,0,-1,1/30,[]);assert.deepEqual(clear,clearExpected);
 }
});
