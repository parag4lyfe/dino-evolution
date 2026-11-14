import { SKINS } from '../config.js';
const KEY = 'dino-evolution-v1';
const defaults = () => ({ best: 0, dna: 0, runs: 0, skin: 0, sound: false, wallet: 0, ownedSkins: [0], resume: null, storeVersion: 2, firstRunBountyClaimed: false });
let cached=null, database=null;
function normalize(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const data = defaults();
    for (const key of ['best', 'dna', 'runs']) {
      if (Number.isFinite(raw[key]) && raw[key] >= 0) data[key] = Math.floor(raw[key]);
    }
    // Migrate the old lifetime-unlock save without taking earned skins away.
    if(!Array.isArray(raw.ownedSkins)) {
      data.wallet=data.dna;
      const oldPrices=[0,25,75,150,300,100,175,250,200,200,200];
      data.ownedSkins=SKINS.map((s,i)=>!s.retired&&oldPrices[i]<=data.dna?i:null).filter(i=>i!==null);
    } else {
      data.wallet=Number.isFinite(raw.wallet)&&raw.wallet>=0?Math.floor(raw.wallet):0;
      data.ownedSkins=[...new Set([0,...raw.ownedSkins.filter(i=>Number.isInteger(i)&&i>=0&&i<SKINS.length)])];
    }
    if(data.ownedSkins.includes(4)) {
      data.ownedSkins=data.ownedSkins.filter(i=>i!==4);
      if(raw.storeVersion!==2)data.wallet+=300;
    }
    if (data.ownedSkins.includes(raw.skin)) data.skin = raw.skin;
    data.sound = raw.sound === true;
    data.firstRunBountyClaimed=raw.firstRunBountyClaimed===true;
    data.lastCrash=Number.isFinite(raw.lastCrash)&&raw.lastCrash>=0?raw.lastCrash:null;
    data.pendingComeback=raw.pendingComeback===true;
    data.savedAt=Number.isFinite(raw.savedAt)?raw.savedAt:0;
    const r=raw.resume;
    if(r&&Number.isFinite(r.distance)&&r.distance>=0&&Number.isInteger(r.level)&&r.level>=1&&Number.isFinite(r.dna)&&r.dna>=0&&Number.isFinite(r.xp)&&r.xp>=0) {
      data.resume={...r,history:Array.isArray(r.history)?r.history.filter(x=>typeof x==='string'):[],powers:r.powers&&typeof r.powers==='object'?r.powers:{}};
    }
    return data;
}
function readLocal(storage) {
  const choices=[];
  for(const key of [KEY,KEY+'-backup'])try{const data=normalize(JSON.parse(storage.getItem(key)));if(data)choices.push(data);}catch{}
  return choices.sort((a,b)=>b.savedAt-a.savedAt)[0]||null;
}
export function loadSave(storage) {
  if(storage===undefined&&cached)return structuredClone(cached);
  try { return readLocal(storage??globalThis.localStorage)||defaults(); }
  catch { return defaults(); }
}
export async function restoreSave() {
  let current=loadSave();
  try {
    database=await new Promise((resolve,reject)=>{
      const request=indexedDB.open('dino-evolution-progress',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('saves');
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(new Error('Storage blocked'));
    });
    const backup=await new Promise((resolve,reject)=>{
      const request=database.transaction('saves').objectStore('saves').get(KEY);
      request.onsuccess=()=>resolve(normalize(request.result));request.onerror=()=>reject(request.error);
    });
    if(backup&&backup.savedAt>=(current.savedAt||0))current=backup;
  }catch{ /* localStorage remains available when IndexedDB is restricted. */ }
  cached=current;writeSave(current);return current;
}
export function writeSave(data, storage) {
  data.savedAt=Date.now();data.storeVersion=2;
  const copy=structuredClone(data);let ok=false;
  try{
    const target=storage??globalThis.localStorage,encoded=JSON.stringify(copy);
    target.setItem(KEY,encoded);ok=true;
    try{target.setItem(KEY+'-backup',encoded);}catch{}
  }catch{}
  if(storage===undefined){
    cached=copy;
    if(database)try{database.transaction('saves','readwrite').objectStore('saves').put(copy,KEY);ok=true;}catch{}
  }
  return ok;
}
