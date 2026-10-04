export const CONFIG = { speed: 4, acceleration: 22, tickRate: 30, halfSize: 10, playerRadius: .45, reconnectSeconds: 30, maxPlayers: 8 };
export type Motion = { x:number; z:number; rotation:number; vx:number; vz:number };
export function movement(p:Motion, x:number, z:number, dt:number) {
  const length = Math.hypot(x,z); if(length>1){x/=length;z/=length;}
  const step = CONFIG.acceleration*dt;
  p.vx += Math.max(-step,Math.min(step,x*CONFIG.speed-p.vx));
  p.vz += Math.max(-step,Math.min(step,z*CONFIG.speed-p.vz));
  const edge = CONFIG.halfSize-CONFIG.playerRadius;
  p.x=Math.max(-edge,Math.min(edge,p.x+p.vx*dt));
  p.z=Math.max(-edge,Math.min(edge,p.z+p.vz*dt));
  if(Math.hypot(p.vx,p.vz)>.1)p.rotation=Math.atan2(p.vx,p.vz);
}
