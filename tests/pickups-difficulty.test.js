import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pickupClear} from '../src/systems/pickupPlacement.js';
import {speedAtDistance,hazardInterval} from '../src/systems/difficulty.js';
test('pickups maintain clearance from hazards and gaps',()=>{
 const hazards=[{left:400,right:450,top:388,bottom:448}];
 assert.equal(pickupClear(425,420,hazards,[]),false);
 assert.equal(pickupClear(425,338,hazards,[]),true);
 assert.equal(pickupClear(375,420,hazards,[]),false);
 assert.equal(pickupClear(425,338,[],[{x:400,width:150}]),false);
});
test('speed and density increase across the full world route with safe limits',()=>{
 const distances=[0,500,1000,1500,2500,4000,8000,20000];
 for(let i=1;i<distances.length;i++) {
  const before=speedAtDistance(distances[i-1]),after=speedAtDistance(distances[i]);
  assert.ok(after>before);assert.ok(after<=650);
  assert.ok(hazardInterval(after,()=>0)<hazardInterval(before,()=>0));
 }
 assert.ok(hazardInterval(650,()=>0)>=1.15);
 assert.equal(speedAtDistance(-100),300);
});
