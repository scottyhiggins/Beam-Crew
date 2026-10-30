import {spawn} from 'node:child_process';
import net from 'node:net';
const probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
const child=spawn(process.execPath,['build/server/index.js'],{env:{...process.env,NODE_ENV:'production',PORT:String(port)},stdio:['ignore','ignore','pipe']});child.stderr.on('data',b=>process.stderr.write(b));
console.log(JSON.stringify({endpoint:'http://127.0.0.1:'+port,pid:child.pid}));
const timer=setTimeout(()=>child.kill(),900000);child.on('exit',()=>{clearTimeout(timer);process.exit();});
process.on('SIGINT',()=>child.kill());process.on('SIGTERM',()=>child.kill());
