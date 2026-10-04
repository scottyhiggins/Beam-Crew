import * as THREE from 'three';
import { Client, Room } from 'colyseus.js';
import './style.css';
import { BEAM_CONFIG, COURSE, GRIPS, gripPosition } from '../shared/beam';
const colors=[0xffad32,0x35b9ff,0xff5985,0x59d595,0xa38aff,0xf2ee57,0xffffff,0x965c42];
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<main id="panel"><h1>BEAM CREW</h1><p>Beam Carry • cooperate through the doorway</p><label>Your name <input id="name" maxlength="18" value="Worker" autocomplete="nickname"></label><button id="create">Create room</button><div class="join"><input id="code" maxlength="5" placeholder="ROOM CODE" aria-label="Room code"><button id="join">Join</button></div><p id="status" role="status"></p><section id="room" hidden><h2 id="roomCode"></h2><button id="share">Copy join link</button><ul id="players"></ul><button id="start">Start test</button><button id="back">Return to lobby</button><button id="reset" hidden>Reset to checkpoint</button><button id="restart" hidden>Restart course</button><button id="leave">Leave room</button></section><p id="help">WASD to move · Space to grab/release<br>On phones: joystick + ACTION</p></main><div id="hud" hidden><span id="hudText"></span><div id="beamStatus" role="status"></div><button id="grab">GRAB · Space</button><div id="signals"><button data-signal="LIFT">LIFT</button><button data-signal="WAIT">WAIT</button><button data-signal="LEFT">LEFT</button><button data-signal="RIGHT">RIGHT</button></div><button id="menu">Lobby controls</button></div><div id="touch" hidden><div id="joystick" aria-label="Movement joystick"><div id="stick"></div></div><button id="action">ACTION</button></div>`;
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const signalReadout=document.createElement('div');signalReadout.id='crewSignals';el('hud').append(signalReadout);
const status=(message:string)=>{el('status').textContent=message;};
const client=new Client(`${location.protocol==='https:'?'wss':'ws'}://${location.host}`);
let room:Room|null=null;let busy=false;let recovery=false;let menuOpen=false;
const keys=new Set<string>();let joyX=0,joyZ=0;let joyPointer:number|null=null;
const savedCode=new URLSearchParams(location.search).get('room');if(savedCode)el<HTMLInputElement>('code').value=savedCode.toUpperCase();
try {el<HTMLInputElement>('name').value=localStorage.getItem('beam-name')||'Worker';}catch{}
function storage(key:string,value:string|null){try{if(value===null)sessionStorage.removeItem(key);else sessionStorage.setItem(key,value);}catch{}}
function stopInput(){keys.clear();joyX=joyZ=0;joyPointer=null;el('stick').style.transform='translate(0px,0px)';room?.send('input',{x:0,z:0});}
async function connect(create:boolean){if(busy||room)return;busy=true;status('Connecting…');try{const name=el<HTMLInputElement>('name').value;try{localStorage.setItem('beam-name',name);}catch{}
  let joined:Room;
  if(create)joined=await client.create('crew',{name});
  else {const code=el<HTMLInputElement>('code').value.trim().toUpperCase();if(!/^[A-Z2-9]{5}$/.test(code))throw Error('Enter a five-character room code');const response=await fetch(`/api/rooms/${code}`);const result=await response.json();if(!response.ok)throw Error(result.error);joined=await client.joinById(result.roomId,{name});}
  attach(joined);
}catch(error){status(`Could not join: ${error instanceof Error?error.message:String(error)}. Check the code; active or full rooms cannot accept new players.`);}finally{busy=false;render();}}
function attach(joined:Room){room=joined;recovery=false;storage('beam-token',joined.reconnectionToken);status('Connected');
  joined.onStateChange(()=>render());joined.onError((code,message)=>status(`Connection error ${code}: ${message}`));
  joined.onLeave(code=>{if(room!==joined)return;room=null;stopInput();render();if(code!==1000&&code!==4000){void reconnect(joined.reconnectionToken);}else{storage('beam-token',null);status('Left room');}});render();}
