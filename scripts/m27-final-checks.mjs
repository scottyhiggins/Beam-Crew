import {spawn} from 'node:child_process';import fs from 'node:fs';
const server=spawn(process.execPath,['build/server/index.js'],{env:{...process.env,NODE_ENV:'production',PORT:'2790'},stdio:['ignore','pipe','pipe']});
let log='';server.stdout.on('data',b=>log+=b);server.stderr.on('data',b=>log+=b);
try{
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:2790/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}if(!ready)throw Error(log);
 const test=spawn(process.execPath,['--test','--test-concurrency=1','build/tests/quick-match-network.test.js','build/tests/m27-beam-expansion.test.js','build/tests/beam-chaos.test.js','build/tests/presentation.test.js','build/tests/startup.test.js'],{env:{...process.env,TEST_URL:'http://127.0.0.1:2790'},stdio:['ignore','pipe','pipe']});
 let output='';test.stdout.on('data',b=>output+=b);test.stderr.on('data',b=>output+=b);const code=await new Promise(resolve=>test.on('exit',resolve));fs.writeFileSync('qa/m27/final-isolated-checks.txt',output);console.log(output.slice(-1800));process.exitCode=code;
}finally{server.kill();fs.writeFileSync('qa/m27/final-isolated-server.txt',log);}
