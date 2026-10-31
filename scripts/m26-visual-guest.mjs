import {Client} from 'colyseus.js';
const code=process.argv[2];if(!/^[A-F0-9]{6}$/.test(code??''))throw Error('Supply local test room code');const info=await(await fetch('http://127.0.0.1:3126/api/crane/'+code)).json();const room=await new Client('ws://127.0.0.1:3126').joinById(info.roomId,{name:'QA guest'});room.onMessage('snapshot',()=>{});setTimeout(()=>room.leave(),180000);
