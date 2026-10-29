import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import fs from 'node:fs';
import {presentationFor} from '../client/presentation.js';

test('compact framing activates only for short touch landscape and keeps the player and route in view',()=>{
 for(const [w,h]of [[844,390],[915,412],[667,375],[740,320]]){
  const p=presentationFor(w,h,true);assert.ok(p.compact);assert.ok(p.labelScale<1);
  const camera=new THREE.PerspectiveCamera(p.fov,w/h,.1,100);camera.position.set(0,p.cameraY,p.cameraZ);camera.lookAt(0,0,-p.lookAhead);camera.updateMatrixWorld();
  for(const point of [new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,-8),new THREE.Vector3(4,0,-5)]){
   const screen=point.project(camera);assert.ok(Math.abs(screen.x)<.8&&screen.y>-.7&&screen.y<.9);
  }
 }
 for(const [w,h,touch]of [[390,844,true],[1280,720,false],[844,390,false],[1024,768,true]] as const){
  const p=presentationFor(w,h,touch);assert.equal(p.compact,false);assert.equal(p.cameraY,15);assert.equal(p.cameraZ,18);assert.equal(p.lookAhead,0);
 }
});
test('landscape styling retains safe areas, touch targets, a collapsible board and dismissible results',()=>{
 const css=fs.readFileSync('client/style.css','utf8'),html=fs.readFileSync('index.html','utf8'),main=fs.readFileSync('client/main.ts','utf8');
 for(const token of ['safe-area-inset-left','safe-area-inset-right','safe-area-inset-top','safe-area-inset-bottom','100dvh','body.mobile-landscape #joystick','body.mobile-landscape #raceResults'])assert.ok(css.includes(token));
 assert.ok(html.includes('viewport-fit=cover'));assert.ok(main.includes('<details id="standings"'));assert.ok(main.includes('id="showResults"'));
 assert.ok(main.includes("dismissedResults='';renderResults"));assert.ok(css.includes('min-height:44px'));
});
