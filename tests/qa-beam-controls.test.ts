import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resetBeamActionControls} from '../client/beam-action-controls.js';
function button(){const classes=new Set(['attached']);return {textContent:'RELEASE',disabled:false,hidden:false,classList:{remove:(...tokens:string[])=>tokens.forEach(t=>classes.delete(t))},classes};}
test('QA: actual desktop and mobile control adapter clears stale RELEASE and attached styling when inactive',()=>{
 const grab=button(),action=button();resetBeamActionControls(false,grab,action);
 assert.equal(grab.textContent,'GRAB · Space');assert.equal(action.textContent,'ACTION');for(const b of [grab,action]){assert.equal(b.hidden,true);assert.equal(b.disabled,true);assert.equal(b.classes.has('attached'),false);}
});
test('QA: eligible workers regain both action buttons with neutral labels after replay/reconnect',()=>{
 const grab=button(),action=button();resetBeamActionControls(false,grab,action);resetBeamActionControls(true,grab,action);
 for(const b of [grab,action]){assert.equal(b.hidden,false);assert.equal(b.disabled,false);}assert.equal(grab.textContent,'GRAB · Space');assert.equal(action.textContent,'ACTION');
});
