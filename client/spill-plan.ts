import {MATERIAL_PIECE_COUNTS} from './load-visual.js';
import {WHEEL_CONFIG} from '../shared/wheelbarrow.js';

export type HazardRecord={materialId?:number;amount:number};
export type SpillPlan={id:number;pieces:number;offset:number;volume:number};

// Each of the six unchanged server hazards contributes 1/6 of a load.
// Carry fractional objects across records, including aggregation at the cap.
export function planSpills(records:Iterable<HazardRecord>):SpillPlan[]{
 const units=Array<number>(12).fill(0);
 return Array.from(records,b=>{
  const id=b.materialId??6,count=MATERIAL_PIECE_COUNTS[id],before=units[id];
  units[id]+=b.amount;
  const first=Math.floor(before*count/WHEEL_CONFIG.bricksPerSpill);
  const end=Math.floor(units[id]*count/WHEEL_CONFIG.bricksPerSpill);
  return {id,pieces:id<2?1:end-first,offset:first%count,volume:b.amount/WHEEL_CONFIG.bricksPerSpill};
 });
}
