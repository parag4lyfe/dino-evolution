import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inComebackWindow} from '../src/systems/comeback.js';
test('comeback window opens before last failure and closes soon after it',()=>{
 assert.equal(inComebackWindow(null,0),false);
 assert.equal(inComebackWindow(100,74),false);
 assert.equal(inComebackWindow(100,75),true);
 assert.equal(inComebackWindow(100,112),true);
 assert.equal(inComebackWindow(100,113),false);
 assert.equal(inComebackWindow(0,0),true);
});
