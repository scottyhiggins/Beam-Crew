import {Client,ServerError} from '@colyseus/core';
import {CrewRoom,roomsByCode} from './room.js';
const publicRooms=new Set<PublicWheelRoom>();
const assignments=new Map<string,PublicWheelRoom>();
export class PublicWheelRoom extends CrewRoom {
  publicMatch=true;
  private keys=new Map<string,string>();
  onCreate(){
    if(publicRooms.size>=64)throw new ServerError(503,'Quick Match is busy. Please try again shortly.');
    super.onCreate();publicRooms.add(this);
    roomsByCode.delete(this.state.code);this.state.code='';this.state.host='';
    this.state.publicMatch=true;this.state.mode='championship';this.state.championshipLength=3;
    this.setMetadata({publicMatch:true,code:''});
    // Colyseus auto-disposes empty rooms after their outstanding seat reservations expire.
  }
  onJoin(client:Client,options:{name?:unknown;matchKey?:unknown}){
    const key=options.matchKey;
    if(typeof key!=='string'||key.length<16||key.length>128)throw new ServerError(400,'Invalid matchmaking request');
    if(assignments.has(key))throw new ServerError(409,'Already assigned to a public match');
    if(this.state.players.size>=8)throw new ServerError(409,'This public match is full');
    super.onJoin(client,options);this.state.host='';assignments.set(key,this);this.keys.set(client.sessionId,key);
  }
  async onLeave(client:Client,consented:boolean){
    if(this.state.phase==='lobby'){
      this.state.players.delete(client.sessionId);
      if(this.state.players.size<2)this.state.matchCountdown=0;
      this.release(client.sessionId);return;
    }
    await super.onLeave(client,consented);this.state.host='';
    if(!this.state.players.has(client.sessionId))this.release(client.sessionId);
  }
  private release(id:string){const key=this.keys.get(id);if(key&&assignments.get(key)===this)assignments.delete(key);this.keys.delete(id);}
  tick(dt:number){
    if(this.state.phase==='lobby'){
      const count=[...this.state.players.values()].filter(p=>p.connected).length;
      if(count<2){this.state.matchCountdown=0;return;}
      if(!this.state.matchCountdown)this.state.matchCountdown=15;
      this.state.matchCountdown=Math.max(0,this.state.matchCountdown-dt);
      if(this.state.matchCountdown<1e-8){void this.lock();this.restart(false);this.state.phase='test';this.state.matchCountdown=0;}
      return;
    }
    super.tick(dt);
  }
  onDispose(){for(const id of this.keys.keys())this.release(id);publicRooms.delete(this);if(this.state)super.onDispose();}
}
