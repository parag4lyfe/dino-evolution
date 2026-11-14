import { buySkin, equipSkin } from './systems/store.js';
import { MAPS } from './systems/WorldSystem.js';
import { SKINS, SKIN_STORE_ORDER } from './config.js';
export class UI {
  constructor(game) { this.game = game; this.root = document.querySelector('#overlay'); }
  show(content) { this.root.innerHTML = content; this.root.classList.add('visible'); }
  hide() { this.root.classList.remove('visible'); this.root.innerHTML = ''; }
  on(id, handler) { this.root.querySelector(`#${id}`).onclick = () => { this.game.audio.play('click'); handler(); }; }
  menu() {
    const { save } = this.game;
    this.show(`<div class="menu-panel"><p class="eyebrow">A LITTLE EXTINCTION. A LOT OF POTENTIAL.</p><h2>DINO<span>EVOLUTION<span class="title-dot">.</span></span></h2><p class="menu-copy">Every run is a new experiment.<br>Collect DNA. Choose your mutations. Defy extinction.</p><div class="menu-actions">${save.resume ? `<button class="primary" id="continue">CONTINUE ${Math.floor(save.resume.distance)}m ↗</button>` : ''}<button class="primary" id="play">START EVOLVING <span>↗</span></button><button class="store-entry" id="collection"><b>SKIN STORE</b><small>◎ ${save.wallet} DNA · BUY SKINS</small></button></div><div class="menu-links"><button id="help">HOW TO PLAY</button><button id="maps">WORLD ROUTE</button></div><div class="menu-record"><span>PERSONAL BEST <b>${save.best} m</b></span><span>DNA WALLET <b>${save.wallet}</b></span></div></div><div class="specimen"><span>SPECIMEN 001</span><span>STATUS: READY TO TRY AGAIN</span></div>`);
    this.on('play', () => this.game.startRun());
    if(save.resume)this.on('continue',()=>this.game.continueSavedRun());
    this.on('collection', () => {this.previewSkin=this.game.save.skin;this.collection();});
    this.on('help', () => this.help());
    this.on('maps', () => this.maps());
  }
  maps() {
    const best=this.game.save.best;
    this.show(`<div class="dialog map-route"><p class="eyebrow">EXPLORE / BOUNCE BACK</p><h3>Six worlds. One journey.</h3><p>Every run begins in Ancient Desert. Reach each distance to enter the next world.</p><div class="route-list">${MAPS.map((map,i)=>`<div><b>${i+1}. ${map.name}</b><span>${best>=map.unlock?'UNLOCKED':map.unlock.toLocaleString()+' m'}</span></div>`).join('')}</div><button class="secondary" id="back">← MAIN MENU</button></div>`);
    this.on('back',()=>this.menu());
  }
  help() {
    this.show(`<div class="dialog"><p class="eyebrow">FIELD GUIDE / 001</p><h3>Adapt on the run.</h3><p><b>Space / ↑:</b> jump. Hold for height, release for a short hop.<br><b>↓:</b> slide under high-flying hazards.<br><b>X:</b> Electric Dash when unlocked.<br><b>C / Comeback button:</b> use your earned charge near the last crash point.<br><b>Esc:</b> pause. Use the on-screen buttons on touch devices.</p><p>Jump over grounded rocks and cacti; slide under birds. Collect DNA and clear hazards to earn XP. Levelling up never interrupts your run. Press E or tap Evolution Ready when convenient to choose one short power card. Only one evolution can be active.</p><p>Mutations grow your dino and grant 16–22 seconds of power. Watch the countdown; expired abilities can be picked again. A death earns one Comeback Charge for your next attempt. Near your last crash point, press C or tap the glowing button to shatter hazards and launch over a valley. The charge works once; its window closes after you pass the marker. Beat that distance for +5 DNA. Worlds change at 500m, 1,000m, 1,500m, 2,500m and 4,000m: jungle, volcano, tundra, cyber city and prehistoric ruins. Hold jump over jungle valleys. Aliens flash before firing: jump or slide their shots. Respawn as your original dino; keep your records and lifetime DNA for cosmetic skins.</p><button class="primary" id="back">GOT IT →</button></div>`);
    this.on('back', () => this.menu());
  }
  skinPreview(skin) {
    const color=skin.color,key=skin.art||color;
    this.previews??={};
    if(this.previews[key])return this.previews[key];
    const canvas=document.createElement('canvas');canvas.width=74;canvas.height=60;
    const context=canvas.getContext('2d');
    context.drawImage(this.game.textures.get(skin.art?skin.art+'-run0':'dino0').getSourceImage(),0,0);
    const pixels=context.getImageData(0,0,74,60),rgb=[color>>16&255,color>>8&255,color&255];
    for(let i=0;i<pixels.data.length;i+=4)for(let c=0;c<3;c++)pixels.data[i+c]=pixels.data[i+c]*rgb[c]/255;
    context.putImageData(pixels,0,0);
    return this.previews[key]=canvas.toDataURL();
  }
  collection(message='') {
    const {save}=this.game;
    const candidate=Number.isInteger(this.previewSkin)&&SKINS[this.previewSkin]&&!SKINS[this.previewSkin].retired?this.previewSkin:save.skin;
    const selectedSkin=SKINS[candidate],owned=save.ownedSkins.includes(candidate),equipped=save.skin===candidate;
    const canSelect=owned||save.wallet>=selectedSkin.price;
    const oldScroll=this.root.querySelector('.skins')?.scrollTop||0;
    this.show(`<div class="dialog collection store"><div class="store-heading"><div><p class="eyebrow">THE DNA EXCHANGE</p><h3>Choose your dinosaur.</h3></div><span class="wallet">◎ ${save.wallet} DNA</span></div><p class="store-intro">Tap a skin to preview it. Select to equip, then Done.</p><div class="skins" role="group" aria-label="Skin previews">${SKIN_STORE_ORDER.map(i=>{
      const skin=SKINS[i];
      if(skin.retired)return '';
      const isOwned=save.ownedSkins.includes(i),isEquipped=save.skin===i;
      return `<button class="skin ${candidate===i?'selected':''} ${isOwned?'owned':''}" id="skin-${i}" aria-pressed="${candidate===i}"><img class="skin-preview" src="${this.skinPreview(skin)}" alt="${skin.name} dinosaur"><b>${skin.name}</b><span class="skin-price">${isOwned?'OWNED':skin.price+' DNA'}</span><small>${isEquipped?'✓ EQUIPPED':candidate===i?'PREVIEWING':'PREVIEW'}</small></button>`;
    }).join('')}</div><div class="store-actions"><div class="selection-info"><b>${selectedSkin.name}</b><span class="store-message" role="status">${message||(equipped?'Currently equipped':owned?'Owned · select to equip':canSelect?'Cosmetic skin · '+selectedSkin.price+' DNA':'Need '+(selectedSkin.price-save.wallet)+' more DNA')}</span></div><button id="select-skin" class="primary" ${!canSelect||equipped?'disabled':''}>${equipped?'✓ SELECTED':owned?'SELECT':'BUY & SELECT · '+selectedSkin.price}</button><button id="done-skins" class="secondary">DONE ✓</button></div></div>`);
    this.root.querySelector('.skins').scrollTop=oldScroll;
    SKINS.forEach((skin,i)=>{
      if(skin.retired)return;
      this.on(`skin-${i}`,()=>{this.previewSkin=i;this.collection();});
    });
    this.on('select-skin',()=>{
      if(!canSelect||equipped)return;
      if(owned) {
        if(!equipSkin(save,candidate))return;
      } else {
        const result=buySkin(save,candidate);
        if(!result.ok){this.collection(result.reason);return;}
        this.game.audio.play('evolve');
      }
      const saved=this.game.persist();this.game.dino.setSkin(candidate);
      this.collection(saved?'Selected · ready to play':'Selected for this session; browser storage is unavailable.');
    });
    this.on('done-skins',()=>{this.previewSkin=undefined;this.menu();});
  }
  upgrades(choices) {
    const summaries={dash:'16s · X to dash',phoenix:'22s · one revival',armour:'20s · block one hit',double:'18s · jump twice',magnet:'16s · attract DNA',spring:'18s · jump higher'};
    this.show(`<div class="evolution quick-evolution"><div class="quick-heading"><b>Pick one power</b><button id="skip-evolution">SKIP / KEEP RUNNING →</button></div><div class="cards">${choices.map((u,i)=>`<button class="upgrade ${u.rarity.toLowerCase()}" id="upgrade-${i}"><span class="upgrade-icon">${u.icon}</span><b>${u.name}</b><span class="benefit">${summaries[u.id]}</span><small>${i+1} · SELECT</small></button>`).join('')}</div><small>ONE ACTIVE POWER · EXPIRES AUTOMATICALLY</small></div>`);
    choices.forEach((u,i)=>this.on(`upgrade-${i}`,()=>this.game.chooseUpgrade(u.id)));
    this.on('skip-evolution',()=>this.game.skipEvolution());
  }
  pause() {
    this.show('<div class="dialog compact"><p class="eyebrow">TAKE A BREATHER</p><h3>Evolution can wait.</h3><p>Your run is paused.</p><button class="primary" id="resume">KEEP RUNNING →</button><button class="secondary" id="quit">END RUN & SAVE DNA</button></div>');
    this.on('resume', () => this.game.resumeRun());
    this.on('quit', () => this.game.endRun());
  }
  gameOver(previousBest) {
    const { run, save } = this.game;
    const distance = Math.floor(run.distance);
    this.show(`<div class="dialog results"><p class="eyebrow">${distance > previousBest ? 'A NEW PERSONAL BEST' : 'EXTINCTION IS TEMPORARY'}</p><h3>Another chance to evolve.</h3><div class="result-distance">${distance}<small>METRES</small></div>${run.bountyAwarded ? `<div class="bounty-reward" role="status"><span class="bounty-icon">✦</span><div><b>FIRST RUN BOUNTY · +${run.bountyAwarded} DNA</b><small>Added to your wallet. Pick your first new look!</small></div><button id="bounty-store" class="secondary">OPEN STORE →</button></div>` : ''}<div class="stats"><span>DNA COLLECTED<b>+${run.dna}</b></span><span>LEVEL REACHED<b>${run.level}</b></span><span>PERSONAL BEST<b>${save.best} m</b></span></div><p class="mutations">${run.history.length ? run.history.map(id => this.game.upgradeName(id)).join(' · ') : 'No mutations this time. Your next experiment awaits.'}</p>${this.game.pendingComeback ? '<p class="comeback-earned">↻ COMEBACK CHARGE EARNED · Next run: press C near your last limit.</p>' : ''}<button class="primary" id="retry">RESPAWN <span>↻</span></button><button class="secondary" id="menu">MAIN MENU</button></div>`);
    if(run.bountyAwarded)this.on('bounty-store',()=>{this.game.state='menu';this.previewSkin=save.skin;this.collection();});
    this.on('retry', () => this.game.startRun());
    this.on('menu', () => { this.game.state = 'menu'; this.game.ui.menu(); });
  }
}



