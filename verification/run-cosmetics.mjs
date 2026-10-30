import {spawn} from 'node:child_process';
import net from 'node:net';
import fs from 'node:fs';
const probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
const endpoint='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['build/server/index.js'],{env:{...process.env,NODE_ENV:'production',PORT:String(port)},stdio:['ignore','ignore','pipe']});let logs='';server.stderr.on('data',b=>logs+=b.toString());
const children=[];let exitCode=1;
try{
 const deadline=Date.now()+15000;let ready=false;while(Date.now()<deadline){if(server.exitCode!==null)throw Error('Test server exited: '+logs);try{const health=await fetch(endpoint+'/health');ready=health.ok;}catch{}if(ready)break;await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error('Test server not ready');
 const files=fs.readdirSync('build/tests').filter(p=>p==='cosmetics.test.js').map(p=>'build/tests/'+p);
 const tests=spawn(process.execPath,['--test',...files],{env:{...process.env,TEST_URL:endpoint},stdio:'inherit'});children.push(tests);
 exitCode=await new Promise(r=>{tests.on('error',e=>{console.error(e);r(1);});tests.on('exit',code=>r(code??1));});
}catch(error){console.error(error.message);}finally{for(const child of children)if(child.exitCode===null)child.kill();server.kill();}
process.exitCode=exitCode;
