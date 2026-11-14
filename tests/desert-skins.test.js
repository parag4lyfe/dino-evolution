import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SKINS,SKIN_STORE_ORDER} from '../src/config.js';
test('new skins have exact prices and Camel follows Cyber without shifting saved IDs',()=>{
 assert.equal(SKINS[11].name,'Habibi Dino');assert.equal(SKINS[11].price,350);
 assert.equal(SKINS[12].name,'Camel');assert.equal(SKINS[12].price,200);
 assert.equal(SKINS[13].name,'Golden Dino');assert.equal(SKINS[13].price,500);
 assert.equal(SKIN_STORE_ORDER[SKIN_STORE_ORDER.indexOf(7)+1],12);
 assert.equal(new Set(SKIN_STORE_ORDER).size,SKIN_STORE_ORDER.length);
 assert.ok(SKIN_STORE_ORDER.every(i=>SKINS[i]&&!SKINS[i].retired));
 assert.equal(SKINS[8].name,'Gandhiji Dino');
});
