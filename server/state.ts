import { Schema, MapSchema, ArraySchema, defineTypes } from '@colyseus/schema';
import { createBeam } from '../shared/beam.js';
export class Player extends Schema {
  name='Worker'; color=0; x=0; z=0; rotation=0; connected=true; actions=0; signal='';
  grip=-1; feedback='';
  speed=0;instability=0;spills=0;reload=0;checkpoint=1;finishTime=0;finishOrder=0;lean=0;
  vx=0; vz=0; inputX=0; inputZ=0; lastInput=0; lastAction=0; lastSignal=0; signalUntil=0; feedbackUntil=0;
}
defineTypes(Player,{name:'string',color:'number',x:'number',z:'number',rotation:'number',connected:'boolean',actions:'number',signal:'string',grip:'number',feedback:'string',speed:'number',instability:'number',spills:'number',reload:'number',checkpoint:'number',finishTime:'number',finishOrder:'number',lean:'number'});
export class Beam extends Schema {
  x=0;z=0;angle=0;leftHeight=0;rightHeight=0;leftSupported=false;rightSupported=false;
  checkpoint=false;delivered=false;blocked=false; resets=0;
  vx=0;vz=0;angularVelocity=0;deliveryTime=0;
  constructor(){super();Object.assign(this,createBeam());}
}
defineTypes(Beam,{x:'number',z:'number',angle:'number',leftHeight:'number',rightHeight:'number',leftSupported:'boolean',rightSupported:'boolean',checkpoint:'boolean',delivered:'boolean',blocked:'boolean',resets:'number'});
export class RaceResult extends Schema {name='';color=0;spills=0;time=0;place=0;}
defineTypes(RaceResult,{name:'string',color:'number',spills:'number',time:'number',place:'number'});
export class CrewState extends Schema {players=new MapSchema<Player>();beam=new Beam();code='';host='';phase='lobby';mode='beam';racePhase='waiting';countdown=0;elapsed=0;raceResets=0;finishCount=0;results=new ArraySchema<RaceResult>();}
defineTypes(CrewState,{players:{map:Player},beam:Beam,code:'string',host:'string',phase:'string',mode:'string',racePhase:'string',countdown:'number',elapsed:'number',raceResets:'number',results:[RaceResult]});
