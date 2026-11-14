import {test} from 'node:test';
import assert from 'node:assert/strict';
import {POWER_DURATION,expiredPowers,remainingPower} from '../src/systems/powers.js';
test('temporary powers expire on the active-play clock',()=>{
 assert.equal(remainingPower(20,12),8);assert.equal(remainingPower(20,25),0);
 assert.deepEqual(expiredPowers({dash:16,phoenix:22},17),['dash']);
 assert.ok(Object.values(POWER_DURATION).every(seconds=>seconds>=16&&seconds<=22));
});
