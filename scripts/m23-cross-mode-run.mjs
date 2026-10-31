// Reuse the #22 cross-mode browser checks on isolated #23 ports.
import {spawn} from 'node:child_process';import fs from 'node:fs';
const children=[];fs.mkdirSync('qa/m23/cross-mode',{recursive:true});
const env={...process.env,PLAYWRIGHT_PACKAGE:'C:/Users/higgi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json',QA_URL:'http://127.0.0.1:2843'};
async function start(script,extra,port){const p=spawn(process.execPath,[script],{env:{...env,...extra},stdio:['ignore','ignore','inherit']});children.push(p);for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:'+port+'/health')).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('local server unavailable');}
try{await start('build/server/index.js',{PORT:'2843',NODE_ENV:'production'},2843);await start('scripts/party-browser-fixture.mjs',{QA_PORT:'2844'},2844);
for(const name of ['m22-browser-production','m22-browser-trivia-quick','m22-browser-invites','m22-browser-party']){const source=fs.readFileSync('scripts/'+name+'.mjs','utf8').replaceAll('127.0.0.1:2722','127.0.0.1:2843').replaceAll('127.0.0.1:2723','127.0.0.1:2844').replaceAll('qa/m22','qa/m23/cross-mode');const file='scripts/.m23-'+name+'.mjs';fs.writeFileSync(file,source);console.log('RUN '+name);const child=spawn(process.execPath,[file],{env,stdio:'inherit'});children.push(child);const code=await new Promise(r=>child.on('exit',r));if(code!==0)throw Error(name+' failed '+code);}
}finally{for(const p of children)if(p.exitCode===null)p.kill();}
