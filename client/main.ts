import {installParty,partyPage,partyEpochFor} from './party-ui';
import {beamActionState,WAITING_FOR_TEAMMATE} from '../shared/beam-session';
import {resetBeamActionControls} from './beam-action-controls';
import {BEAM_MAPS,EXCAVATOR,excavatorAngle,beamWorld} from '../shared/beam-chaos';
import {validateWorkerLook,workerLookKey,type WorkerLook} from '../shared/cosmetics';
import {installWorkerStore,getWorkerLook} from './worker-store';
import {createModularWorld} from './modular-world';
import {assembleRoute,routeHeight,type CourseInstance} from '../shared/course-modules';
let routeKey='',displayRoute:CourseInstance[]=[];
function clientRoute(state:any){const ids=state?.routeIds??[],key=ids.join(',');if(key!==routeKey){displayRoute=ids.length?assembleRoute(ids):[];routeKey=key;}return displayRoute;}
function currentCourse(state:any){return clientRoute(state)[state.leg];}
function currentTrack(state:any){return currentCourse(state)?.track??championshipTrack(state.leg);}
function championshipRise(state:any,x:number,z:number){const route=clientRoute(state);return route.length?routeHeight(route,x,z):championshipHeight(x,z);}
function legCount(state:any){return state.championshipLength??2;}
import {championshipTrack,championshipHeight} from '../shared/championship';
const isWheel=(state:any)=>state?.mode==='wheel'||state?.mode==='championship';
import {ReconnectRun,RESERVATION_MS,reservationValid} from './reconnect';
import {presentationFor} from './presentation';
import {makeWorker,animateWorker,scenery,paintArrow} from './polish';
import {createSpillVisual,spillSignature,updateSpillVisual} from './spill-visual';
import {planSpills} from './spill-plan';
import {debrisRotation} from '../shared/debris';
import {renderRatio,ResolutionGovernor} from './render-resolution';
import {createLoadVisual} from './load-visual';
import * as THREE from 'three';
import { Client, Room } from 'colyseus.js';
import './style.css';
import {MODE_ART,materialArt} from './menu-art';
import { BEAM_CONFIG, COURSE, movingLoads, GRIPS, gripPosition } from '../shared/beam';
import { rampHeight, FINISH_RAMP, WHEEL_CONFIG, WHEEL_COURSE, WHEEL_OBSTACLES, WHEEL_ROUGH, WHEEL_FENCES, WHEEL_GATES } from '../shared/wheelbarrow';
import { BUILD_LABEL, PROTOCOL_VERSION } from '../shared/version';
import {MATERIAL_CATEGORIES,MATERIALS,MATERIAL_COLORS} from '../shared/materials';
import {FINISH_STAGING} from '../shared/wheelbarrow';
const colors=[0xffad32,0x35b9ff,0xff5985,0x59d595,0xa38aff,0xf2ee57,0xffffff,0x965c42];
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<main id="panel"><h1>BREAK TIME</h1><p id="buildLabel">${BUILD_LABEL}</p><p class="eyebrow">WORK HARD. PLAY HARD.</p><p id="menuIntro">Big loads. Good mates. Glorious mistakes.</p><section id="modeTiles" aria-label="Choose your game"><a class="mode-tile" href="/trivia.html" style="text-decoration:none;color:inherit"><svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M91 42V25h58v17" fill="none" stroke="#26383e" stroke-width="9"/><rect x="40" y="42" width="160" height="64" rx="9" fill="#ee7b39" stroke="#26383e" stroke-width="5"/><path d="M40 66h160" stroke="#26383e" stroke-width="5"/><path d="M109 57h22v24h-22z" fill="#f9c43c" stroke="#26383e" stroke-width="4"/><text x="171" y="98" font-size="29" font-weight="bold" fill="#fff8e8">?</text></svg><span class="tile-copy"><small class="tile-status">PLAYABLE · TWO-PERSON TEAMS</small><strong>TOOLBOX TRIVIA</strong><span>One question. Four answers. Talk it out.</span></span></a><button type="button" class="mode-tile selected" id="chooseWheel" aria-pressed="true">${MODE_ART.wheel}<span class="tile-copy"><small class="tile-status">PLAYABLE · 2–8 WORKERS</small><strong>WHEELBARROW</strong><span>Race the site. Protect the load.</span></span></button><button type="button" class="mode-tile" id="chooseBeam" aria-pressed="false">${MODE_ART.beam}<span class="tile-copy"><small class="tile-status">PLAYABLE · TWO-PERSON TEAMS</small><strong>BEAM CARRY</strong><span>Lift together. Finish together.</span></span></button><button type="button" class="mode-tile coming" disabled>${MODE_ART.crane}<span class="tile-copy"><small class="tile-status">COMING SOON</small><strong>CRANE CHALLENGE</strong><span>A bigger job is on the way.</span></span></button><button type="button" class="mode-tile" id="chooseStore">${MODE_ART.store}<span class="tile-copy"><small class="tile-status">ALL GEAR FREE</small><strong>WORKER STORE</strong><span>Your worker. Your style.</span></span></button></section><section id="entryActions"><label>Your name <input id="name" maxlength="18" value="Worker" autocomplete="nickname"></label><button id="quickMatch">Quick Match · Wheelbarrow</button><button id="cancelMatch" hidden>Cancel matchmaking</button><button id="create">Create Private Room</button><div class="join"><input id="code" maxlength="5" placeholder="ROOM CODE" aria-label="Room code"><button id="join">Join with Code</button></div></section><p id="status" role="status"></p><button id="retryConnection" hidden>Retry connection</button><button id="cancelReconnect" hidden>Cancel reconnect / Return to landing</button><section id="room" hidden><h2 id="roomCode"></h2><button id="share">Copy join link</button><ul id="players"></ul><label id="modeLabel">Game mode <select id="mode"><option value="championship">Wheelbarrow Championship</option><option value="wheel">Wheelbarrow · single race</option><option value="competitive">Beam Carry · two-person teams</option></select></label><label id="championshipLengthLabel" hidden>Championship length <select id="championshipLength"><option value="3">3 races · quick Championship</option><option value="5">5 races · random unique courses</option><option value="10">10 races · full jobsite tour</option><option value="2">2 courses · classic route</option></select></label><label id="beamMapLabel" hidden>Beam course <select id="beamMap">${BEAM_MAPS.map((m,i)=>`<option value="${i}">${m.name}</option>`).join('')}</select></label><p id="beamMapDescription" hidden></p><section id="materials" hidden><h3>Choose your load</h3><p>Equal handling. Different spill hazards. Pick your load; it locks at the countdown.</p><div id="materialGrid"></div><p id="chosenLoad" role="status"></p></section><button id="start">Let’s get to work</button><button id="back">Return to lobby</button><button id="reset" hidden>Reset to checkpoint</button><button id="restart" hidden>Restart course</button><button id="leave">Leave room</button></section><p id="help">WASD to move · Space to grab/release<br>On phones: joystick + ACTION</p></main><div id="hud" hidden><span id="hudText"></span><div id="beamStatus" role="status"></div><button id="grab">GRAB · Space</button><div id="signals"><button data-signal="LIFT">LIFT</button><button data-signal="WAIT">WAIT</button><button data-signal="LEFT">LEFT</button><button data-signal="RIGHT">RIGHT</button></div><details id="standings" hidden><summary>Standings</summary><ol id="standingsList"></ol></details><button id="showResults" hidden>Results</button><button id="beamOverview" hidden>Course view</button><button id="beamRescue" hidden>Recover team · +5s</button><button id="menu">Lobby controls</button></div><div id="touch" hidden><div id="joystick" aria-label="Movement joystick"><div id="stick"></div></div><button id="action">ACTION</button></div><section id="raceResults" hidden role="region" aria-live="polite" aria-labelledby="resultsTitle"><h2 id="resultsTitle">Final results</h2><p id="resultsRule"></p><ol id="resultsList"></ol><button id="playAgain" hidden>Play Again · Quick Match</button><button id="closeResults">Keep driving in staging</button></section><div id="raceCountdown" hidden role="status" aria-live="polite"></div>`;
installWorkerStore(look=>room?.send('cosmetics',look));
if(partyPage){document.body.classList.add('party-page');document.querySelector('h1')!.textContent='PARTY NIGHT';document.getElementById('menuIntro')!.textContent='One room. Three games. One Employee of the Month. 2–8 workers. Odd groups can race; paired modes wait briefly or skip for everyone.';}
const partyLink=document.createElement('a');partyLink.className='mode-tile';partyLink.href=partyPage?'/':'/party.html';partyLink.textContent=partyPage?'← BREAK TIME games':'PARTY NIGHT · 3 playable modes · 2–8 workers';document.getElementById('modeTiles')!.prepend(partyLink);
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
for(const category of MATERIAL_CATEGORIES){const column=document.createElement('div');const heading=document.createElement('strong');heading.textContent=category.name;column.append(heading);for(const name of category.items){const m=MATERIALS.find(m=>m.name===name)!;const button=document.createElement('button');button.type='button';button.dataset.material=String(m.id);button.innerHTML=materialArt(m.id)+'<span class="material-name">'+m.name+'</span><span class="material-hazard">'+m.effect+'</span>';button.setAttribute('aria-label',m.name+' · '+m.effect);button.onclick=()=>room?.send('material',m.id);column.append(button);}el('materialGrid').append(column);}
const signalReadout=document.createElement('div');signalReadout.id='crewSignals';el('hud').append(signalReadout);
const status=(message:string)=>{el('status').textContent=message;};
const client=new Client(`${location.protocol==='https:'?'wss':'ws'}://${location.host}`);
let preferredMode='championship';
let room:Room|null=null;let serverCompatible=false;let busy=false;let recovery=false;let menuOpen=false;let recoveryRun:ReconnectRun<Room>|null=null;let connectionEpoch=0;let verifying=false;
const keys=new Set<string>();let joyX=0,joyZ=0;let joyPointer:number|null=null;
const savedCode=new URLSearchParams(location.search).get('room');if(savedCode)el<HTMLInputElement>('code').value=savedCode.toUpperCase();
try {el<HTMLInputElement>('name').value=localStorage.getItem('beam-name')||'Worker';}catch{}
function storageKey(key:string){return partyPage?key.replace(/^beam-/,'party-'):key;}
function storage(key:string,value:string|null){key=storageKey(key);try{if(value===null)sessionStorage.removeItem(key);else sessionStorage.setItem(key,value);}catch{}}
function stopInput(){keys.clear();joyX=joyZ=0;joyPointer=null;el('stick').style.transform='translate(0px,0px)';room?.send('input',{partyEpoch:partyEpochFor(room),x:0,z:0});}
async function connect(create:boolean){if(busy||room||!serverCompatible)return;busy=true;status('Connecting…');try{const name=el<HTMLInputElement>('name').value;try{localStorage.setItem('beam-name',name);}catch{}
  let joined:Room;
  if(create)joined=await client.create(partyPage?'party':'crew',{name,cosmetics:getWorkerLook()});
  else {const code=el<HTMLInputElement>('code').value.trim().toUpperCase();if(!/^[A-Z2-9]{5}$/.test(code))throw Error('Enter a five-character room code');const response=await fetch(`/api/${partyPage?'party':'rooms'}/${code}`);const result=await response.json();if(!response.ok)throw Error(result.error);joined=await client.joinById(result.roomId,{name,cosmetics:getWorkerLook()});}
  attach(joined);if(create&&!partyPage)joined.send('mode',preferredMode);
}catch(error){status(`Could not join: ${error instanceof Error?error.message:String(error)}. Check the code; active or full rooms cannot accept new players.`);}finally{busy=false;render();}}
const matchKey=crypto.randomUUID?.()??Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
async function quickMatch(){
  if(busy||room||!serverCompatible)return;
  busy=true;const epoch=++connectionEpoch;status('Searching for workers...');render();
  try{
    const joined=await client.joinOrCreate('wheel_public',{name:el<HTMLInputElement>('name').value,matchKey,cosmetics:getWorkerLook()});
    if(epoch!==connectionEpoch){await joined.leave();return;}
    attach(joined);
  }catch(error){if(epoch===connectionEpoch)status('Quick Match unavailable: '+(error instanceof Error?error.message:String(error))+'. Please try again.');}
  finally{if(epoch===connectionEpoch){busy=false;render();}}
}
el('quickMatch').onclick=()=>void quickMatch();
el('cancelMatch').onclick=()=>{const old=room;room=null;stopInput();cancelRecovery('Matchmaking canceled.');void old?.leave();};
el('playAgain').onclick=async()=>{const old=room;room=null;stopInput();cancelRecovery('Searching for workers...');await old?.leave();void quickMatch();};
function attach(joined:Room){room=joined;if(partyPage)installParty(joined);joined.send('cosmetics',getWorkerLook());recovery=false;storage('beam-token',joined.reconnectionToken);storage('beam-until',String(Date.now()+RESERVATION_MS));menuOpen=false;status('Connected');
  joined.onStateChange(()=>{if(room===joined){rememberReservation();render();}});joined.onError((code,message)=>{if(room===joined)status(`Connection error ${code}: ${message}`);});
  joined.onLeave(code=>{if(room!==joined)return;room=null;stopInput();render();if(code!==1000&&code!==4000){void reconnect(joined.reconnectionToken,Date.now()+RESERVATION_MS,!!joined.state?.publicMatch&&joined.state.phase==='lobby');}else{cancelRecovery('Left room. Create or join a room.');}});render();}
