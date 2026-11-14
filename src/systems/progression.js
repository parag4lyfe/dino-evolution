export const UPGRADES = [
  { id: 'dash', name: 'Electric Dash', icon: 'ϟ', rarity: 'RARE', description: 'For 16 seconds, X bursts through hazards. Six-second recharge between bursts.', benefit: '16s power · X / DASH' },
  { id: 'phoenix', name: 'Phoenix Heart', icon: '♨', rarity: 'EPIC', description: 'For 22 seconds, your next fatal hit becomes a fiery revival. Consumed on use.', benefit: '22s window · one revival' },
  { id: 'armour', name: 'Armoured Skin', icon: '◈', rarity: 'RARE', description: 'A translucent shield absorbs one collision. Expires in 20 seconds; cannot save a fall.', benefit: '20s window · one protective shell' },
  { id: 'double', name: 'Double Jump', icon: '↑↑', rarity: 'RARE', description: 'For 18 seconds, jump once more in midair. A ripple marks your second leap.', benefit: '18s power · one airborne jump' },
  { id: 'magnet', name: 'Magnetic DNA', icon: '◎', rarity: 'COMMON', description: 'For 16 seconds, nearby DNA streams toward you. Follow the soft magnetic pulse.', benefit: '16s power · 180px attraction' },
  { id: 'spring', name: 'Spring Legs', icon: '↟', rarity: 'COMMON', description: 'For 18 seconds, leap higher. Hold to soar; release for a short hop.', benefit: '18s power · +15% jump strength' },
];
export function nextLevelXP(level) { return Math.min(65, 25 + (level - 1) * 10); }
export function upgradeChoices(owned, random = Math.random) {
  const pool = UPGRADES.filter(item => !owned.includes(item.id));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}
// A baseline jump lasts ~0.73 s. Spacing is deliberately longer than a full
// jump plus reaction time, and never depends on owning an upgrade.
export { hazardInterval as spawnInterval } from './difficulty.js';
export function freshRun() {
  return { distance: 0, dna: 0, xp: 0, level: 1, upgrades: [], history: [], passed: 0 };
}