async function reconnect(token:string){if(recovery)return;recovery=true;busy=true;status('Reconnecting… Your place is reserved for 30 seconds.');render();const deadline=Date.now()+29000;
  while(Date.now()<deadline&&recovery){try{attach(await client.reconnect(token));busy=false;render();return;}catch{await new Promise(resolve=>setTimeout(resolve,1000));}}
  recovery=false;busy=false;storage('beam-token',null);status('Reconnect expired. Create or join a lobby again.');render();}
el('create').onclick=()=>void connect(true);el('join').onclick=()=>void connect(false);
el('start').onclick=()=>room?.send('start');
el('reset').onclick=()=>{stopInput();room?.send('reset');menuOpen=false;render();};
el('restart').onclick=()=>{stopInput();room?.send('restart');menuOpen=false;render();};el('back').onclick=()=>{stopInput();room?.send('lobby');menuOpen=false;};
el('leave').onclick=()=>{storage('beam-token',null);void room?.leave();};
el('share').onclick=async()=>{if(!room?.state.code)return;const url=new URL(location.href);url.search='';url.searchParams.set('room',room.state.code);try{await navigator.clipboard.writeText(url.href);status('Join link copied');}catch{status(`Join link: ${url.href}`);}};
el('menu').onclick=()=>{menuOpen=!menuOpen;render();};
function action(){if(room?.state.phase==='test')room.send('action');}
el('grab').onclick=action;
el('action').addEventListener('pointerdown',e=>{e.preventDefault();action();});
document.querySelectorAll<HTMLButtonElement>('[data-signal]').forEach(button=>button.onclick=()=>room?.send('signal',button.dataset.signal));
window.addEventListener('keydown',e=>{if((e.target as HTMLElement).matches('input,textarea')||room?.state.phase!=='test')return;if(['KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code)){e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)action();}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',stopInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopInput();});
const joystick=el('joystick');
function moveJoystick(e:PointerEvent){if(e.pointerId!==joyPointer)return;const rect=joystick.getBoundingClientRect();let x=e.clientX-rect.left-rect.width/2,z=e.clientY-rect.top-rect.height/2;const radius=rect.width*.32,length=Math.hypot(x,z);if(length>radius){x*=radius/length;z*=radius/length;}joyX=x/radius;joyZ=z/radius;el('stick').style.transform=`translate(${x}px,${z}px)`;}
joystick.onpointerdown=e=>{joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveJoystick(e);};joystick.onpointermove=moveJoystick;
joystick.onpointerup=joystick.onpointercancel=()=>{joyPointer=null;joyX=joyZ=0;el('stick').style.transform='translate(0px,0px)';};
setInterval(()=>{if(room?.state.phase==='test'&&!document.hidden){room.send('input',{x:(Number(keys.has('KeyD'))-Number(keys.has('KeyA')))+joyX,z:(Number(keys.has('KeyS'))-Number(keys.has('KeyW')))+joyZ});}},1000/30);
function render(){const state=room?.state,playing=state?.phase==='test';el('room').hidden=!room;el('panel').classList.toggle('playing',!!playing&&!menuOpen);el('hud').hidden=!playing;el('touch').hidden=!playing;
  el<HTMLButtonElement>('create').disabled=busy||!!room;el<HTMLButtonElement>('join').disabled=busy||!!room;
  if(!state?.players)return;el('roomCode').textContent=`Room ${state.code}`;el('players').replaceChildren();let connected=0;
  state.players.forEach((p:any,id:string)=>{if(p.connected)connected++;const row=document.createElement('li');row.textContent=`${p.name}${id===room?.sessionId?' (you)':''}${id===state.host?' • host':''}${p.connected?'':' • reconnecting'}`;row.style.borderLeft=`6px solid #${colors[p.color].toString(16).padStart(6,'0')}`;el('players').append(row);});
  const host=state.host===room?.sessionId;el('start').hidden=!host||playing;el<HTMLButtonElement>('start').disabled=connected<2;el('back').hidden=!host||!playing;el('reset').hidden=!host||!playing;el('restart').hidden=!host||!playing;
  const me=state.players.get(room?.sessionId);renderBeamHud(state,me);el('hudText').textContent=`${state.code} · ${connected}/8 workers · ${me?.grip>=0?'GRIPPING '+(me.grip+1):'FREE'}${me?.signal?' · '+me.signal:''}`;
  const signals:string[]=[];state.players.forEach((p:any)=>{if(p.signal)signals.push(`${p.name}: ${p.signal}`);});signalReadout.textContent=signals.join(' · ');
  if(playing)status('Beam Carry active — host controls can reset or restart.');else status(connected<2?'Waiting for another worker to start.':'Ready — the host can start the test.');}
// Render only: all gameplay positions and rotations originate on the server.
const scene=new THREE.Scene();scene.background=new THREE.Color(0xa8d5e7);scene.fog=new THREE.Fog(0xa8d5e7,30,85);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,100);camera.position.set(0,15,18);
let renderer:THREE.WebGLRenderer;
try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{status('This browser cannot start 3D graphics. Try a browser with WebGL enabled.');throw Error('WebGL unavailable');}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);document.body.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x66717d,2.5));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(8,20,10);scene.add(sun);
function box(w:number,h:number,d:number,color:number,x:number,y:number,z:number,parent:THREE.Object3D=scene){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
box(20,.5,20,0x88949c,0,-.25,0);const grid=new THREE.GridHelper(20,10,0x667780,0x778790);grid.position.y=.015;scene.add(grid);
for(const x of [-10,10])for(const z of [-10,10]){box(.4,5,.4,0x405768,x,2.5,z);}
for(const z of [-10,10]){box(20,.15,.15,0xffc137,0,.8,z);box(20,.15,.15,0xffc137,0,1.4,z);}
for(const x of [-10,10]){box(.15,.15,20,0xffc137,x,.8,0);box(.15,.15,20,0xffc137,x,1.4,0);}
for(let i=0;i<12;i++){const h=4+(i%5)*3;box(4,h,4,0x7898ab,(i-6)*7,-8+h/2,-28);}
const workers=new Map<string,THREE.Group>();
function worker(color:number){const g=new THREE.Group();box(.8,.9,.55,color,0,.8,0,g);box(.65,.55,.6,0xe6b68e,0,1.48,0,g);box(.9,.15,.8,0xffd447,0,1.82,0,g);box(.65,.25,.55,0xffd447,0,1.98,0,g);box(.24,.45,.3,0x354c65,-.22,.23,0,g);box(.24,.45,.3,0x354c65,.22,.23,0,g);box(.25,.6,.3,color,-.53,.85,0,g);box(.25,.6,.3,color,.53,.85,0,g);box(.09,.09,.04,0x263748,-.15,1.5,.32,g);box(.09,.09,.04,0x263748,.15,1.5,.32,g);scene.add(g);return g;}
let previous=performance.now();
function frame(now:number){requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.1);previous=now;const state=room?.state;
  for(const [id,g]of workers){if(!state?.players?.has(id)){scene.remove(g);workers.delete(id);}}
  state?.players?.forEach((p:any,id:string)=>{let g=workers.get(id);if(!g){g=worker(colors[p.color]);g.position.set(p.x,0,p.z);workers.set(id,g);}const blend=1-Math.exp(-18*dt);g.position.x+=(p.x-g.position.x)*blend;g.position.z+=(p.z-g.position.z)*blend;const difference=Math.atan2(Math.sin(p.rotation-g.rotation.y),Math.cos(p.rotation-g.rotation.y));g.rotation.y+=difference*blend;g.position.y=Math.sin(now*.008+p.color)*.025;g.visible=p.connected;});
  const me=room&&workers.get(room.sessionId);const target=me?.position??new THREE.Vector3();camera.position.lerp(new THREE.Vector3(target.x,15,target.z+18),1-Math.exp(-4*dt));camera.lookAt(target.x,0,target.z);updateBeamVisual(state,dt,now);renderer.render(scene,camera);
}
requestAnimationFrame(frame);window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
try{const token=sessionStorage.getItem('beam-token');if(token)void reconnect(token);}catch{}