function cancelRecovery(message='Reconnect canceled. Create or join a room.'){
  connectionEpoch++;recoveryRun?.cancel();recoveryRun=null;recovery=false;busy=false;
  storage('beam-token',null);storage('beam-until',null);storage('beam-public-wait',null);status(message);render();
}
async function reconnect(token:string,until:number,publicWaiting=false){
  if(recovery||room)return;
  if(!reservationValid(until)){cancelRecovery('Your reserved place expired. Create or join a room.');return;}
  const epoch=++connectionEpoch,run=new ReconnectRun<Room>();recoveryRun=run;recovery=true;busy=true;
  storage('beam-until',String(until));stopInput();render();
  const countdown=setInterval(()=>{if(epoch===connectionEpoch)status(publicWaiting?'Rejoining public matchmaking...':`Reconnecting... ${Math.max(0,Math.ceil((until-Date.now())/1000))}s remaining. Cancel to join another room.`);},500);
  try{
    const joined=await run.run(until,()=>publicWaiting?client.joinOrCreate('wheel_public',{name:el<HTMLInputElement>('name').value,matchKey,cosmetics:getWorkerLook()}):client.reconnect(token),seconds=>status(publicWaiting?`Rejoining public matchmaking... ${seconds}s remaining.`:`Reconnecting... ${seconds}s remaining. Cancel to join another room.`));
    if(epoch!==connectionEpoch){if(joined)void joined.leave();return;}
    if(joined){recoveryRun=null;busy=false;attach(joined);}
    else cancelRecovery('Could not reconnect: the reserved place expired or is no longer available. Create or join a room.');
  }catch{if(epoch===connectionEpoch)cancelRecovery('Connection failed. Create or join a room.');}finally{clearInterval(countdown);}
}
el('cancelReconnect').onclick=()=>cancelRecovery();
function rememberReservation(){if(room){storage('beam-token',room.reconnectionToken);storage('beam-until',String(Date.now()+RESERVATION_MS));storage('beam-public-wait',room.state?.publicMatch&&room.state.phase==='lobby'?'1':null);}}
setInterval(rememberReservation,1000);window.addEventListener('pagehide',rememberReservation);
function chooseMode(mode:string){preferredMode=mode;el('quickMatch').hidden=mode==='competitive';for(const [id,value]of [['chooseWheel','championship'],['chooseBeam','competitive']]){el(id).classList.toggle('selected',mode===value);el(id).setAttribute('aria-pressed',String(mode===value));}}
el('chooseWheel').onclick=()=>chooseMode('championship');el('chooseBeam').onclick=()=>chooseMode('competitive');
el('create').onclick=()=>void connect(true);el('join').onclick=()=>void connect(false);
el<HTMLSelectElement>('mode').onchange=()=>room?.send('mode',el<HTMLSelectElement>('mode').value);
el<HTMLSelectElement>('beamMap').onchange=()=>room?.send('beamMap',Number(el<HTMLSelectElement>('beamMap').value));
let beamOverview=false;el('beamOverview').onclick=()=>{beamOverview=!beamOverview;el('beamOverview').textContent=beamOverview?'Follow worker':'Course view';};
el('beamRescue').onclick=()=>room?.send('rescue',{partyEpoch:partyEpochFor(room)});
el<HTMLSelectElement>('championshipLength').onchange=()=>room?.send('championshipLength',Number(el<HTMLSelectElement>('championshipLength').value));
el('start').onclick=()=>room?.send('start');
el('reset').onclick=()=>{stopInput();room?.send('reset');menuOpen=false;render();};
el('restart').onclick=()=>{stopInput();room?.send('restart');menuOpen=false;render();};el('back').onclick=()=>{stopInput();room?.send('lobby');menuOpen=false;};
el('leave').onclick=()=>{const old=room;stopInput();room=null;cancelRecovery('Left room. Create or join a room.');void old?.leave();};
el('share').onclick=async()=>{if(!room?.state.code)return;const url=new URL(location.href);url.search='';url.searchParams.set('room',room.state.code);try{await navigator.clipboard.writeText(url.href);status('Join link copied');}catch{status(`Join link: ${url.href}`);}};
let shownResults='',dismissedResults='';
el('showResults').onclick=()=>{dismissedResults='';renderResults(room?.state);};
el('closeResults').onclick=()=>{dismissedResults=shownResults;el('raceResults').hidden=true;};
function renderResults(state:any){
  el('playAgain').hidden=!state?.publicMatch||state?.racePhase!=='results';
  const ready=state?.phase==='test'&&state.racePhase==='results'&&(state.mode!=='competitive'||state.teams.length>0);el('showResults').hidden=!ready;
  const key=ready?room?.roomId+':'+state.mode+':'+state.raceResets:'';
  if(!ready){el('raceResults').hidden=true;shownResults='';dismissedResults='';return;}
  shownResults=key;el('raceResults').hidden=dismissedResults===key;
  el('resultsTitle').textContent=state.mode==='championship'?'Championship results':'Final results';
  if(state.mode==='championship'){
    el('resultsRule').textContent=legCount(state)+' courses · Fewest cumulative spills wins · Combined racing time breaks ties';
    el('closeResults').textContent='Keep driving in staging';
    el('resultsList').replaceChildren(...[...state.standings].sort((a:any,b:any)=>a.place-b.place).map((r:any)=>{const li=document.createElement('li');li.textContent='#'+r.place+' '+r.name+' · '+(r.dnf?'DNF · ':'')+r.spills+' spills · '+r.time.toFixed(2)+'s · '+r.completed+'/'+legCount(state)+' courses';return li;}));return;
  }
  el('resultsRule').textContent=isWheel(state)?'Fewest spills wins · Fastest time breaks ties · Race time '+state.elapsed.toFixed(2)+'s':'Two workers per beam · Fastest team wins';
  el('closeResults').textContent=currentPresentation.compact?'Close':isWheel(state)?'Keep driving in staging':'Close results';
 const entries=isWheel(state)?[...state.results].sort((a:any,b:any)=>a.place-b.place):[...state.teams].sort((a:any,b:any)=>(a.place||99)-(b.place||99));
  el('resultsList').replaceChildren(...entries.map((r:any)=>{const li=document.createElement('li');li.textContent=isWheel(state)?'#'+r.place+' '+r.name+' · '+r.spills+' spills · '+r.time.toFixed(2)+'s':r.name+' · '+r.members+' · '+(r.dnf?'DNF':'#'+r.place+' · '+r.finishTime.toFixed(2)+'s');return li;}));
}
el('menu').onclick=()=>{menuOpen=!menuOpen;if(menuOpen)stopInput();render();};
function action(){if(room&&beamActionState(room.state,room.state.players?.get(room.sessionId)).enabled)room.send('action',{partyEpoch:partyEpochFor(room)});}
el('grab').onclick=action;
el('action').addEventListener('pointerdown',e=>{e.preventDefault();action();});
document.querySelectorAll<HTMLButtonElement>('[data-signal]').forEach(button=>button.onclick=()=>room?.send('signal',button.dataset.signal));
window.addEventListener('keydown',e=>{if(document.querySelector<HTMLDialogElement>('#workerStore')?.open||(e.target as HTMLElement).matches('input,textarea,select')||room?.state.phase!=='test')return;if(['KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code)){e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)action();}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',stopInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopInput();});
const joystick=el('joystick');
function moveJoystick(e:PointerEvent){if(e.pointerId!==joyPointer)return;const rect=joystick.getBoundingClientRect();let x=e.clientX-rect.left-rect.width/2,z=e.clientY-rect.top-rect.height/2;const radius=rect.width*.32,length=Math.hypot(x,z);if(length>radius){x*=radius/length;z*=radius/length;}joyX=x/radius;joyZ=z/radius;el('stick').style.transform=`translate(${x}px,${z}px)`;if(room?.state.mode==='competitive')room.send('input',{partyEpoch:partyEpochFor(room),x:joyX,z:joyZ});}
joystick.onpointerdown=e=>{joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveJoystick(e);};joystick.onpointermove=moveJoystick;
joystick.onpointerup=joystick.onpointercancel=()=>{joyPointer=null;joyX=joyZ=0;el('stick').style.transform='translate(0px,0px)';if(room?.state.mode==='competitive')room.send('input',{partyEpoch:partyEpochFor(room),x:0,z:0});};
joystick.addEventListener('lostpointercapture',()=>{if(room?.state.mode==='competitive'){joyPointer=null;joyX=joyZ=0;el('stick').style.transform='translate(0px,0px)';room.send('input',{partyEpoch:partyEpochFor(room),x:0,z:0});}});
setInterval(()=>{if(room?.state.phase==='test'&&!document.hidden){room.send('input',{partyEpoch:partyEpochFor(room),x:(Number(keys.has('KeyD'))-Number(keys.has('KeyA')))+joyX,z:(Number(keys.has('KeyS'))-Number(keys.has('KeyW')))+joyZ});}},1000/30);
function render(){el('hud').classList.toggle('beam-hud',room?.state?.mode==='competitive');el('hud').classList.toggle('championship-hud',room?.state?.mode==='championship');el('retryConnection').hidden=serverCompatible||verifying;el('cancelReconnect').hidden=!recovery;el('menu').textContent=currentPresentation.compact?'Menu':'Lobby controls';el('panel').classList.toggle('connected',!!room);el('hud').classList.toggle('menu-open',menuOpen);const state=room?.state,playing=state?.phase==='test';el('room').hidden=!room;el('panel').classList.toggle('playing',!!playing&&!menuOpen);el('hud').hidden=!playing;el('touch').hidden=!playing||menuOpen;renderResults(state);
  el<HTMLButtonElement>('quickMatch').disabled=busy||!!room||!serverCompatible;el('cancelMatch').hidden=!(busy&&!recovery)||!!room;
  el<HTMLButtonElement>('create').disabled=busy||!!room||!serverCompatible;el<HTMLButtonElement>('join').disabled=busy||!!room||!serverCompatible;
  if(!state?.players)return;
  if(state.code&&typeof state.mode!=='string'){status('Outdated BREAK TIME server. Close the existing server, relaunch Start-BeamCrew.cmd, then refresh both browsers.');el<HTMLButtonElement>('start').disabled=true;return;}el('roomCode').textContent=`Room ${state.code}`;el('players').replaceChildren();let connected=0;
  state.players.forEach((p:any,id:string)=>{if(p.connected)connected++;const row=document.createElement('li');row.textContent=`${p.name}${id===room?.sessionId?' (you)':''}${id===state.host?' • host':''}${p.connected?'':' • reconnecting'}`;row.style.borderLeft=`6px solid #${colors[p.color].toString(16).padStart(6,'0')}`;el('players').append(row);});
  const host=!state.publicMatch&&state.host===room?.sessionId;el('start').hidden=!host||playing;el<HTMLButtonElement>('start').disabled=connected<2;el('back').hidden=!host||!playing;el('reset').hidden=!host||!playing;el('restart').hidden=!host||!playing;
  el('restart').textContent=state.mode==='championship'?'Restart Championship':'Restart course';
  el('back').textContent=playing?'Return to lobby / change game mode':'Return to lobby';
  el('help').innerHTML=isWheel(state)?'Protect the load: fewest spills wins; time breaks ties.<br>WASD / joystick to push. Follow painted arrows; brake before turns.':'WASD to move · Space to grab/release<br>On phones: joystick + ACTION';
  el('championshipLengthLabel').hidden=playing||state.mode!=='championship';el<HTMLSelectElement>('championshipLength').disabled=!host;el<HTMLSelectElement>('championshipLength').value=String(legCount(state));
  el('modeLabel').hidden=playing;el<HTMLSelectElement>('mode').disabled=!host;el<HTMLSelectElement>('mode').value=state.mode;
  const me=state.players.get(room?.sessionId);
  el('beamMapLabel').hidden=el('beamMapDescription').hidden=playing||state.mode!=='competitive';el<HTMLSelectElement>('beamMap').disabled=!host;el<HTMLSelectElement>('beamMap').value=String(state.beamMap);el('beamMapDescription').textContent=BEAM_MAPS[state.beamMap]?.description??'';
  el('beamOverview').hidden=!playing||state.mode!=='competitive';
  el('beamRescue').hidden=!playing||state.mode!=='competitive'||state.racePhase!=='racing'||!me||me.team<0||!!state.teams[me.team]?.delivered;
  el<HTMLButtonElement>('beamRescue').disabled=(state.teams[me?.team]?.protection??0)>0;
  el('materials').hidden=playing||!isWheel(state);el('panel').classList.toggle('selecting',!playing&&isWheel(state));
  document.querySelectorAll<HTMLButtonElement>('[data-material]').forEach(b=>{const selected=Number(b.dataset.material)===me?.materialId;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);b.disabled=playing;});
  el('chosenLoad').textContent='Selected: '+(MATERIALS[me?.materialId]?.name??'Bricks');
  renderBeamHud(state,me);el('hudText').textContent=`${state.code} · ${connected}/8 workers · ${me?.grip>=0?'GRIPPING '+(me.grip+1):'FREE'}${me?.signal?' · '+me.signal:''}`;
  if(state.mode==='competitive'){
    el('reset').hidden=true;
    el('hudText').textContent=state.racePhase==='countdown'?Math.ceil(state.countdown)+' · GET READY':state.racePhase==='results'?'TEAM RESULTS':state.elapsed.toFixed(1)+'s';
    if(me?.team>=0&&state.teams[me.team]) el('hudText').textContent+=' | '+BEAM_MAPS[state.beamMap].name+' | Team '+(me.team+1)+' | End '+(me.end===0?'1':'2');
    signalReadout.textContent=Array.from(state.teams as Iterable<any>).map((b,i)=>'Team '+(i+1)+' · '+b.members+' · '+(b.dnf?'DNF':b.delivered?'#'+b.place+' · '+b.finishTime.toFixed(2)+'s':('racing · +'+b.penalty+'s'))).join(' | ');
  }
  if(isWheel(state)){renderWheelHud(state,me);el('reset').hidden=true;}
  const beamActive=beamActionState(state,me).enabled;el('grab').hidden=el('action').hidden=el('signals').hidden=!beamActive;el('beamRescue').hidden=el('beamRescue').hidden||!beamActive;
  updateStandings(state);
  const signals:string[]=[];state.players.forEach((p:any)=>{if(p.signal)signals.push(`${p.name}: ${p.signal}`);});if(state.mode==='beam')signalReadout.textContent=signals.join(' · ');
  if(state.publicMatch){el('share').hidden=true;el('modeLabel').hidden=true;el('championshipLengthLabel').hidden=true;el('roomCode').textContent='Quick Match · '+connected+'/8 workers';el('leave').textContent=playing?'Leave match':'Cancel matchmaking';status(playing?'Public Wheelbarrow Championship':connected<2?'Waiting for workers · '+connected+'/8':'Waiting for workers · '+connected+'/8 · Starts in '+Math.ceil(state.matchCountdown||15)+'s');return;}el('share').hidden=false;el('leave').textContent='Leave room';
  if(playing&&isWheel(state))status('Wheelbarrow Race — host can restart from Lobby controls.');else if(playing)status('Beam Carry active — host controls can reset or restart.');else status(connected<2?'Waiting for another worker to start.':'Ready — the host can start the test.');}
// Render only: all gameplay positions and rotations originate on the server.
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb8e1e4);scene.fog=new THREE.Fog(0xb8e1e4,30,85);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,100);camera.position.set(0,15,18);
let renderer:THREE.WebGLRenderer;
try{renderer=new THREE.WebGLRenderer({antialias:true});}catch{status('This browser cannot start 3D graphics. Try a browser with WebGL enabled.');throw Error('WebGL unavailable');}
document.body.prepend(renderer.domElement);
const resolution=new ResolutionGovernor();let displayDpr=devicePixelRatio;
let currentPresentation=presentationFor(innerWidth,innerHeight,matchMedia('(any-pointer:coarse)').matches||navigator.maxTouchPoints>0);
function resizeRenderer(){
 const width=Math.max(1,renderer.domElement.clientWidth),height=Math.max(1,renderer.domElement.clientHeight);
 displayDpr=devicePixelRatio;const ratio=renderRatio(width,height,displayDpr,matchMedia('(pointer:coarse)').matches,resolution.scale);
 renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);
 currentPresentation=presentationFor(width,height,matchMedia('(any-pointer:coarse)').matches||navigator.maxTouchPoints>0);
 document.body.classList.toggle('mobile-landscape',currentPresentation.compact);
 camera.aspect=width/height;camera.fov=currentPresentation.fov;camera.updateProjectionMatrix();queueMicrotask(render);
}
resizeRenderer();new ResizeObserver(resizeRenderer).observe(renderer.domElement);
window.visualViewport?.addEventListener('resize',resizeRenderer);
scene.add(new THREE.HemisphereLight(0xffffff,0x728f8b,2.2));const sun=new THREE.DirectionalLight(0xffebc5,2.3);sun.position.set(8,20,10);scene.add(sun);
const originalScenery=scenery(scene);
const championshipWorld=createModularWorld();scene.add(championshipWorld.root);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
function box(w:number,h:number,d:number,color:number,x:number,y:number,z:number,parent:THREE.Object3D=scene){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
box(20,.5,20,0x88949c,0,-.25,0);const grid=new THREE.GridHelper(20,10,0x667780,0x778790);grid.position.y=.015;scene.add(grid);
for(const x of [-10,10])for(const z of [-10,10]){box(.4,5,.4,0x405768,x,2.5,z);}
for(const z of [-10,10]){box(20,.15,.15,0xffc137,0,.8,z);box(20,.15,.15,0xffc137,0,1.4,z);}
for(const x of [-10,10]){box(.15,.15,20,0xffc137,x,.8,0);box(.15,.15,20,0xffc137,x,1.4,0);}
for(let i=0;i<12;i++){const h=4+(i%5)*3;box(4,h,4,0x7898ab,(i-6)*7,-8+h/2,-28);}
const baseVisuals=scene.children.filter(o=>o instanceof THREE.Mesh||o instanceof THREE.GridHelper);
function disposeVisual(root:THREE.Object3D){scene.remove(root);root.traverse(o=>{if(o instanceof THREE.Sprite){const index=worldLabels.indexOf(o);if(index>=0)worldLabels.splice(index,1);}const mesh=o as THREE.Mesh;if(mesh.geometry)mesh.geometry.dispose();const materials=mesh.material?(Array.isArray(mesh.material)?mesh.material:[mesh.material]):[];for(const material of materials){const map=(material as THREE.MeshLambertMaterial).map;map?.dispose();material.dispose();}});}
const lobbyCrew=new THREE.Group();scene.add(lobbyCrew);
for(let i=0;i<2;i++){const mascot=makeWorker(colors[i]);mascot.position.set(2+i*2.5,0,2);mascot.rotation.y=-.4;mascot.scale.setScalar(1.2);lobbyCrew.add(mascot);}
const workers=new Map<string,THREE.Group>();
function worker(color:number,look:WorkerLook){const g=makeWorker(color,look);g.userData.lookKey=workerLookKey(look);scene.add(g);return g;}
let previous=performance.now();
function updateCountdown(state:any){
 const overlay=el('raceCountdown');
 const counting=state?.phase==='test'&&state?.mode==='championship'&&['countdown','intermission'].includes(state.racePhase);
 const value=counting?Math.ceil(state.countdown):0;
 const go=state?.phase==='test'&&state?.mode==='championship'&&state.racePhase==='racing'&&state.elapsed<.75;
 const text=go?'GO!':value>0&&value<=3?String(value):'';
 overlay.hidden=!text;if(overlay.textContent!==text)overlay.textContent=text;
}

function frame(now:number){requestAnimationFrame(frame);const frameMs=now-previous;const dt=Math.min(frameMs/1000,.1);previous=now;if(resolution.sample(frameMs,!document.hidden)||displayDpr!==devicePixelRatio)resizeRenderer();const state=room?.state;updateCountdown(state);lobbyCrew.visible=!room;
  for(const [id,g]of workers){if(!state?.players?.has(id)){disposeVisual(g);workers.delete(id);}}
  state?.players?.forEach((p:any,id:string)=>{let g=workers.get(id);const look=validateWorkerLook(p);if(!g||g.userData.lookKey!==workerLookKey(look)){const previous=g;g=worker(colors[p.color],look);if(previous){g.position.copy(previous.position);g.rotation.copy(previous.rotation);disposeVisual(previous);}else g.position.set(p.x,0,p.z);workers.set(id,g);}const wheel=state.phase==='test'&&isWheel(state),wx=p.x-(wheel?Math.sin(p.rotation)*.7:0),wz=p.z-(wheel?Math.cos(p.rotation)*.7:0);animateWorker(g,wheel?Math.abs(p.speed):Math.hypot(p.x-g.position.x,p.z-g.position.z)*8,wheel||p.grip>=0,wheel&&p.reload>0?(2.4-p.reload)*1000:wheel&&state.racePhase!=='results'?state.elapsed*1000:now,wheel?Math.max(p.instability*.35,p.reload/2.4):0,wheel);const blend=1-Math.exp(-18*dt);g.position.x+=(wx-g.position.x)*blend;g.position.z+=(wz-g.position.z)*blend;const difference=Math.atan2(Math.sin(p.rotation-g.rotation.y),Math.cos(p.rotation-g.rotation.y));g.rotation.y+=difference*blend;g.position.y=(isWheel(state)?state.mode==='championship'?championshipRise(state,p.x,p.z):rampHeight(p.x,p.z):0)+Math.sin(now*.008+p.color)*.025;g.visible=p.connected;});
  const me=room&&workers.get(room.sessionId);const overview=state?.mode==='competitive'&&state.phase==='test'&&beamOverview;const target=overview?new THREE.Vector3(11,0,-1):me?.position??new THREE.Vector3();const overviewY=Math.max(40,52/camera.aspect);camera.position.lerp(new THREE.Vector3(target.x,overview?overviewY:currentPresentation.cameraY,target.z+(overview?overviewY*.5:currentPresentation.cameraZ)),1-Math.exp(-4*dt));camera.lookAt(target.x,0,target.z-(overview?0:currentPresentation.lookAhead));
  for(const sprite of worldLabels){sprite.scale.set(sprite.userData.width*currentPresentation.labelScale,sprite.userData.height*currentPresentation.labelScale,1);}updateBeamVisual(state,dt,now);updateWheelVisual(state,dt,now);if(state?.mode==='championship'&&state.routeIds.length&&['countdown','intermission'].includes(state.racePhase))championshipWorld.warmNext(renderer,scene,camera,state.leg);renderer.render(scene,camera);
}
requestAnimationFrame(frame);window.addEventListener('resize',resizeRenderer);


const worldLabels:THREE.Sprite[]=[];
function label(text:string,color='#172d3c',width=3,square=false){
  const canvas=document.createElement('canvas');canvas.width=square?96:512;canvas.height=96;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='#ffffffe8';ctx.fillRect(0,0,canvas.width,96);
  ctx.fillStyle=color;ctx.font=square?'bold 60px system-ui':'bold 42px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,canvas.width/2,48);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:false}));
  sprite.userData.width=width;sprite.userData.height=width*96/canvas.width;worldLabels.push(sprite);sprite.scale.set(width,width*96/canvas.width,1);scene.add(sprite);return sprite;
}
const courseVisual=new THREE.Group();scene.add(courseVisual);
const fullDeck=new THREE.Group();courseVisual.add(fullDeck);
box(44,.3,20,0x9d8b70,12,-.22,0,fullDeck);
for(const z of [-9.8,9.8])box(44,.6,.2,0xe3ad47,12,.3,z,fullDeck);
for(const x of [-9.8,31.8])box(.2,.6,20,0xe3ad47,x,.3,0,fullDeck);
for(let x=-8;x<32;x+=4)for(const z of [-9.8,9.8])box(.35,1.5,.35,0x263b46,x,.75,z,fullDeck);
for(let x=8;x<26;x+=3){box(1.3,.04,.16,0xffcf43,x,.04,-7.5,courseVisual);}
const skyDecks=BEAM_MAPS.map(map=>{
 const g=new THREE.Group();courseVisual.add(g);if(!map.elevated)return g;
 box(19,1,20,0x9d8b70,-.5,-.55,0,g);box(7,1,20,0x9d8b70,28.5,-.55,0,g);
 box(16,1,map.edge+10,0x87929a,17,-.55,(-10+map.edge)/2,g);
 box(44,.25,20,0x3d525c,12,-4.5,0,g);if(map.excavator)box(2.5,4.5,2,0x66747b,20,-2.25,-2.6,g);
 for(const z of [-9.9,map.edge-.12]){box(16,.06,.16,0xffce43,17,.02,z,g);for(let x=10;x<25;x+=2)box(.3,.1,.3,0x273e4b,x,.04,z,g);}
 for(const x of [10,17,24])box(.55,4,.55,0x526373,x,-2,-7.5,g);
 return g;
});
const excavatorVisual=new THREE.Group();courseVisual.add(excavatorVisual);excavatorVisual.position.set(EXCAVATOR.x,0,EXCAVATOR.z);
for(const z of [-.65,.65])box(2.3,.5,.35,0x263b46,0,.25,z,excavatorVisual);
const excavatorUpper=new THREE.Group();excavatorVisual.add(excavatorUpper);
box(1.8,.65,1.3,0xf2b632,0,.7,0,excavatorUpper);box(.8,1,.9,0x263b46,-.25,1.45,0,excavatorUpper);box(.65,.5,.92,0x90ced8,-.2,1.55,0,excavatorUpper);
box(EXCAVATOR.length,.45,.65,0xf2b632,EXCAVATOR.length/2,1.05,0,excavatorUpper);
box(.7,.9,.7,0x394851,EXCAVATOR.length, .65,0,excavatorUpper);
box(.2,.15,.8,0xffde5c,EXCAVATOR.length+.3,.25,0,excavatorUpper);
const sweepRing=new THREE.Mesh(new THREE.RingGeometry(EXCAVATOR.length-.25,EXCAVATOR.length+.4,48),new THREE.MeshBasicMaterial({color:0xf08b3b,transparent:true,opacity:.3,side:THREE.DoubleSide}));sweepRing.rotation.x=-Math.PI/2;sweepRing.position.y=.04;excavatorVisual.add(sweepRing);
const sweepPreview=new THREE.Group();excavatorVisual.add(sweepPreview);const preview=box(EXCAVATOR.length,.025,.14,0xffdd55,EXCAVATOR.length/2,.06,0,sweepPreview);(preview.material as THREE.MeshLambertMaterial).transparent=true;(preview.material as THREE.MeshLambertMaterial).opacity=.5;
const sweepLabel=label('SWEEP • WAIT FOR GAP','#923f23',3.7);sweepLabel.position.set(20,2.8,-2.6);
const movingLoadVisuals=movingLoads(0).map(o=>{
 const g=new THREE.Group();courseVisual.add(g);
 box(o.halfX*2,1.5,o.halfZ*2,0xd85e32,0,.85,0,g);
 box(o.halfX*2+.12,.16,o.halfZ*2+.12,0x263b46,0,1.65,0,g);
 box(.06,3,.06,0x263b46,0,3.15,0,g);return g;
});
const beamObstacleGroups=BEAM_MAPS.map((_,id)=>{const g=new THREE.Group();courseVisual.add(g);for(const o of beamWorld(id).obstacles){
 const height=o.x>=8?.6:2.3;box(o.halfX*2,height,o.halfZ*2,0xe3ad47,o.x,height/2,o.z,g);box(o.halfX*2+.05,.14,o.halfZ*2+.05,0x273e4b,o.x,height+.07,o.z,g);
}return g;});
const goalMaterial=new THREE.MeshLambertMaterial({color:0x45bfa4,transparent:true,opacity:.7});
const goalMesh=new THREE.Mesh(new THREE.BoxGeometry(COURSE.goal.halfX*2,.03,COURSE.goal.halfZ*2),goalMaterial);
goalMesh.position.set(COURSE.goal.x,.035,COURSE.goal.z);courseVisual.add(goalMesh);
const startLabel=label('START • GRAB BOTH ENDS');startLabel.position.set(-5,.4,8.9);
const doorLabel=label('1 • DOORWAY');doorLabel.position.set(-5,2.9,1.5);
const turnLabel=label('2 • TURN RIGHT');turnLabel.position.set(-1,2.9,-3.9);
const destinationLabel=label('3 • DELIVER BEAM');destinationLabel.position.set(COURSE.goal.x,.5,COURSE.goal.z);
const beamVisual=new THREE.Group(),beamTilt=new THREE.Group();beamVisual.add(beamTilt);scene.add(beamVisual);
box(BEAM_CONFIG.length,.08,BEAM_CONFIG.width+.12,0x46718a,0,.17,0,beamTilt);
box(BEAM_CONFIG.length,.08,BEAM_CONFIG.width+.12,0x46718a,0,-.17,0,beamTilt);
box(BEAM_CONFIG.length,.3,.08,0x36586d,0,0,0,beamTilt);
for(const x of [-1,1])box(.2,.4,.46,0xffcd43,x*BEAM_CONFIG.length/2,0,0,beamTilt);
for(const x of [-1.5,-.75,0,.75,1.5])for(const z of [-.12,.12])box(.045,.025,.045,0xb8d3da,x,.225,z,beamTilt);
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
const otherBeams:THREE.Group[]=[];
let displayedResets=-1;
function renderBeamHud(state:any,me:any){
  const activity=beamActionState(state,me);
  resetBeamActionControls(activity.enabled,el<HTMLButtonElement>('grab'),el<HTMLButtonElement>('action'));
  if(isWheel(state))return;
  const b=state.mode==='competitive'?state.teams[me?.team]:state.beam;
  if(!activity.enabled||!b){
    const alone=state.mode==='competitive'&&[...state.players.values()].filter((p:any)=>p.connected).length<2;
    const message=alone?WAITING_FOR_TEAMMATE:activity.message;
    el('beamStatus').textContent=message;
    el('help').textContent=message;return;
  }
  const occupied=new Set<number>();state.players.forEach((p:any)=>{if(p.grip>=0&&p.team===me?.team)occupied.add(p.grip);});
  let nearest=-1,distance=BEAM_CONFIG.grabRadius;
  if(me)GRIPS.forEach((_,i)=>{if(state.mode==='competitive'&&i!==me.end)return;const point=gripPosition(b,i),d=Math.hypot(point.x-me.x,point.z-me.z);if(!occupied.has(i)&&d<distance){nearest=i;distance=d;}});
  const attached=me?.grip>=0;
  el('grab').textContent=attached?'RELEASE · Space':nearest>=0?`GRAB ${nearest+1} · Space`:'GRAB · Space';
  el('action').textContent=attached?'RELEASE':'ACTION';
  const support=b.leftSupported&&b.rightSupported?'Both ends carried':b.leftSupported||b.rightSupported?'One end DRAGGING':'Both ends grounded';
  const instruction=b.delivered?'DELIVERED | #'+b.place+' | '+b.finishTime.toFixed(2)+'s':attached?'Move together to carry. Different directions turn the beam.':nearest>=0?`Grip ${nearest+1} nearby — Space / ACTION to grab`:'Approach a white grip ring. Space / ACTION toggles grab.';
  el('beamStatus').textContent=`${instruction}\n${support} · ${b.blocked?'Blocked — coordinate a turn':b.checkpoint?'Checkpoint saved | time the moving loads':'Doorway → turn right → moving loads → green delivery'}${me?.feedback?'\n'+me.feedback:''}`;
  if(state.mode==='competitive'){const partner=[...state.players.values()].find((p:any)=>p.team===me?.team&&p.end!==me?.end);el('beamStatus').textContent+=(b.protection>0?'\nTEAM RECOVERED · +5s · ready in '+b.protection.toFixed(1)+'s':partner&&!partner.connected?'\nPartner reconnecting — controls paused':'\n'+b.recoveries+' recoveries · +'+b.penalty+'s · 4 minute round limit');}
  el('reset').textContent=b.checkpoint?'Reset to doorway checkpoint':'Reset to start';
  el('grab').classList.toggle('attached',attached);el('action').classList.toggle('attached',attached);
}
function updateBeamVisual(state:any,dt:number,now:number){
  const b=state?.mode==='competitive'?state.teams[state.players.get(room?.sessionId)?.team]??state.teams[0]:state?.beam,playing=state?.phase==='test'&&!isWheel(state);
  courseVisual.visible=beamVisual.visible=playing;
  while(otherBeams.length<(state?.teams?.length??0)){const g=new THREE.Group();box(BEAM_CONFIG.length,.4,.45,colors[otherBeams.length*2],0,0,0,g);scene.add(g);otherBeams.push(g);}
  otherBeams.forEach((g,i)=>{const t=state?.teams?.[i];g.visible=playing&&state.mode==='competitive'&&!!t&&t!==b;if(t){g.position.set(t.x,(t.leftHeight+t.rightHeight)/2,t.z);g.rotation.y=-t.angle;}});
  for(const sprite of [startLabel,doorLabel,turnLabel,destinationLabel])sprite.visible=playing;
  for(const visual of gripVisuals){visual.ring.visible=visual.text.visible=visual.rope.visible=playing;}
  for(const skid of dragMarkers)skid.visible=playing;
  const map=BEAM_MAPS[state?.beamMap??0];beamObstacleGroups.forEach((g,i)=>g.visible=i===(state?.beamMap??0));fullDeck.visible=!map.elevated;skyDecks.forEach((g,i)=>g.visible=map.elevated&&i===state?.beamMap);excavatorVisual.visible=map.excavator;sweepLabel.visible=playing&&map.excavator;
  if(!playing||!b)return;
  excavatorUpper.rotation.y=-excavatorAngle(state.elapsed);sweepPreview.rotation.y=-excavatorAngle(state.elapsed+1.5);
  movingLoads(state.elapsed).forEach((o,i)=>movingLoadVisuals[i].position.set(o.x,0,o.z));
  if(displayedResets!==b.resets){stopInput();Object.assign(displayedBeam,b);displayedResets=b.resets;}
  const blend=1-Math.exp(-18*dt);displayedBeam.x+=(b.x-displayedBeam.x)*blend;displayedBeam.z+=(b.z-displayedBeam.z)*blend;
  displayedBeam.angle+=Math.atan2(Math.sin(b.angle-displayedBeam.angle),Math.cos(b.angle-displayedBeam.angle))*blend;
  displayedBeam.leftHeight+=(b.leftHeight-displayedBeam.leftHeight)*blend;displayedBeam.rightHeight+=(b.rightHeight-displayedBeam.rightHeight)*blend;
  beamVisual.position.set(displayedBeam.x,(displayedBeam.leftHeight+displayedBeam.rightHeight)/2,displayedBeam.z);
  beamVisual.rotation.y=-displayedBeam.angle;beamTilt.rotation.z=Math.atan2(displayedBeam.rightHeight-displayedBeam.leftHeight,BEAM_CONFIG.length);
  const occupants=new Map<number,any>();state.players.forEach((p:any)=>{if(p.grip>=0&&(state.mode!=='competitive'||state.teams[p.team]===b))occupants.set(p.grip,p);});
  const me=state.players.get(room?.sessionId);
  gripVisuals.forEach((visual,i)=>{
    if(state.mode==='competitive'&&i!==0&&i!==7){visual.ring.visible=visual.text.visible=visual.rope.visible=false;return;}
    const point=gripPosition(displayedBeam,i),p=occupants.get(i);
    const near=me?.grip<0&&(state.mode!=='competitive'||i===me.end)&&!p&&Math.hypot(me.x-point.x,me.z-point.z)<BEAM_CONFIG.grabRadius;
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

const wheelCourseVisual=new THREE.Group();scene.add(wheelCourseVisual);
box(34,.3,54,0x776e5d,0,-.2,-13,wheelCourseVisual);
WHEEL_COURSE.slice(1).forEach((b,i)=>{
  const a=WHEEL_COURSE[i],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
  const road=box(WHEEL_CONFIG.corridorRadius*2,.05,length+WHEEL_CONFIG.corridorRadius*2,0xbfa780,(a.x+b.x)/2,.01,(a.z+b.z)/2,wheelCourseVisual);road.rotation.y=Math.atan2(dx,dz);
  for(let t=1;t<length;t+=2.8){
    const arrow=new THREE.Group();arrow.position.set(a.x+dx*t/length,.07,a.z+dz*t/length);arrow.rotation.y=Math.atan2(dx,dz);wheelCourseVisual.add(arrow);
    const paint=paintArrow();paint.rotation.x=-Math.PI/2;arrow.add(paint);
  }
});
const ropePoints=WHEEL_FENCES.flatMap(f=>[new THREE.Vector3(f.a.x,.5,f.a.z),new THREE.Vector3(f.b.x,.5,f.b.z)]);
const originalRopes=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(ropePoints),new THREE.LineBasicMaterial({color:0xf0d397}));wheelCourseVisual.add(originalRopes);
for(const p of WHEEL_OBSTACLES){box(.3,.65,.3,0xffc137,p.x,.32,p.z,wheelCourseVisual);box(.32,.12,.32,0x27343d,p.x,.48,p.z,wheelCourseVisual);}
for(let x=WHEEL_ROUGH.minX;x<=WHEEL_ROUGH.maxX;x+=.65)box(.16,.13,WHEEL_ROUGH.maxZ-WHEEL_ROUGH.minZ,0x7f705d,x,.1,-10,wheelCourseVisual);
for(const x of [WHEEL_ROUGH.minX,WHEEL_ROUGH.maxX])for(let z=WHEEL_ROUGH.minZ;z<WHEEL_ROUGH.maxZ;z+=.4)box(.3,.025,.2,Math.round(z*10)%8===0?0x27343d:0xffc137,x,.09,z,wheelCourseVisual);
box(5,.04,.25,0x54d695,-6,.09,6,wheelCourseVisual);
// Decorative spikes never participate in collision. One shared invisible wedge
// profile raises carts and its server-side lip prevents reverse course entry.
const spikeShape=new THREE.Shape();spikeShape.moveTo(-.11,0);spikeShape.lineTo(.11,0);spikeShape.lineTo(.04,.28);spikeShape.closePath();
const spikeGeometry=new THREE.ExtrudeGeometry(spikeShape,{depth:.08,bevelEnabled:false});
const spikeMaterial=new THREE.MeshLambertMaterial({color:0xf5cb32});
const boltGeometry=new THREE.CylinderGeometry(.035,.035,.025,6),boltMaterial=new THREE.MeshLambertMaterial({color:0x89949b});
for(let section=0;section<7;section++){
 const x=-5.8+section*.8+.4;
 box(.77,.07,1.4,0x283039,x,.06,-17.5,wheelCourseVisual);
 for(const dx of [-.29,.29])for(const z of [-16.95,-18.05]){const bolt=new THREE.Mesh(boltGeometry,boltMaterial);bolt.position.set(x+dx,.11,z);wheelCourseVisual.add(bolt);}
 for(let i=0;i<3;i++){const spike=new THREE.Mesh(spikeGeometry,spikeMaterial);spike.position.set(x-.26+i*.26,.11,FINISH_RAMP.edgeZ+.18);wheelCourseVisual.add(spike);}
}
for(let row=0;row<3;row++)for(let i=0;i<14;i++)box(.4,.025,.13,(i+row)%2?0xffffff:row===1?0x45be7b:0x182323,-5.6+i*.4,.13,-17.85+row*.14,wheelCourseVisual);
// Same construction surface in the yard; its far end can join a later course.
box(16,.04,16,0xbfa780,-3,.015,-28,wheelCourseVisual);
// Staging uses the same construction ground; no extra colored pad.
const carts=new Map<string,{root:THREE.Group;tray:THREE.Group;load:THREE.Group;tag:THREE.Sprite}>();
const materialMeshes:THREE.Group[]=[];
let plannedMaterials:ReturnType<typeof planSpills>=[],plannedIds:number[]=[],plannedAmounts:number[]=[];
function cachedSpillPlans(records:any){
 let changed=records.length!==plannedIds.length;
 records.forEach((b:any,i:number)=>{if(plannedIds[i]!==b.materialId||plannedAmounts[i]!==b.amount)changed=true;});
 if(changed){plannedMaterials=planSpills(records);plannedIds=Array.from(records,(b:any)=>b.materialId);plannedAmounts=Array.from(records,(b:any)=>b.amount);}
 return plannedMaterials;
}

let wheelReset=-1;
function renderWheelHud(state:any,me:any){
  if(!me)return;
  if(state.mode==='championship'){
    const gates=currentTrack(state).gates,waiting=state.racePhase==='intermission',counting=waiting||state.racePhase==='countdown';
    el('hudText').textContent='Course '+(state.leg+1)+'/'+legCount(state)+' · '+(counting?Math.ceil(state.countdown)+' · '+(waiting?'NEXT COURSE':'READY'):state.racePhase==='results'?'CHAMPIONSHIP COMPLETE':me.finishOrder?'FINISHED · shared yard':state.elapsed.toFixed(1)+'s');
    const total=[...state.standings].find((r:any)=>r.playerId===room?.sessionId);
    el('beamStatus').textContent=(me.reload>0?'Reload '+me.reload.toFixed(1)+'s':me.instability>.7?'CAREFUL — LOAD TIPPING!':me.finishOrder?'Drive in staging · next gate opens at GO':'Next: '+(gates[me.checkpoint-1]?.label??'Finish'))+' · '+me.legSpills+' racing spills'+(currentCourse(state)?'\n'+currentCourse(state)!.module.name+' · '+currentCourse(state)!.module.surfaceName:'')+(total?'\nOfficial total: '+total.spills+' spills · '+total.time.toFixed(2)+'s':'');
    el('beamStatus').style.borderLeft=me.instability>.7?'8px solid #ff6849':'8px solid #59d595';
    signalReadout.textContent=currentPresentation.compact?'':waiting?'Course scores frozen · next gate opens after the countdown':me.finishOrder?'Official score frozen · staging spills do not count':'Fewest cumulative spills wins · Combined racing time breaks ties';return;
  }
  const countdown=state.racePhase==='countdown';
  el('hudText').textContent=countdown?String(Math.ceil(state.countdown))+' • GET READY':state.racePhase==='results'?'FINAL RESULTS':me.finishOrder?'FINISHED · drive in staging':'GO • '+state.elapsed.toFixed(1)+'s';
  const warning=me.reload>0?'SPILLED! Reloading '+me.reload.toFixed(1)+'s':me.finishOrder?'Finished in '+me.finishTime.toFixed(2)+'s':me.instability>.7?'CAREFUL — LOAD TIPPING!':'Follow painted arrows • ease off before turns and rough ground';
  el('beamStatus').textContent=warning+(me.finishOrder?'':'\nRoute '+Math.min(me.checkpoint-1,WHEEL_GATES.length-1)+'/'+(WHEEL_GATES.length-1)+' checkpoints · Next: '+(WHEEL_GATES[me.checkpoint-1]?.label??'Finish line'))+'\nLoad risk '+Math.round(me.instability*100)+'% • '+(me.finishOrder?'Staging spills '+Math.max(0,me.spills-([...state.results].find((r:any)=>r.finishOrder===me.finishOrder)?.spills??me.spills)):'Spills '+me.spills)+' • Speed '+Math.round(me.speed/WHEEL_CONFIG.maxSpeed*100)+'%';
  el('beamStatus').style.borderLeft=me.instability>.7?'8px solid #ff6849':'8px solid #59d595';
  if(currentPresentation.compact){
    el('hudText').textContent=countdown?Math.ceil(state.countdown)+' · READY':me.finishOrder?'FINISHED':state.elapsed.toFixed(1)+'s';
    el('beamStatus').textContent=(me.reload>0?'Reload '+me.reload.toFixed(1)+'s':me.instability>.7?'TIPPING!':me.finishOrder?'Staging':'Next: '+(WHEEL_GATES[me.checkpoint-1]?.label??'Finish'))+' · '+me.spills+' spills · Risk '+Math.round(me.instability*100)+'%';
  }
  const results=Array.from(state.results as Iterable<any>).sort((a,b)=>a.place-b.place);
  signalReadout.textContent='FEWEST SPILLS WINS • Time breaks ties'+(results.length?'\n'+(state.racePhase==='results'?'Final ranking: ':'Provisional ranking — others still racing: ')+results.map(p=>'#'+p.place+' '+p.name+' • '+p.spills+' spills • '+p.time.toFixed(2)+'s').join(' | '):'');
}
function updateWheelVisual(state:any,dt:number,now:number){
  const active=state?.phase==='test'&&isWheel(state);wheelCourseVisual.visible=active;for(const o of baseVisuals)o.visible=!active&&!(state?.phase==='test'&&state.mode==='competitive');
  const championship=active&&state.mode==='championship';originalRopes.visible=!championship;originalScenery.visible=!championship&&!(state?.phase==='test'&&state.mode==='competitive');
  championshipWorld.update(state?.players?.get(room?.sessionId)?.z??0,state?.leg??0,championship,state?.routeIds??[]);wheelCourseVisual.visible=active&&!(championship&&state.routeIds.length);
  if(!active)el('beamStatus').style.borderLeft='';
  if(active&&wheelReset!==state.raceResets){wheelReset=state.raceResets;stopInput();for(const c of carts.values())disposeVisual(c.root);carts.clear();}
  for(const [id,c]of carts){c.root.visible=active&&!!state?.players.get(id)?.connected;if(!state?.players.has(id)){disposeVisual(c.root);carts.delete(id);}}
  while(materialMeshes.length>(active?state.material.length:0)){scene.remove(materialMeshes.pop()!);}
  if(!active)return;
  const spillPlans=cachedSpillPlans(state.material);
  state.material.forEach((b:any,i:number)=>{const plan=spillPlans[i];let visual=materialMeshes[i];
    if(!visual||visual.userData.signature!==spillSignature(plan)){
      const born=visual?.userData.born??now;if(visual)scene.remove(visual);
      visual=createSpillVisual(plan);visual.userData.born=born;scene.add(visual);materialMeshes[i]=visual;
    }
    visual.visible=state.mode!=='championship'||Math.abs(b.z-(state.players.get(room?.sessionId)?.z??b.z))<45;visual.position.set(b.x,.045,b.z);visual.rotation.y=debrisRotation(i);
    updateSpillVisual(visual,plan,(now-visual.userData.born)/1000);
  });
  state.players.forEach((p:any,id:string)=>{
    let c=carts.get(id);if(!c){
      const root=new THREE.Group(),tray=new THREE.Group(),load=new THREE.Group();root.add(tray);tray.add(load);scene.add(root);
      box(1.25,.25,1.5,colors[p.color],0,.7,1.15,tray);
      for(const x of [-.66,.66])box(.1,.45,1.5,colors[p.color],x,.95,1.15,tray);
      box(1.3,.45,.1,colors[p.color],0,.95,1.9,tray);
      for(const x of [-.5,.5])box(.08,.08,1.5,0x384956,x,.75,.3,root);
      const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.33,.33,.22,12),new THREE.MeshLambertMaterial({color:0x27343d}));wheel.rotation.z=Math.PI/2;wheel.position.set(0,.33,1.8);root.add(wheel);
      for(const x of [-.5,.5]){box(.13,.12,.38,0x263b42,x,.75,-.35,root);box(.08,.5,.08,0x526a73,x,.3,.6,root);}
      for(const x of [-.68,.68])box(.045,.055,1.55,0xd6e3dd,x,1.2,1.15,tray);
      const hub=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.25,10),new THREE.MeshLambertMaterial({color:0xf4c044}));hub.rotation.z=Math.PI/2;hub.position.set(0,.33,1.8);root.add(hub);
      createLoadVisual(load,p.materialId??6);
      const tag=label(id===room?.sessionId?'YOU':p.name,'#172d3c',1.6);tag.position.set(0,2.8,0);root.add(tag);
      c={root,tray,load,tag};carts.set(id,c);root.position.set(p.x,0,p.z);root.rotation.y=p.rotation;
    }
    c.tag.visible=!currentPresentation.compact||id===room?.sessionId||Math.hypot(p.x-(state.players.get(room?.sessionId)?.x??p.x),p.z-(state.players.get(room?.sessionId)?.z??p.z))<7;
    c.root.visible=p.connected;c.root.position.y=(state.mode==='championship'?(x:number,z:number)=>championshipRise(state,x,z):rampHeight)(p.x+Math.sin(p.rotation)*WHEEL_CONFIG.cartOffset,p.z+Math.cos(p.rotation)*WHEEL_CONFIG.cartOffset);
    const w=workers.get(id);if(w)w.visible=p.connected;
    const blend=1-Math.exp(-18*dt);c.root.position.x+=(p.x-c.root.position.x)*blend;c.root.position.z+=(p.z-c.root.position.z)*blend;c.root.rotation.y+=Math.atan2(Math.sin(p.rotation-c.root.rotation.y),Math.cos(p.rotation-c.root.rotation.y))*blend;
    if(w){w.position.x=c.root.position.x-Math.sin(c.root.rotation.y)*.7;w.position.z=c.root.position.z-Math.cos(c.root.rotation.y)*.7;w.rotation.y=c.root.rotation.y;}
    c.tray.rotation.z=p.reload>0?1.15:Math.sin(now*.016+p.color)*p.instability*.22-p.lean*p.instability*.08;
    c.load.visible=p.reload<=0;c.load.position.x=Math.sin(now*.016)*p.instability*.2;
  });
}

