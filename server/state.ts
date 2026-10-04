import { Schema, MapSchema, defineTypes } from '@colyseus/schema';
export class Player extends Schema {
  name='Worker'; color=0; x=0; z=0; rotation=0; connected=true; actions=0; signal='';
  vx=0; vz=0; inputX=0; inputZ=0; lastInput=0; lastAction=0; lastSignal=0; signalUntil=0;
}
defineTypes(Player,{name:'string',color:'number',x:'number',z:'number',rotation:'number',connected:'boolean',actions:'number',signal:'string'});
export class CrewState extends Schema { players=new MapSchema<Player>(); code=''; host=''; phase='lobby'; }
defineTypes(CrewState,{players:{map:Player},code:'string',host:'string',phase:'string'});
