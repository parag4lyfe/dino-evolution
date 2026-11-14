// Distances are metres. The window opens before the old failure so players can
// react before reaching a hazard, and closes shortly after passing it.
export const COMEBACK_BEFORE = 25;
export const COMEBACK_AFTER = 12;
export const COMEBACK_DURATION = 1.2;
export function inComebackWindow(target, distance) {
  return Number.isFinite(target) && distance >= target - COMEBACK_BEFORE && distance <= target + COMEBACK_AFTER;
}
