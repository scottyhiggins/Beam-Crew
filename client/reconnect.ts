// A transport promise may never settle (offline Safari). Race it against both
// the real reservation deadline and cancellation; release any late success.
export const RESERVATION_MS=29000;
export function reservationValid(until:number,now=Date.now()){return Number.isFinite(until)&&until>now&&until<=now+RESERVATION_MS+1000;}
export class ReconnectRun<T extends {leave:()=>unknown}> {
 private controller=new AbortController();
 cancel(){this.controller.abort();}
 async run(until:number,attempt:()=>Promise<T>,status:(seconds:number)=>void):Promise<T|null>{
  const signal=this.controller.signal;
  while(!signal.aborted&&reservationValid(until)){
   status(Math.ceil((until-Date.now())/1000));
   const pending=attempt();
   // Always observe late resolutions, including after Cancel or expiry.
   const guarded=pending.then(value=>{if(signal.aborted||Date.now()>=until){void Promise.resolve(value.leave()).catch(()=>{});return null;}return value;});
   try{
    const value=await new Promise<T|null>((resolve,reject)=>{
     const finish=(value:T|null,error?:unknown)=>{clearTimeout(timer);signal.removeEventListener('abort',cancel);error?reject(error):resolve(value);};
     const cancel=()=>finish(null);
     const timer=setTimeout(()=>finish(null),Math.max(0,until-Date.now()));
     signal.addEventListener('abort',cancel,{once:true});
     guarded.then(value=>finish(value),error=>finish(null,error));
    });
    if(value)return value;
    return null;
   }catch(error){
    // Colyseus reservation/room errors are final. Network errors can retry.
    const code=Number((error as {code?:number})?.code);
    if([4212,4214,4216].includes(code)||/expired|not found|invalid.*token/i.test(String((error as Error)?.message)))return null;
    await new Promise<void>(resolve=>{const done=()=>{clearTimeout(timer);signal.removeEventListener('abort',done);resolve();};const timer=setTimeout(done,Math.min(1000,Math.max(0,until-Date.now())));signal.addEventListener('abort',done,{once:true});if(signal.aborted)done();});
   }
  }
  return null;
 }
}
