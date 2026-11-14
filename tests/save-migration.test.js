import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadSave,writeSave} from '../src/systems/save.js';
test('retired Phoenix purchase is refunded once without shifting other IDs',()=>{
 const original={wallet:25,dna:900,skin:4,ownedSkins:[0,4,8,9,10]};
 const save=loadSave({getItem:()=>JSON.stringify(original)});
 assert.equal(save.wallet,325);assert.equal(save.skin,0);assert.deepEqual(save.ownedSkins,[0,8,9,10]);
 const next=loadSave({getItem:()=>JSON.stringify(save)});assert.equal(next.wallet,325);
});
test('corrupt primary save recovers its backup',()=>{
 const storage=new Map([['dino-evolution-v1','broken'],['dino-evolution-v1-backup',JSON.stringify({wallet:50,ownedSkins:[0,5],skin:5,storeVersion:2})]]);
 const save=loadSave({getItem:key=>storage.get(key)});assert.equal(save.wallet,50);assert.equal(save.skin,5);
 assert.equal(writeSave(save,{setItem(){throw new Error('blocked');}}),false);
});
