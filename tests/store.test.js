import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buySkin,equipSkin} from '../src/systems/store.js';
import {loadSave} from '../src/systems/save.js';
test('buying deducts once; owned skins equip for free',()=>{
 const save={wallet:100,ownedSkins:[0],skin:0};
 assert.equal(buySkin(save,1).ok,true);assert.equal(save.wallet,80);
 assert.equal(buySkin(save,1).ok,false);assert.equal(save.wallet,80);
 assert.equal(equipSkin(save,0),true);assert.equal(save.wallet,80);
 assert.equal(buySkin(save,4).ok,false);assert.equal(equipSkin(save,4),false);
});
test('existing saves keep earned DNA and previously unlocked skins',()=>{
 const legacy=loadSave({getItem:()=>JSON.stringify({dna:80,skin:2,best:100})});
 assert.equal(legacy.wallet,80);assert.deepEqual(legacy.ownedSkins,[0,1,2]);assert.equal(legacy.skin,2);
 const modern=loadSave({getItem:()=>JSON.stringify({...legacy,wallet:5})});
 assert.equal(modern.wallet,5);assert.equal(modern.skin,2);
});
