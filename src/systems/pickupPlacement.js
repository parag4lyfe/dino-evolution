export const DNA_RADIUS=16;
export function pickupClear(x,y,hazards,gaps,margin=24) {
  for(const h of hazards) {
    if(x+DNA_RADIUS+margin>h.left && x-DNA_RADIUS-margin<h.right &&
       y+DNA_RADIUS+margin>h.top && y-DNA_RADIUS-margin<h.bottom)return false;
  }
  // Never put a pickup above a pit where it could lure someone into a fall.
  return !gaps.some(gap=>x+DNA_RADIUS+margin>gap.x && x-DNA_RADIUS-margin<gap.x+gap.width);
}
