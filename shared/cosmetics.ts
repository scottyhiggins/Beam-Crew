// Stable seasonal item ID in the existing numeric hat wire field.
export const PUMPKIN_HARD_HAT=0xf78b24;
export const HAT_COLORS={Yellow:0xffce36,Orange:0xf08230,Green:0x53ad57,Blue:0x3588dc,Red:0xdd4842,White:0xf4f2e9} as const;
export const VEST_COLORS={Orange:0xf08230,Yellow:0xf0d43b,Green:0x76be45,Blue:0x3588dc} as const;
export type WorkerLook={hat:number;vest:number;expression:'happy'|'serious'|'goofy'};
export const DEFAULT_WORKER_LOOK:Readonly<WorkerLook>=Object.freeze({hat:HAT_COLORS.Yellow,vest:VEST_COLORS.Orange,expression:'happy'});
/** Atomic allowlist validation: malformed or incomplete selections become the classic look. */
export function validateWorkerLook(value:unknown):WorkerLook{
 if(value&&typeof value==='object'&&!Array.isArray(value)){
  const v=value as Record<string,unknown>;
  if(typeof v.hat==='number'&&([...Object.values(HAT_COLORS),PUMPKIN_HARD_HAT] as number[]).includes(v.hat)&&typeof v.vest==='number'&&(Object.values(VEST_COLORS) as number[]).includes(v.vest)&&['happy','serious','goofy'].includes(v.expression as string))return {hat:v.hat as number,vest:v.vest as number,expression:v.expression as WorkerLook['expression']};
 }
 return {...DEFAULT_WORKER_LOOK};
}
export function workerLookKey(look:WorkerLook){return `${look.hat}/${look.vest}/${look.expression}`;}
