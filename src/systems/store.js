import { SKINS } from '../config.js';
export function buySkin(save,index) {
  const skin=SKINS[index];
  if(!Number.isInteger(index)||!skin||skin.retired)return {ok:false,reason:'Unknown skin'};
  if(save.ownedSkins.includes(index))return {ok:false,reason:'Already owned'};
  if(save.wallet<skin.price)return {ok:false,reason:'Not enough DNA'};
  save.wallet-=skin.price;save.ownedSkins.push(index);save.skin=index;
  return {ok:true};
}
export function equipSkin(save,index) {
  if(!save.ownedSkins.includes(index)||SKINS[index]?.retired)return false;
  save.skin=index;return true;
}
