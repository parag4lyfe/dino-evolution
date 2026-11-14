import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MAPS,mapIndexForDistance} from '../src/systems/WorldSystem.js';
test('six worlds follow the requested distance unlocks exactly',()=>{
 assert.deepEqual(MAPS.map(m=>m.unlock),[0,500,1000,1500,2500,4000]);
 assert.equal(mapIndexForDistance(499.9),0);assert.equal(mapIndexForDistance(500),1);
 assert.equal(mapIndexForDistance(999),1);assert.equal(mapIndexForDistance(1000),2);
 assert.equal(mapIndexForDistance(1500),3);assert.equal(mapIndexForDistance(2500),4);
 assert.equal(mapIndexForDistance(4000),5);assert.equal(mapIndexForDistance(50000),5);
});
