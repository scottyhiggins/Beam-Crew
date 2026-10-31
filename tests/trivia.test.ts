import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TriviaGame} from '../server/trivia-game.js';
import {QUESTIONS} from '../server/trivia-questions.js';
function game(n=2){const g=new TriviaGame();for(let i=0;i<n;i++)assert.ok(g.add('p'+i,'Worker '+i));return g;}
test('original question bank: six categories and four distinct choices without duplicate questions',()=>{assert.ok(QUESTIONS.length>=40);assert.equal(new Set(QUESTIONS.map(q=>q.category)).size,6);assert.equal(new Set(QUESTIONS.map(q=>q.question)).size,QUESTIONS.length);for(const q of QUESTIONS)assert.equal(new Set(q.answers).size,4);});
for(let n=2;n<=8;n++)for(const count of [5,10,15])test(`${n} individual workers: ${count} unique questions, shared choices, simultaneous answers, tied podium and replay`,()=>{
 const g=game(n);g.configure('p0',count);assert.ok(g.start('p0',1000));assert.equal(new Set(g.deck.map(q=>q.id)).size,count);let now=1000;
 for(let round=0;round<count;round++){
  const v=g.view('p0',now);assert.ok(v.question);assert.equal(v.answers?.length,4);assert.equal(v.correct,undefined);
  for(let i=0;i<n;i++){const id='p'+i,other=g.view(id,now);assert.equal(other.question,v.question);assert.deepEqual(other.answers,v.answers);assert.equal(other.remaining,v.remaining);assert.ok(g.answer(id,{choice:g.order.indexOf(0),epoch:g.epoch},now+100));assert.equal(g.answer(id,{choice:g.order.indexOf(1),epoch:g.epoch},now+100),false);}
  assert.equal(g.phase,'reveal');assert.equal(g.view('p0',now+100).correct,g.deck[round].answers[0]);g.reveal(now+200);assert.ok([...g.scores.values()].every(p=>p.score===(round+1)*1000));now+=4100;g.tick(now);
 }
 assert.equal(g.phase,'podium');assert.ok(g.ranking().every(p=>p.score===count*1000&&p.time===count*100));assert.equal(g.lobby('p1'),false);assert.ok(g.lobby('p0'));assert.ok(g.start('p0',now));assert.ok(g.ranking().every(p=>p.score===0));
});
test('server validates limits, counts, host, epochs, one answer, membership and deadline',()=>{
 const solo=game(1);assert.equal(solo.start('p0',0),false);const g=game(8);assert.equal(g.add('extra','Extra'),false);g.configure('p1',5);g.configure('p0',6);assert.equal(g.count,10);g.configure('p0',5);assert.equal(g.start('p1',0),false);assert.ok(g.start('p0',1000));
 for(const choice of [-1,4,1.5,'1',null,{},NaN])assert.equal(g.answer('p1',{choice,epoch:g.epoch},1500),false);
 assert.equal(g.answer('p1',{choice:0,epoch:g.epoch-1},1500),false);assert.equal(g.answer('intruder',{choice:0,epoch:g.epoch},1500),false);assert.ok(g.answer('p1',{choice:g.order.indexOf(1),epoch:g.epoch},1500));assert.equal(g.answer('p1',{choice:g.order.indexOf(0),epoch:g.epoch},1501),false);
 assert.equal(g.answer('p0',{choice:g.order.indexOf(0),epoch:g.epoch},21000),false);assert.equal(g.phase,'reveal');assert.ok(g.ranking().every(p=>p.score===0));assert.equal(g.view('p0',21000).standings.find(p=>p.id==='p0')?.choice,'Timed out');g.tick(25000);assert.equal(g.phase,'question');
});
test('correct response time breaks score ties; wrong answers add no time; no early correctness leaks',()=>{
 const g=game(3);g.start('p0',0);g.answer('p0',{choice:g.order.indexOf(0),epoch:g.epoch},800);g.answer('p1',{choice:g.order.indexOf(0),epoch:g.epoch},200);
 const hidden=g.view('p2',800);assert.ok(hidden.standings.every(p=>p.score===0&&p.time===0&&p.correct===undefined&&p.choice===undefined));assert.equal(g.view('outsider',800).question,undefined);
 g.answer('p2',{choice:g.order.indexOf(1),epoch:g.epoch},900);assert.deepEqual(g.ranking().map(p=>p.id),['p1','p0','p2']);assert.equal(g.scores.get('p2')!.time,0);g.tick(4900);assert.ok(g.view('p0',4900).standings.every(p=>p.correct===undefined&&p.choice===undefined));
});
test('disconnect/reconnect preserves locked answer, score and identity; host transfers and expired workers remain ranked',()=>{
 const g=game(3);g.start('p0',0);g.answer('p1',{choice:g.order.indexOf(0),epoch:g.epoch},100);g.disconnect('p0');assert.equal(g.host,'p1');g.disconnect('p1');assert.equal(g.host,'p2');assert.equal(g.answer('p1',{choice:0,epoch:g.epoch},200),false);g.reconnect('p1');assert.equal(g.view('p1',200).submitted,true);assert.equal(g.host,'p2');g.disconnect('p0',true);g.tick(20000);assert.equal(g.scores.get('p1')!.score,1000);assert.equal(g.ranking().length,3);for(let i=0;i<9;i++){g.tick(g.deadline);g.tick(g.deadline);}g.tick(g.deadline);assert.equal(g.phase,'podium');g.lobby('p2');assert.equal(g.start('p2',300000),true);
});
test('reconnect reservation prevents start until connected, then odd roster starts',()=>{const g=game(3);g.disconnect('p1');assert.equal(g.start('p0',0),false);g.reconnect('p1');assert.ok(g.start('p0',0));});
