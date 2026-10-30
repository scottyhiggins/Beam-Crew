import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['build/server/index.js'],{env:{...process.env,PORT:'2616'},stdio:'inherit'});
try{await new Promise(r=>setTimeout(r,2500));const test=spawn(process.execPath,['scripts/test-crane-live.mjs'],{stdio:'inherit'});process.exitCode=await new Promise(r=>test.on('exit',r));}finally{server.kill();}

