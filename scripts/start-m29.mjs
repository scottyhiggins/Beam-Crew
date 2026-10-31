import {spawn} from 'node:child_process';
import net from 'node:net';
const dev=process.argv.includes('--dev');
for(const port of dev?[2729,5229]:[2729])await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',()=>reject(Error(`Milestone 29 port ${port} is occupied; no process was stopped.`)));s.listen(port,'127.0.0.1',()=>s.close(resolve));});
const child=spawn(process.execPath,['build/server/index.js'],{stdio:'inherit',env:{...process.env,PORT:'2729',NODE_ENV:dev?'development':'production'}});child.on('exit',code=>process.exitCode=code??1);for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
