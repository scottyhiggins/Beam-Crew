import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Client,type Room} from 'colyseus.js';
import {ReconnectRun,RESERVATION_MS} from '../client/reconnect.js';
const endpoint=process.env.TEST_URL;
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function until(check:()=>boolean,timeout=12000){const end=Date.now()+timeout;while(!check()){if(Date.now()>end)throw Error('Reconnect state timeout');await pause(30);}}
test('refresh/drop reconnect, host transfer, cancellation and new-room join work over real sockets',{skip:!endpoint,timeout:55000},async()=>{
 const client=new Client(endpoint!.replace(/^http/,'ws')),rooms:Room[]=[];
 try{
  let host=await client.create('crew',{name:'Reconnect host'});rooms.push(host);
  const guest=await client.joinById(host.roomId,{name:'Mobile guest'});rooms.push(guest);
  await until(()=>guest.state.players?.size===2);
  const id=host.sessionId,token=host.reconnectionToken;host.connection.close();
  await until(()=>guest.state.host===guest.sessionId&&!guest.state.players.get(id).connected);
  const resumed=await new ReconnectRun<Room>().run(Date.now()+RESERVATION_MS,()=>client.reconnect(token),()=>{});
  assert.ok(resumed);host=resumed;rooms.push(host);
  await until(()=>host.state.players?.get(id)?.connected);assert.equal(host.sessionId,id);assert.equal(guest.state.host,guest.sessionId);
  const refreshed=host.reconnectionToken;host.connection.close();
  await until(()=>!guest.state.players.get(id).connected);
  // Let the actual server reservation expire, like a backgrounded Safari tab.
  await pause(30500);await until(()=>!guest.state.players.has(id));
  assert.equal(await new ReconnectRun<Room>().run(Date.now()+1000,()=>client.reconnect(refreshed),()=>{}),null);
  const newRoom=await client.create('crew',{name:'Fresh lobby'});rooms.push(newRoom);await until(()=>newRoom.state.players?.size===1);
  const replacement=await client.joinById(guest.roomId,{name:'Replacement'});rooms.push(replacement);await until(()=>guest.state.players.size===2);
  assert.equal(guest.state.host,guest.sessionId);assert.ok(!guest.state.players.has(id));
 }finally{await Promise.allSettled(rooms.filter(r=>r.connection.isOpen).map(r=>r.leave()));}
});