el('retryConnection').onclick=()=>void verifyServer();
window.addEventListener('online',()=>{if(!serverCompatible)void verifyServer();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!serverCompatible)void verifyServer();});
async function verifyServer(){
  if(verifying)return;verifying=true;
  status('Checking BREAK TIME server…');render();
  try{const response=await fetch('/health',{cache:'no-store',signal:AbortSignal.timeout(15000)});const health=await response.json();if(!response.ok||health.protocol!==PROTOCOL_VERSION||typeof health.startedAt!=='string')throw Error('The running server is an older version. Close its window with Ctrl+C, relaunch Start-BeamCrew.cmd, then refresh both browsers.');serverCompatible=true;status(BUILD_LABEL+' server ready — create or join a room.');
    try{
      const start=health.startedAt;
      const oldStart=sessionStorage.getItem(storageKey('beam-server-start'));
      if(oldStart!==start)storage('beam-token',null);
      storage('beam-server-start',start);
      const token=sessionStorage.getItem(storageKey('beam-token'));
      if(token)void reconnect(token,Number(sessionStorage.getItem(storageKey('beam-until'))),sessionStorage.getItem(storageKey('beam-public-wait'))==='1');
    }catch{}
  }
  catch(error){status(error instanceof Error?error.message:'Could not verify the server. Check Start-BeamCrew.cmd.');}
  verifying=false;render();
}
void verifyServer();

