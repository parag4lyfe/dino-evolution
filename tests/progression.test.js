import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freshRun, upgradeChoices, spawnInterval, nextLevelXP } from '../src/systems/progression.js';
import { loadSave, writeSave } from '../src/systems/save.js';
test('respawns do not share temporary upgrades', () => {
  const first = freshRun(); first.upgrades.push('double'); first.dna = 20;
  assert.deepEqual(freshRun().upgrades, []); assert.equal(freshRun().dna, 0);
});
test('choices exclude owned mutations and contain no duplicates', () => {
  const choices = upgradeChoices(['double'], () => 0.5);
  assert.equal(choices.length, 3); assert.equal(new Set(choices.map(u => u.id)).size, 3);
  assert.ok(choices.every(u => u.id !== 'double'));
  assert.deepEqual(upgradeChoices(['double','armour','magnet','spring','dash','phoenix']), []);
});
test('hazard spacing leaves a baseline full jump and reaction margin', () => {
  for (let speed = 300; speed <= 510; speed += 10) assert.ok(spawnInterval(speed, () => 0) > 1.2);
  assert.ok(nextLevelXP(3) > nextLevelXP(2));
});
test('corrupt and unavailable storage do not prevent playing', () => {
  assert.equal(loadSave({ getItem: () => '{bad' }).best, 0);
  assert.equal(loadSave({ getItem: () => JSON.stringify({best:-50, dna:'999', skin:900}) }).skin, 0);
  assert.equal(writeSave({}, { setItem() { throw new Error('blocked'); } }), false);
});
