export const MATERIAL_CATEGORIES = [
 {name:'Sticky',effect:'Sticky slowdown',items:['Wet cement','Sand']},
 {name:'Rolling',effect:'Rolling hazard',items:['PVC pipes','Rebar']},
 {name:'Fixed',effect:'Fixed obstacle',items:['Mini barricades','Drainage hose']},
 {name:'Heavy',effect:'Pushable heavy debris',items:['Bricks','Cinder blocks']},
 {name:'Bumpy',effect:'Bumpy debris',items:['Scrap lumber','Plywood offcuts']},
 {name:'Rough',effect:'Rough spill-risk patch',items:['Gravel','Concrete rubble']},
] as const;
export const MATERIALS=MATERIAL_CATEGORIES.flatMap((c,category)=>c.items.map((name,i)=>({id:category*2+i,name,effect:c.effect,category})));
export function validMaterial(id:unknown):id is number{return Number.isInteger(id)&&Number(id)>=0&&Number(id)<12;}
export const materialCategory=(id=6)=>Math.floor(id/2);
export const MATERIAL_COLORS=[0x998b72,0xd8bc83,0xd8e4d0,0x777b83,0xffbd43,0x414c51,0xbd6549,0x99958e,0x9a7045,0xc29b67,0x8d8b82,0x727777];

// Logical load objects; used by both presentation and authoritative contacts.
export const MATERIAL_PIECE_COUNTS=[1,1,5,5,2,2,6,6,4,4,12,12] as const;
