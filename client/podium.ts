import * as THREE from 'three';
import {makeWorker} from './worker';
import {podiumPlace,type PodiumEntry} from '../shared/podium';
import './podium.css';
/** Reusable read-only awards renderer. Call clear on replay/leave; update is signature guarded. */
export class Podium {
 private signature='';private release=()=>{};
 constructor(private host:HTMLElement){}
 clear(){this.signature='';this.release();this.release=()=>{};this.host.replaceChildren();}
 update(entries:PodiumEntry[]){
 const signature=JSON.stringify(entries);if(signature===this.signature)return;this.clear();this.signature=signature;
 this.host.classList.add('awards');
 const heading=document.createElement('p');heading.className='awards-kicker';heading.textContent='THE BREAK ROOM HONORS';
 const quip=document.createElement('p');quip.textContent='Please hold your applause. It counts as overtime.';
 const stage=document.createElement('div');stage.className='awards-stage';stage.setAttribute('aria-hidden','true');
 const roster=document.createElement('ol');roster.className='awards-roster';
 for(const entry of entries){const li=document.createElement('li');li.dataset.place=String(podiumPlace(entry));const title=document.createElement('strong');title.textContent=(entry.dnf?'DNF':entry.place>0?'#'+entry.place:'Unranked')+' · '+entry.name;const detail=document.createElement('span');detail.textContent=entry.detail;li.append(title,detail);if(entry.workers.some(w=>!w.connected)){const note=document.createElement('span');note.textContent='Disconnected worker · recorded result retained';li.append(note);}if(entry.award){const award=document.createElement('em');award.textContent=entry.award;li.append(award);}roster.append(li);}
 this.host.append(heading,quip,stage,roster);
 let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:false,alpha:true});}catch{stage.textContent='Awards are posted below. The projector is on break.';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));stage.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#183c49');scene.add(new THREE.HemisphereLight(0xfff6da,0x34505c,2.5));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-4,8,6);scene.add(light);
 const camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,100);camera.position.set(0,7,15);camera.lookAt(0,1.7,0);
 const box=(x:number,y:number,w:number,h:number,color:number)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,1.7),new THREE.MeshLambertMaterial({color}));mesh.position.set(x,y,0);scene.add(mesh);};
 box(0,-.2,18,.3,0x42666d);
 const groups=new Map<number,PodiumEntry[]>();for(const e of entries){const rank=podiumPlace(e);if(rank)groups.set(rank,[...(groups.get(rank)??[]),e]);}
 const poses:{mesh:THREE.Group;x:number;y:number;winner:boolean;index:number}[]=[];let side=0;
 for(const entry of entries){const rank=podiumPlace(entry), peers=groups.get(rank)??[],index=peers.indexOf(entry),base=rank===1?0:rank===2?-3.7:3.7,height=rank===1?2:rank===2?1.25:.7;
 if(rank&&index===0)box(base,height/2,3.3,height,[0,0xffce45,0xc5d6e3,0xc88955][rank]);
 entry.workers.forEach((w,j)=>{const mesh=makeWorker(w.look?.vest??0xf08230,w.look);const count=peers.reduce((n,e)=>n+e.workers.length,0);const before=peers.slice(0,index).reduce((n,e)=>n+e.workers.length,0);let x=rank?base+(before+j-(count-1)/2)*Math.min(.95,2.7/Math.max(1,count)):((side%2)?1:-1)*(5.4+Math.floor(side/2)*.85);let y=rank?height:0;if(!rank)side++;mesh.scale.setScalar(count>3?.7:.9);mesh.position.set(x,y,rank?0:.6);scene.add(mesh);
 const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=128;const ctx=labelCanvas.getContext('2d')!;ctx.fillStyle='#fff8e7';ctx.fillRect(0,0,512,128);ctx.fillStyle='#193c47';ctx.font='bold 34px system-ui';ctx.textAlign='center';ctx.fillText((entry.dnf?'DNF':rank?'#'+entry.place:'OFF THE CLOCK')+' · '+w.name,256,52,490);ctx.font='26px system-ui';ctx.fillText(!w.connected?'Disconnected':rank?'Lunch break legend':'Requesting a recount',256,94,490);const texture=new THREE.CanvasTexture(labelCanvas);const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));label.scale.set(2.5,.625,1);label.position.set(x,rank?height+2.35:2.4+(poses.length%2)*.7,.5);scene.add(label);
 poses.push({mesh,x,y,winner:!!rank,index:poses.length});});
 }
 const confetti=new THREE.Group();if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&stage.clientWidth>400)for(let i=0;i<45;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.08,.16),new THREE.MeshBasicMaterial({color:[0xffce45,0xf08280,0x71dfc0][i%3],side:THREE.DoubleSide}));m.position.set(Math.sin(i*17)*7,3+(i%7)*.5,Math.cos(i)*2);confetti.add(m);}scene.add(confetti);
 const resize=()=>{const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h);const aspect=w/h;camera.left=-8;camera.right=8;camera.top=1.7+8/aspect;camera.bottom=1.7-8/aspect;camera.updateProjectionMatrix();renderer.render(scene,camera);};const observer=new ResizeObserver(resize);observer.observe(stage);resize();
 const start=performance.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame=0;
 const draw=(now:number)=>{const t=(now-start)/1000,active=!reduced&&t<3.2;poses.forEach(p=>{const limbs=p.mesh.userData.limbs as THREE.Group[];if(p.winner){p.mesh.position.y=p.y+(active?Math.abs(Math.sin(t*6+p.index))*.25:0);limbs[2].rotation.z=2.4;limbs[3].rotation.z=-2.4;p.mesh.rotation.z=active?Math.sin(t*7+p.index)*.1:0;}else{p.mesh.rotation.z=p.index%2?.15:-.13;limbs[2].rotation.z=-.7;limbs[3].rotation.z=.7;limbs[2].rotation.x=limbs[3].rotation.x=-1.1;}});confetti.visible=active;confetti.children.forEach((m,i)=>{m.position.y=5-((t*1.7+i*.17)%5);m.rotation.z=t+i;});renderer.render(scene,camera);if(active)frame=requestAnimationFrame(draw);};frame=requestAnimationFrame(draw);
 this.release=()=>{cancelAnimationFrame(frame);observer.disconnect();scene.traverse(o=>{const m=o as THREE.Mesh;m.geometry?.dispose();const mats=Array.isArray(m.material)?m.material:[m.material];mats.forEach(v=>{(v as THREE.MeshBasicMaterial)?.map?.dispose();v?.dispose();});});renderer.dispose();renderer.forceContextLoss();};
 }
}
