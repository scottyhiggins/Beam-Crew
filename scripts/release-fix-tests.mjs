import {spawn} from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
// Each test file gets a fresh public matchmaking pool. Capacity tests must not
// consume the rooms used by other lifecycle tests running concurrently.
const names=new Set(['crane','m31-physics','derby','derby-network','m22-integration-network','beam','beam-multiplayer','beam-chaos','beam-chaos-network','m27-beam-expansion-network','qa-beam-replay-network','reconnect','reconnect-network','party','party-network','m29-party-course','schema','startup','quick-match-network','cosmetics']);const files=fs.readdirSync('build/tests').filter(p=>names.has(p.replace('.test.js',''))).sort();
const output=process.env.QA_OUTPUT||'qa/release-fix/focused';fs.mkdirSync(output,{recursive:true});
const results=[];let next=0;
async function run(file){
 const probe=net.createServer();await new Promise((r,j)=>{probe.once('error',j);probe.listen(0,'127.0.0.1',r);});const port=probe.address().port;await new Promise(r=>probe.close(r));
 const endpoint='http://127.0.0.1:'+port,env={...process.env,NODE_ENV:'production',PORT:String(port),TEST_URL:endpoint};
 const server=spawn(process.execPath,['build/server/index.js'],{env,stdio:['ignore','ignore','pipe']});let errors='';server.stderr.on('data',b=>errors+=b);
 let tests;
 try{
  let ready=false;for(let i=0;i<150;i++){if(server.exitCode!==null)throw Error('Server exited '+errors);try{ready=(await fetch(endpoint+'/health')).ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('Server not ready '+errors);
  let log='';tests=spawn(process.execPath,['--test','--test-reporter=tap','build/tests/'+file],{env,stdio:['ignore','pipe','pipe']});tests.stdout.on('data',b=>log+=b);tests.stderr.on('data',b=>log+=b);
  const code=await new Promise((r,j)=>{tests.once('error',j);tests.once('exit',r);});fs.writeFileSync(output+'/'+file+'.tap',log);
  const count=k=>Number(log.match(new RegExp('^# '+k+' (\\d+)','m'))?.[1]??0);
  const result={file,code,tests:count('tests'),passed:count('pass'),failed:count('fail'),skipped:count('skipped')};results.push(result);console.log(JSON.stringify(result));
 }finally{if(tests?.exitCode===null)tests.kill();server.kill();}
}
await Promise.all(Array.from({length:4},async()=>{while(next<files.length){const file=files[next++];try{await run(file);}catch(e){results.push({file,code:1,tests:0,passed:0,failed:1,skipped:0,error:String(e)});console.error(file,e);}}}));
const summary={files:results.length,tests:results.reduce((n,r)=>n+r.tests,0),passed:results.reduce((n,r)=>n+r.passed,0),failed:results.reduce((n,r)=>n+r.failed,0),skipped:results.reduce((n,r)=>n+r.skipped,0),results};fs.writeFileSync(output+'/summary.json',JSON.stringify(summary,null,2));console.log('FULL SUITE '+JSON.stringify({...summary,results:undefined}));process.exitCode=results.some(r=>r.code!==0||r.skipped||!r.tests)?1:0;
