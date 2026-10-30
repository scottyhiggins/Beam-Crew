import * as THREE from 'three';
import {makeWorker,type WorkerLook} from './worker';
const hats={Yellow:0xffce36,Orange:0xf08230,Green:0x53ad57,Blue:0x3588dc,Red:0xdd4842,White:0xf4f2e9};
const vests={Orange:0xf08230,Yellow:0xf0d43b,Green:0x76be45,Blue:0x3588dc};
const defaults:WorkerLook={hat:hats.Yellow,vest:vests.Orange,expression:'happy'};
let saved:WorkerLook={...defaults};
try {const v=JSON.parse(localStorage.getItem('break-time-worker')||'null');if(v&&Object.values(hats).includes(v.hat)&&Object.values(vests).includes(v.vest)&&['happy','serious','goofy'].includes(v.expression))saved=v;}catch{}
export function getWorkerLook(){return {...saved};}
export function installWorkerStore(){
 const dialog=document.createElement('dialog');dialog.id='workerStore';dialog.setAttribute('aria-labelledby','storeTitle');
 dialog.innerHTML=`<header><div><p class="eyebrow">BREAK TIME · WORK HARD. PLAY HARD.</p><h2 id="storeTitle">WORKER STORE</h2><p>Fresh gear. Same hard worker. Everything is free.</p></div><button id="storeClose" aria-label="Close Worker Store">✕</button></header><div class="store-layout"><section class="store-stage"><div id="workerPreview" tabindex="0" role="img" aria-label="3D worker preview. Drag or use left and right arrow keys to rotate."></div><p>DRAG TO ROTATE · MAKE IT YOURS</p><div class="rotate-controls"><button id="rotateLeft" aria-label="Rotate worker left">↶</button><button id="rotateReset">Front view</button><button id="rotateRight" aria-label="Rotate worker right">↷</button></div></section><section class="store-options"><span class="free-badge">100% FREE · ALL GEAR AVAILABLE</span><fieldset><legend>01 / Hard hat</legend><div id="hatChoices" class="store-choices"></div></fieldset><fieldset><legend>02 / Safety vest</legend><div id="vestChoices" class="store-choices"></div></fieldset><fieldset><legend>03 / Expression</legend><div id="expressionChoices" class="store-choices"></div></fieldset><p id="storeStatus" role="status">Saved on this device. Ready for your next room.</p><button id="storeSave">Save my worker</button><button id="storeDefault">Reset to classic</button></section></div>`;
 document.body.append(dialog);
 const find=<T extends HTMLElement>(id:string)=>dialog.querySelector<T>('#'+id)!;
 let draft=getWorkerLook(),renderer:THREE.WebGLRenderer|undefined,model:THREE.Group|undefined,angle=0,frame=0;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#dce9df');
 const camera=new THREE.PerspectiveCamera(32,1,.1,30);camera.position.set(0,1.35,5.2);camera.lookAt(0,1.05,0);
 scene.add(new THREE.HemisphereLight(0xfff8e7,0x487780,2.5));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-3,5,5);scene.add(light);
 const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(.85,1,.16,48),new THREE.MeshLambertMaterial({color:0x287c80}));pedestal.position.y=-.08;scene.add(pedestal);
 function refresh(){if(model){scene.remove(model);model.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});}model=makeWorker(draft.vest,draft);scene.add(model);
 dialog.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(String(draft[b.dataset.kind as keyof WorkerLook])===b.dataset.value)));}
 function choices(id:string,kind:keyof WorkerLook,items:Record<string,number|string>){for(const [name,value]of Object.entries(items)){const b=document.createElement('button');b.type='button';b.dataset.kind=kind;b.dataset.value=String(value);b.setAttribute('aria-label',name+' '+(kind==='hat'?'hard hat':kind==='vest'?'safety vest':'expression'));b.innerHTML=(typeof value==='number'?`<i style="background:#${value.toString(16).padStart(6,'0')}"></i>`:'')+name;b.onclick=()=>{draft={...draft,[kind]:value};refresh();find('storeStatus').textContent='Looking good! Save to wear this in your next room.';};find(id).append(b);}}
 choices('hatChoices','hat',hats);choices('vestChoices','vest',vests);choices('expressionChoices','expression',{Happy:'happy',Serious:'serious',Goofy:'goofy'});
 const preview=find('workerPreview');
 function draw(){if(!dialog.open)return;if(renderer&&model){const w=preview.clientWidth,h=preview.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();model.rotation.y=angle;renderer.render(scene,camera);}frame=requestAnimationFrame(draw);}
 document.querySelector<HTMLButtonElement>('#chooseStore')!.onclick=()=>{draft=getWorkerLook();angle=0;dialog.showModal();refresh();if(!renderer){try{renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));preview.append(renderer.domElement);}catch{preview.textContent='3D preview is unavailable on this device. You can still choose and save your gear.';}}draw();};
 find('storeClose').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{cancelAnimationFrame(frame);document.querySelector<HTMLElement>('#chooseStore')?.focus();});
 find('storeSave').onclick=()=>{try{localStorage.setItem('break-time-worker',JSON.stringify(draft));saved={...draft};find('storeStatus').textContent='Worker saved! Your look is ready for your next room.';}catch{saved={...draft};find('storeStatus').textContent='Ready for this visit. Browser storage is unavailable, so this look cannot be kept after closing.';}};
 find('storeDefault').onclick=()=>{draft={...defaults};refresh();find('storeStatus').textContent='Classic look selected. Save to keep it.';};
 find('rotateLeft').onclick=()=>angle-=Math.PI/4;find('rotateRight').onclick=()=>angle+=Math.PI/4;find('rotateReset').onclick=()=>angle=0;
 let pointer:number|undefined,last=0;preview.onpointerdown=e=>{pointer=e.pointerId;last=e.clientX;preview.setPointerCapture(pointer);};preview.onpointermove=e=>{if(pointer===e.pointerId){angle+=(e.clientX-last)*.012;last=e.clientX;}};preview.onpointerup=preview.onpointercancel=()=>pointer=undefined;
 preview.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();angle+=e.key==='ArrowLeft'?-.2:.2;}};
}
