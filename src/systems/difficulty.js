import { START_SPEED, MAX_SPEED } from '../config.js';
// Smooth acceleration continues through all six worlds instead of hitting the
// old speed cap before the third world. No sudden jump at map boundaries.
export function speedAtDistance(distance) {
  return START_SPEED + (MAX_SPEED - START_SPEED) * (1 - Math.exp(-Math.max(0,distance)/2400));
}
export function hazardInterval(speed, random=Math.random) {
  const progress=Math.max(0,Math.min(1,(speed-START_SPEED)/(MAX_SPEED-START_SPEED)));
  // A full basic jump takes 0.73s; even the fastest cadence leaves recovery time.
  return 1.9-progress*.75+random()*(.4-progress*.15);
}
