import {test} from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {PROTOCOL_VERSION} from '../shared/version.js';
const run=promisify(execFile);
const endpoint=process.env.TEST_URL;
test('production server identifies its build and serves the mode selector assets',{skip:!endpoint},async()=>{
 const response=await fetch(`${endpoint}/health`);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
 const health=await response.json() as any;assert.equal(health.protocol,PROTOCOL_VERSION);assert.match(health.build,/Wheelbarrow Race/);assert.ok(health.repository);assert.ok(Number.isFinite(Date.parse(health.startedAt)));
 const page=await fetch(endpoint!);assert.equal(page.headers.get('cache-control'),'no-store');const html=await page.text();assert.match(html,/Milestone 3/);
 const asset=html.match(/src="([^"]+\.js)"/);assert.ok(asset);const script=await (await fetch(new URL(asset[1],endpoint))).text();assert.match(script,/Wheelbarrow Race/);assert.match(script,/id="mode"/);assert.match(script,/value="wheel"/);
});
test('launcher preflight accepts an available port',async()=>{await run(process.execPath,['scripts/check-port.mjs','0']);});
test('launcher preflight identifies occupied port instead of appearing to start',async()=>{const listener=net.createServer();await new Promise<void>(resolve=>listener.listen(0,'0.0.0.0',resolve));try{const address=listener.address() as net.AddressInfo;await assert.rejects(run(process.execPath,['scripts/check-port.mjs',String(address.port)]),(error:any)=>{assert.equal(error.code,1);assert.match(error.stderr,/has NOT started/);assert.match(error.stderr,/already-running server/);return true;});}finally{await new Promise<void>(resolve=>listener.close(()=>resolve()));}});
