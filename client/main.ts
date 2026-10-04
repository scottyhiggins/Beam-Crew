import * as THREE from 'three';
import { Client, Room } from 'colyseus.js';
import './style.css';
const colors=[0xffad32,0x35b9ff,0xff5985,0x59d595,0xa38aff,0xf2ee57,0xffffff,0x965c42];
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<main id="panel"><h1>BEAM CREW</h1><p>Multiplayer foundation • construction test</p><label>Your name <input id="name" maxlength="18" value="Worker" autocomplete="nickname"></label><button id="create">Create room</button><div class="join"><input id="code" maxlength="5" placeholder="ROOM CODE" aria-label="Room code"><button id="join">Join</button></div><p id="status" role="status"></p><section id="room" hidden><h2 id="roomCode"></h2><button id="share">Copy join link</button><ul id="players"></ul><button id="start">Start test</button><button id="back">Return to lobby</button><button id="leave">Leave room</button></section><p id="help">WASD to move · Space to act<br>On phones: joystick + ACTION</p></main><div id="hud" hidden><span id="hudText"></span><div id="signals"><button data-signal="LIFT">LIFT</button><button data-signal="WAIT">WAIT</button><button data-signal="LEFT">LEFT</button><button data-signal="RIGHT">RIGHT</button></div><button id="menu">Lobby controls</button></div><div id="touch" hidden><div id="joystick" aria-label="Movement joystick"><div id="stick"></div></div><button id="action">ACTION</button></div>`;
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
el('start').onclick=()=>room?.send('start');el('back').onclick=()=>{stopInput();room?.send('lobby');menuOpen=false;};
el('leave').onclick=()=>{storage('beam-token',null);void room?.leave();};
el('share').onclick=async()=>{if(!room?.state.code)return;const url=new URL(location.href);url.search='';url.searchParams.set('room',room.state.code);try{await navigator.clipboard.writeText(url.href);status('Join link copied');}catch{status(`Join link: ${url.href}`);}};
el('menu').onclick=()=>{menuOpen=!menuOpen;render();};
function action(){if(room?.state.phase==='test')room.send('action');}
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
  const host=state.host===room?.sessionId;el('start').hidden=!host||playing;el<HTMLButtonElement>('start').disabled=connected<2;el('back').hidden=!host||!playing;
  const me=state.players.get(room?.sessionId);el('hudText').textContent=`${state.code} · ${connected}/8 workers · Actions: ${me?.actions??0}${me?.signal?' · '+me.signal:''}`;
  const signals:string[]=[];state.players.forEach((p:any)=>{if(p.signal)signals.push(`${p.name}: ${p.signal}`);});signalReadout.textContent=signals.join(' · ');
  if(!playing)status(connected<2?'Waiting for another worker to start.':'Ready — the host can start the test.');}
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
for(const z of [-10,10]){box(20,.15,.15,0xffc137,0,.8,z);box(20,.15,.15,0xffc137,0,1.4,z);box(20,.35,.35,0x405768,0,5,z);}
for(const x of [-10,10]){box(.15,.15,20,0xffc137,x,.8,0);box(.15,.15,20,0xffc137,x,1.4,0);}
for(let i=0;i<12;i++){const h=4+(i%5)*3;box(4,h,4,0x7898ab,(i-6)*7,-8+h/2,-28);}
const workers=new Map<string,THREE.Group>();
function worker(color:number){const g=new THREE.Group();box(.8,.9,.55,color,0,.8,0,g);box(.65,.55,.6,0xe6b68e,0,1.48,0,g);box(.9,.15,.8,0xffd447,0,1.82,0,g);box(.65,.25,.55,0xffd447,0,1.98,0,g);box(.24,.45,.3,0x354c65,-.22,.23,0,g);box(.24,.45,.3,0x354c65,.22,.23,0,g);box(.25,.6,.3,color,-.53,.85,0,g);box(.25,.6,.3,color,.53,.85,0,g);box(.09,.09,.04,0x263748,-.15,1.5,.32,g);box(.09,.09,.04,0x263748,.15,1.5,.32,g);scene.add(g);return g;}
let previous=performance.now();
function frame(now:number){requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.1);previous=now;const state=room?.state;
  for(const [id,g]of workers){if(!state?.players?.has(id)){scene.remove(g);workers.delete(id);}}
  state?.players?.forEach((p:any,id:string)=>{let g=workers.get(id);if(!g){g=worker(colors[p.color]);g.position.set(p.x,0,p.z);workers.set(id,g);}const blend=1-Math.exp(-18*dt);g.position.x+=(p.x-g.position.x)*blend;g.position.z+=(p.z-g.position.z)*blend;const difference=Math.atan2(Math.sin(p.rotation-g.rotation.y),Math.cos(p.rotation-g.rotation.y));g.rotation.y+=difference*blend;g.position.y=Math.sin(now*.008+p.color)*.025;g.visible=p.connected;});
  const me=room&&workers.get(room.sessionId);const target=me?.position??new THREE.Vector3();camera.position.lerp(new THREE.Vector3(target.x,15,target.z+18),1-Math.exp(-4*dt));camera.lookAt(target.x,0,target.z);renderer.render(scene,camera);
}
requestAnimationFrame(frame);window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
try{const token=sessionStorage.getItem('beam-token');if(token)void reconnect(token);}catch{}
