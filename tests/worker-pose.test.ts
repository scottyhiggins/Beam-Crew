import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {makeWorker,animateWorker} from '../client/worker.js';
test('wheel grip reaches handles behind the tray and stumble bends/steps then settles',()=>{
 const worker=makeWorker(0xffaa33);worker.position.z=-.7;animateWorker(worker,0,true,1000,0,true);worker.updateMatrixWorld(true);
 const limbs=worker.userData.limbs as THREE.Group[],knees=worker.userData.knees as THREE.Group[];
 for(const arm of limbs.slice(2)){const hand=arm.children[1].getWorldPosition(new THREE.Vector3());assert.ok(Math.abs(hand.z+.35)<.1);assert.ok(Math.abs(hand.y-.75)<.12);}
 const poses=[];
 for(const now of [1000,1050,1100]){animateWorker(worker,0,true,now,1,true);poses.push(limbs[0].rotation.x);assert.equal(limbs[2].rotation.x,-.65);assert.ok(knees.some(k=>Math.abs(k.rotation.x)>.01));}
 assert.equal(new Set(poses).size,3);animateWorker(worker,0,true,1300,0,true);
 assert.equal(knees[0].rotation.x,0);assert.equal(knees[1].rotation.x,0);assert.equal(worker.rotation.z,0);
});
