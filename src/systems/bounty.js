export const FIRST_RUN_BOUNTY=300;
export function awardFirstRunBounty(save) {
  if(save.firstRunBountyClaimed)return 0;
  save.firstRunBountyClaimed=true;
  save.wallet+=FIRST_RUN_BOUNTY;
  save.dna+=FIRST_RUN_BOUNTY;
  return FIRST_RUN_BOUNTY;
}
