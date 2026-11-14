import {test} from 'node:test';
import assert from 'node:assert/strict';
import {awardFirstRunBounty} from '../src/systems/bounty.js';
import {loadSave} from '../src/systems/save.js';
test('first run grants exactly 300 DNA once and keeps it claimed after loading',()=>{
 const save={wallet:12,dna:50,ownedSkins:[0],runs:1,firstRunBountyClaimed:false};
 assert.equal(awardFirstRunBounty(save),300);assert.equal(save.wallet,312);assert.equal(save.dna,350);
 assert.equal(awardFirstRunBounty(save),0);assert.equal(save.wallet,312);
 const restored=loadSave({getItem:()=>JSON.stringify(save)});
 assert.equal(restored.firstRunBountyClaimed,true);assert.equal(awardFirstRunBounty(restored),0);
});
test('old testers without the feature get one bounty on their next completed run',()=>{
 const save=loadSave({getItem:()=>JSON.stringify({wallet:40,dna:200,runs:10,ownedSkins:[0],storeVersion:2})});
 assert.equal(awardFirstRunBounty(save),300);assert.equal(save.wallet,340);
});
