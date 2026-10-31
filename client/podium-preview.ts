import {Podium} from './podium';
import {HAT_COLORS,VEST_COLORS} from '../shared/cosmetics';
import type {PodiumEntry} from '../shared/podium';
const podium=new Podium(document.getElementById('preview')!);
function draw(){const count=Number((document.getElementById('count') as HTMLSelectElement).value),tie=(document.getElementById('tie') as HTMLInputElement).checked,dnf=(document.getElementById('dnf') as HTMLInputElement).checked;
 const entries:PodiumEntry[]=Array.from({length:count},(_,i)=>({id:String(i),name:['Alex Concrete','Jo Hardhat','Sam Sawdust','Pat Overtime','Riley Rebar','Casey Clipboard','Morgan Mortar','Taylor Toolbox'][i],place:tie&&i===1?1:i+1,dnf:dnf&&i===0,detail:(i*2)+' spills · '+(42+i*3).toFixed(2)+'s',award:i===0&&!dnf?'Employee of the Month':undefined,workers:[{id:String(i),name:['Alex','Jo','Sam','Pat','Riley','Casey','Morgan','Taylor'][i],connected:!(dnf&&i===0),look:{hat:Object.values(HAT_COLORS)[i%6],vest:Object.values(VEST_COLORS)[i%4],expression:(['happy','serious','goofy'] as const)[i%3]}}]}));podium.update(entries);}
 document.querySelectorAll('input,select').forEach(el=>el.addEventListener('change',draw));document.getElementById('replay')!.onclick=()=>{podium.clear();draw();document.getElementById('replayed')!.textContent='Celebration restarted immediately.';};draw();