let standingsKey="";
function updateStandings(state:any){
 const active=state?.phase==='test'&&(currentPresentation.compact||state.mode==='championship');el('standings').hidden=!active;el('standings').classList.toggle('championship',state?.mode==='championship');if(!active){standingsKey='';return;}
 const key=JSON.stringify([state.mode,state.leg,state.routeSeed,state.standings,state.legResults,state.results,state.teams]);if(key===standingsKey)return;standingsKey=key;
  if(state.mode==='championship'){
   const lines:HTMLLIElement[]=[];const line=(text:string)=>{const li=document.createElement('li');li.textContent=text;lines.push(li);};
   const order=clientRoute(state);if(order.length)line('Route: '+order.map((c,i)=>(i+1)+'. '+c.module.name).join(' → '));
   line('Cumulative official standings');for(const r of [...state.standings].sort((a:any,b:any)=>a.place-b.place))line((r.place?'#'+r.place:'—')+' '+r.name+' · '+(r.dnf?'DNF · ':'')+r.spills+' spills · '+r.time.toFixed(2)+'s · '+r.completed+'/'+legCount(state));
   for(let leg=0;leg<=state.leg;leg++){const results=[...state.legResults].filter((r:any)=>r.leg===leg).sort((a:any,b:any)=>(a.place||99)-(b.place||99));if(results.length){line('Course '+(leg+1)+(clientRoute(state)[leg]?' · '+clientRoute(state)[leg].module.name:'')+' results');for(const r of results)line((r.dnf?'DNF':'#'+r.place)+' '+r.name+' · '+r.spills+' spills · '+r.time.toFixed(2)+'s');}}
   el('standingsList').replaceChildren(...lines);return;
 }
 const entries=isWheel(state)?[...state.results].sort((a:any,b:any)=>a.place-b.place):[...state.teams].sort((a:any,b:any)=>(a.place||99)-(b.place||99));
 el('standingsList').replaceChildren(...entries.map((r:any)=>{const li=document.createElement('li');li.textContent=isWheel(state)?'#'+r.place+' '+r.name+' · '+r.spills+' spills · '+r.time.toFixed(1)+'s':r.name+' · '+(r.dnf?'DNF':r.place?'#'+r.place+' · '+r.finishTime.toFixed(1)+'s':'racing');return li;}));
 if(!entries.length){const li=document.createElement('li');li.textContent='Race in progress';el('standingsList').append(li);}
}
