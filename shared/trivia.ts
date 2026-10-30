export type TriviaPhase='lobby'|'question'|'reveal'|'podium';
export interface TriviaView {
 code:string;host:string;phase:TriviaPhase;count:number;round:number;remaining:number;epoch:number;
 players:{id:string;name:string;connected:boolean;team:number}[];
 teams:{name:string;members:string[];score:number;time:number;answered:boolean;correct?:boolean;choice?:string}[];
 role?:'reader'|'selector';partner?:string;category?:string;question?:string;answers?:string[];correct?:string;submitted?:boolean;
}