function label(text:string,color='#172d3c',width=3,square=false){
  const canvas=document.createElement('canvas');canvas.width=square?96:512;canvas.height=96;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='#ffffffe8';ctx.fillRect(0,0,canvas.width,96);
  ctx.fillStyle=color;ctx.font=square?'bold 60px system-ui':'bold 42px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,canvas.width/2,48);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:false}));
  sprite.scale.set(width,width*96/canvas.width,1);scene.add(sprite);return sprite;
}
const courseVisual=new THREE.Group();scene.add(courseVisual);
for(const o of COURSE.obstacles){
  box(o.halfX*2,2.3,o.halfZ*2,0xe3ad47,o.x,1.15,o.z,courseVisual);
  box(o.halfX*2+.05,.14,o.halfZ*2+.05,0x273e4b,o.x,2.37,o.z,courseVisual);
}
const goalMaterial=new THREE.MeshLambertMaterial({color:0x45bfa4,transparent:true,opacity:.7});
const goalMesh=new THREE.Mesh(new THREE.BoxGeometry(COURSE.goal.halfX*2,.03,COURSE.goal.halfZ*2),goalMaterial);
goalMesh.position.set(COURSE.goal.x,.035,COURSE.goal.z);courseVisual.add(goalMesh);
const startLabel=label('START • GRAB BOTH ENDS');startLabel.position.set(-5,.4,8.9);
const doorLabel=label('1 • DOORWAY');doorLabel.position.set(-5,2.9,1.5);
const turnLabel=label('2 • TURN RIGHT');turnLabel.position.set(-1,2.9,-3.9);
const destinationLabel=label('3 • DELIVER BEAM');destinationLabel.position.set(4.3,.5,-7.5);
const beamVisual=new THREE.Group(),beamTilt=new THREE.Group();beamVisual.add(beamTilt);scene.add(beamVisual);
box(BEAM_CONFIG.length,.08,BEAM_CONFIG.width+.12,0x46718a,0,.17,0,beamTilt);
box(BEAM_CONFIG.length,.08,BEAM_CONFIG.width+.12,0x46718a,0,-.17,0,beamTilt);
box(BEAM_CONFIG.length,.3,.08,0x36586d,0,0,0,beamTilt);
for(const x of [-1,1])box(.2,.4,.46,0xffcd43,x*BEAM_CONFIG.length/2,0,0,beamTilt);
const gripVisuals=GRIPS.map((_,i)=>{
  const ring=new THREE.Mesh(new THREE.RingGeometry(.28,.42,24),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2;scene.add(ring);
  const text=label(String(i+1),'#172d3c',.55,true);
  const ropeGeometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
  const rope=new THREE.Line(ropeGeometry,new THREE.LineBasicMaterial({color:0xffcb43}));scene.add(rope);
  return {ring,text,rope};
});
const dragMarkers=[-1,1].map(()=>{
  const skid=new THREE.Mesh(new THREE.CircleGeometry(.38,16),new THREE.MeshBasicMaterial({color:0xca6846,transparent:true,opacity:.7}));
  skid.rotation.x=-Math.PI/2;scene.add(skid);return skid;
});
let displayedBeam={...COURSE.start,leftHeight:BEAM_CONFIG.groundedHeight,rightHeight:BEAM_CONFIG.groundedHeight};
let displayedResets=-1;
function renderBeamHud(state:any,me:any){
  const b=state.beam;if(!b)return;
  const occupied=new Set<number>();state.players.forEach((p:any)=>{if(p.grip>=0)occupied.add(p.grip);});
  let nearest=-1,distance=BEAM_CONFIG.grabRadius;
  if(me)GRIPS.forEach((_,i)=>{const point=gripPosition(b,i),d=Math.hypot(point.x-me.x,point.z-me.z);if(!occupied.has(i)&&d<distance){nearest=i;distance=d;}});
  const attached=me?.grip>=0;
  el('grab').textContent=attached?'RELEASE · Space':nearest>=0?`GRAB ${nearest+1} · Space`:'GRAB · Space';
  el('action').textContent=attached?'RELEASE':'ACTION';
  const support=b.leftSupported&&b.rightSupported?'Both ends carried':b.leftSupported||b.rightSupported?'One end DRAGGING':'Both ends grounded';
  const instruction=b.delivered?'DELIVERED! Host can restart the course.':attached?'Move together to carry. Different directions turn the beam.':nearest>=0?`Grip ${nearest+1} nearby — Space / ACTION to grab`:'Approach a white grip ring. Space / ACTION toggles grab.';
  el('beamStatus').textContent=`${instruction}\n${support} · ${b.blocked?'Blocked — coordinate a turn':b.checkpoint?'Doorway checkpoint saved':'Doorway → right turn → green destination'}${me?.feedback?'\n'+me.feedback:''}`;
  el('reset').textContent=b.checkpoint?'Reset to doorway checkpoint':'Reset to start';
  el('grab').classList.toggle('attached',attached);el('action').classList.toggle('attached',attached);
}
function updateBeamVisual(state:any,dt:number,now:number){
  const b=state?.beam,playing=state?.phase==='test';
  courseVisual.visible=beamVisual.visible=playing;
  for(const sprite of [startLabel,doorLabel,turnLabel,destinationLabel])sprite.visible=playing;
  for(const visual of gripVisuals){visual.ring.visible=visual.text.visible=visual.rope.visible=playing;}
  for(const skid of dragMarkers)skid.visible=playing;
  if(!playing||!b)return;
  if(displayedResets!==b.resets){stopInput();Object.assign(displayedBeam,b);displayedResets=b.resets;}
  const blend=1-Math.exp(-18*dt);displayedBeam.x+=(b.x-displayedBeam.x)*blend;displayedBeam.z+=(b.z-displayedBeam.z)*blend;
  displayedBeam.angle+=Math.atan2(Math.sin(b.angle-displayedBeam.angle),Math.cos(b.angle-displayedBeam.angle))*blend;
  displayedBeam.leftHeight+=(b.leftHeight-displayedBeam.leftHeight)*blend;displayedBeam.rightHeight+=(b.rightHeight-displayedBeam.rightHeight)*blend;
  beamVisual.position.set(displayedBeam.x,(displayedBeam.leftHeight+displayedBeam.rightHeight)/2,displayedBeam.z);
  beamVisual.rotation.y=-displayedBeam.angle;beamTilt.rotation.z=Math.atan2(displayedBeam.rightHeight-displayedBeam.leftHeight,BEAM_CONFIG.length);
  const occupants=new Map<number,any>();state.players.forEach((p:any)=>{if(p.grip>=0)occupants.set(p.grip,p);});
  const me=state.players.get(room?.sessionId);
  gripVisuals.forEach((visual,i)=>{
    const point=gripPosition(displayedBeam,i),p=occupants.get(i);
    const near=me?.grip<0&&!p&&Math.hypot(me.x-point.x,me.z-point.z)<BEAM_CONFIG.grabRadius;
    (visual.ring.material as THREE.MeshBasicMaterial).color.setHex(p?colors[p.color]:near?0x7dfa91:0xffffff);
    visual.ring.position.set(point.x,.055,point.z);visual.ring.scale.setScalar(near?1+.08*Math.sin(now*.007):1);
    visual.text.position.set(point.x,.7,point.z);visual.text.visible=!p;
    visual.rope.visible=!!p;
    const g=GRIPS[i],fraction=(g.u/BEAM_CONFIG.length)+.5;
    const height=displayedBeam.leftHeight*(1-fraction)+displayedBeam.rightHeight*fraction;
    const positions=visual.rope.geometry.getAttribute('position') as THREE.BufferAttribute;
    positions.setXYZ(0,point.x,1,point.z);positions.setXYZ(1,displayedBeam.x+Math.cos(displayedBeam.angle)*g.u,height,displayedBeam.z+Math.sin(displayedBeam.angle)*g.u);
    positions.needsUpdate=true;visual.rope.geometry.computeBoundingSphere();
    (visual.rope.material as THREE.LineBasicMaterial).color.setHex(p?colors[p.color]:0xffffff);
  });
  [-1,1].forEach((end,i)=>{
    dragMarkers[i].visible=i===0?!b.leftSupported:!b.rightSupported;
    dragMarkers[i].position.set(displayedBeam.x+Math.cos(displayedBeam.angle)*end*BEAM_CONFIG.length/2,.045,displayedBeam.z+Math.sin(displayedBeam.angle)*end*BEAM_CONFIG.length/2);
  });
  goalMaterial.color.setHex(b.delivered?0x85ff8c:0x45bfa4);
}
