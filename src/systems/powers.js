export const POWER_DURATION = { dash: 16, phoenix: 22, armour: 20, double: 18, magnet: 16, spring: 18 };
export function remainingPower(expiresAt, elapsed) { return Math.max(0, expiresAt - elapsed); }
export function expiredPowers(expiries, elapsed) {
  return Object.keys(expiries).filter(id => remainingPower(expiries[id], elapsed) === 0);
}
