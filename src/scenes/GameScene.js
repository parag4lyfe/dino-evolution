import Phaser from 'phaser';
import { WIDTH, HEIGHT, GROUND, PLAYER_X, START_SPEED, MAX_SPEED, SKINS } from '../config.js';
import { makeTextures } from '../art.js';
import { Dino } from '../entities/Dino.js';
import { freshRun, nextLevelXP, spawnInterval, upgradeChoices, UPGRADES } from '../systems/progression.js';
import { loadSave, writeSave } from '../systems/save.js';
import { Audio } from '../systems/audio.js';
import { UI } from '../ui.js';
import { mapIndexForDistance, WorldSystem } from '../systems/WorldSystem.js';
import { POWER_DURATION, expiredPowers } from '../systems/powers.js';
import { drawAbilityEffects } from '../effects.js';
import { awardFirstRunBounty } from '../systems/bounty.js';
import { inComebackWindow, COMEBACK_DURATION, COMEBACK_AFTER } from '../systems/comeback.js';
import { speedAtDistance } from '../systems/difficulty.js';
import { pickupClear } from '../systems/pickupPlacement.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  preload() {
    for(const id of ['desert','jungle','volcano','tundra','ruins']) this.load.image(`${id}-map`, `${import.meta.env.BASE_URL}maps/${id}.png`);
  }
  create() {
    for(const id of ['desert','jungle','volcano','tundra','ruins']) {
      const texture=this.textures.get(`${id}-map`), image=texture.getSourceImage();
      // Exclude the reference's baked foreground so all playable obstacles are real.
      const crop={desert:[1050,8,image.width-1050,670],jungle:[530,150,1120,560],volcano:[0,0,720,205],tundra:[0,0,800,390],ruins:[0,0,1024,240]}[id];
      texture.add('sky',0,...crop);

    }
    makeTextures(this);
    this.save = loadSave();
    this.lastCrash=this.save.lastCrash;this.pendingComeback=this.save.pendingComeback;
    if (!this.save.ownedSkins.includes(this.save.skin)) this.save.skin = 0;
    this.audio = new Audio(this.save.sound);
    this.state = 'menu'; this.run = freshRun(); this.elapsed = 0; this.scroll = 0;
    this.backdrop = this.add.graphics();
    this.ground = this.add.rectangle(WIDTH / 2, GROUND + 20, WIDTH + 200, 40, 0xffffff, 0);
    this.physics.add.existing(this.ground, true);
    this.dino = new Dino(this, SKINS[this.save.skin].color);
    this.dino.setSkin(this.save.skin);
    this.mutations = this.add.graphics().setDepth(11);
    this.echo = this.add.text(0, GROUND - 100, '↻ YOUR LAST LIMIT\n+5 DNA IF YOU PASS', { fontFamily: 'monospace', fontSize: '12px', color: '#ffe3a6', backgroundColor: '#203239', padding: {x:9,y:7}, align: 'center' }).setOrigin(0.5).setDepth(8).setVisible(false);
    this.comebackButton = document.querySelector('#comeback');
    this.comebackButton.onclick = () => this.activateComeback();
    this.evolveButton=document.querySelector('#evolve');
    document.querySelector('#stage').append(this.evolveButton);
    this.evolveButton.onclick=()=>this.openEvolution();
    this.evolveButton.innerHTML='<span class="evolution-key">E</span><span class="evolution-label"><b>EVOLUTION READY!</b><small>Press E or tap here to choose a power</small></span><span class="evolution-arrow">→</span>';
    this.ability = this.add.text(WIDTH - 30, 90, '', { fontFamily: 'monospace', fontSize: '13px', color: '#8fc9ff' }).setOrigin(1, 0).setDepth(30).setInteractive({useHandCursor:true});
    this.ability.on('pointerdown', () => this.activateDash());
    this.powerText=this.add.text(30,104,'',{fontFamily:'monospace',fontSize:'12px',color:'#e3f5d8',lineSpacing:5}).setDepth(24);
    this.touchDashButton = document.querySelector('#touch-dash');
    this.touchDashButton.onclick = () => this.activateDash();
    this.physics.add.collider(this.dino, this.ground, null, () => this.world.hasGround(this.dino.body.center.x) && this.dino.body.bottom < GROUND + 24);
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.collectibles = this.physics.add.group({ allowGravity: false });
    this.world=new WorldSystem(this);
    this.jumpRings=[]; this.powerExpiries={};
    this.dust=this.add.particles(0,0,'spark',{emitting:false,speed:{min:10,max:50},angle:{min:170,max:230},lifespan:280,scale:{start:.65,end:0},alpha:{start:.45,end:0},tint:0xd5d8b2}).setDepth(8);
    this.physics.add.overlap(this.dino, this.obstacles, (_, obstacle) => {
      if(this.elapsed < this.comebackUntil) {
        this.burst(obstacle.x, obstacle.y - 20, 0xffd98b, 10);
        obstacle.destroy();
      } else this.hit();
    });
    this.physics.add.overlap(this.dino, this.collectibles, (_, dna) => this.collect(dna));
    this.hud = this.add.text(30, 25, '', { fontFamily: 'monospace', fontSize: '15px', color: '#e8e5d9', lineSpacing: 7 }).setDepth(20);
    this.xpBack = this.add.rectangle(30, 86, 190, 4, 0x525a55).setOrigin(0).setDepth(20);
    this.xpFill = this.add.rectangle(30, 86, 1, 4, 0xd9f28b).setOrigin(0).setDepth(21);
    this.label = this.add.text(WIDTH - 30, 28, '01 / THE DUSTLANDS', { fontFamily: 'monospace', fontSize: '12px', color: '#c5c7b4' }).setOrigin(1, 0).setDepth(20);
    this.pauseButton = this.add.text(WIDTH - 30, 60, 'Ⅱ PAUSE', { fontFamily: 'monospace', fontSize: '13px', color: '#d9f28b' }).setOrigin(1, 0).setDepth(30).setInteractive({ useHandCursor: true });
    this.pauseButton.on('pointerdown', () => this.togglePause());
    this.tip = this.add.text(WIDTH / 2, HEIGHT - 33, '', { fontFamily: 'monospace', fontSize: '13px', color: '#bdc1ad' }).setOrigin(0.5).setDepth(20);
    this.keys = this.input.keyboard.addKeys('SPACE,UP,DOWN,ESC,X,C,E,ONE,TWO,THREE');
    this.input.keyboard.on('keydown-E',()=>this.openEvolution());
    this.input.keyboard.on('keydown-C', () => this.activateComeback());
    this.input.keyboard.on('keydown-X', () => this.activateDash());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard.on('keydown', event => {
      if (this.state === 'evolving') {
        const choice = this.choices?.[Number(event.key) - 1];
        if (choice) this.chooseUpgrade(choice.id);
      }
    });
    this.touchJump = false; this.touchSlide = false; this.jumpRequested = false;
    document.querySelectorAll('[data-control]').forEach(button => {
      button.addEventListener('pointerdown', event => {
        event.preventDefault(); button.setPointerCapture(event.pointerId);
        if (button.dataset.control === 'jump') { this.touchJump = true; this.jumpRequested = true; }
        else this.touchSlide = true;
      });
      const release = () => { if (button.dataset.control === 'jump') this.touchJump = false; else this.touchSlide = false; };
      button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release);
    });
    this.game.events.on('blur', () => { if (this.state === 'running') this.togglePause(); });
    this.ui = new UI(this);
    const sound = document.querySelector('#sound');
    const updateSound = () => sound.textContent = this.save.sound ? 'SOUND ON' : 'SOUND OFF';
    sound.onclick = () => { this.save.sound = !this.save.sound; this.audio.enabled = this.save.sound; updateSound(); this.persist(); this.audio.play('click'); };
    updateSound(); this.ui.menu();
    this.physics.pause();
    // Read-only state handle for local debugging and browser acceptance checks.
    window.dinoGame = this;
    window.addEventListener('pagehide',()=>this.checkpoint());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.checkpoint();});
    this.saveWarning=document.createElement('div');this.saveWarning.id='save-warning';
    this.saveWarning.hidden=true;this.saveWarning.textContent='Browser saving is unavailable. Keep this tab open to retain progress.';
    document.querySelector('#stage').append(this.saveWarning);
  }
  persist() {
    const ok=writeSave(this.save);
    if(this.saveWarning)this.saveWarning.hidden=ok;
    return ok;
  }
  checkpoint(keepRun=true) {
    if(!['running','paused','evolving'].includes(this.state))return;
    const earned=Math.max(0,this.run.dna-(this.savedRunDNA||0));
    this.save.dna+=earned;this.save.wallet+=earned;this.savedRunDNA=this.run.dna;
    this.save.best=Math.max(this.save.best,Math.floor(this.run.distance));
    this.save.lastCrash=this.lastCrash;this.save.pendingComeback=this.pendingComeback;
    const powers={};for(const id of this.run.upgrades)powers[id]=Math.max(0,this.powerExpiries[id]-this.elapsed);
    this.save.resume=keepRun?{...this.run,elapsed:this.elapsed,powers,
      nextEvolutionAt:Math.max(0,this.nextEvolutionAt-this.elapsed),pendingEvolution:this.pendingEvolution,
      comebackCharge:this.comebackCharge,comebackTarget:this.comebackTarget,comebackUsed:this.comebackUsed,
      lastCrash:this.lastCrash,pendingComeback:this.pendingComeback,echoClaimed:this.echoClaimed}:null;
    this.persist();this.lastCheckpoint=this.elapsed;
  }
  continueSavedRun() {
    const snapshot=this.save.resume;if(!snapshot)return;
    this.startRun();
    this.run={...freshRun(),...snapshot,upgrades:[]};this.elapsed=snapshot.elapsed||0;
    this.savedRunDNA=this.run.dna;
    this.world.setMap(mapIndexForDistance(this.run.distance),false);
    this.pendingEvolution=snapshot.pendingEvolution===true;
    this.nextEvolutionAt=this.elapsed+(snapshot.nextEvolutionAt||0);
    this.powerExpiries={};
    const allowed=UPGRADES.map(u=>u.id);
    for(const [id,left]of Object.entries(snapshot.powers||{}))if(allowed.includes(id)&&Number.isFinite(left)&&left>0&&this.run.upgrades.length===0){
      this.run.upgrades.push(id);this.powerExpiries[id]=this.elapsed+Math.min(left,POWER_DURATION[id]);
    }
    this.armour=this.run.upgrades.includes('armour');this.phoenix=this.run.upgrades.includes('phoenix');
    this.dino.evolve(this.run.history.length);this.dino.invincibleUntil=this.elapsed+1.5;
    this.comebackCharge=snapshot.comebackCharge===true;this.comebackTarget=snapshot.comebackTarget;
    this.comebackUsed=snapshot.comebackUsed===true;this.lastCrash=snapshot.lastCrash;
    this.pendingComeback=snapshot.pendingComeback===true;this.echoClaimed=snapshot.echoClaimed===true;
    this.lastCheckpoint=this.elapsed;this.checkpoint();
  }
  upgradeName(id) { return UPGRADES.find(u => u.id === id)?.name || id; }
  startRun() {
    this.deathTimer?.remove();
    this.tweens.killTweensOf(this.dino);
    this.ui.hide(); this.obstacles.clear(true, true); this.collectibles.clear(true, true);
    this.bestAtRunStart=this.save.best;this.savedRunDNA=0;this.lastCheckpoint=0;
    this.run = freshRun(); this.elapsed = 0; this.nextSpawn = 2.2; this.nextDNA = 0.8;
    this.choices = []; this.armour = false; this.banked = false; this.jumpBuffer = 0;
    this.pendingEvolution=false;this.nextEvolutionAt=0;
    this.phoenix = false; this.dashUntil = 0; this.dashReady = 0; this.echoClaimed = false;
    // Death earns exactly one charge for the next attempt. Quitting a healthy
    // run does not create or replenish one. Restarting cannot duplicate it.
    this.comebackTarget = Number.isFinite(this.lastCrash) ? this.lastCrash : null;
    this.comebackCharge = this.pendingComeback === true;
    this.pendingComeback = false;
    this.comebackUntil = 0; this.comebackUsed = false;
    this.dino.evolve(0);
    this.powerExpiries={}; this.jumpRings=[]; this.noticeUntil=0; this.lastDust=0;
    this.world.reset();
    this.touchJump = false; this.touchSlide = false; this.jumpRequested = false;
    this.dino.body.reset(PLAYER_X, GROUND); this.dino.setVelocity(0, 0);
    this.dino.setAlpha(1).setAngle(0).setSkin(this.save.skin);
    this.dino.invincibleUntil = 0; this.dino.jumps = 0;
    this.state = 'running'; this.physics.resume(); this.cameras.main.resetFX();this.checkpoint();
  }
  togglePause() {
    if (this.state === 'running') { this.state = 'paused'; this.physics.pause(); this.checkpoint();this.ui.pause(); }
    else if (this.state === 'paused') this.resumeRun();
  }
  resumeRun() { this.state = 'running'; this.physics.resume(); this.ui.hide(); this.jumpRequested = false; this.touchJump = false; this.touchSlide = false; }
  addXP(amount) { this.run.xp += amount; }
  chooseUpgrade(id) {
    if (this.state !== 'evolving' || !this.choices.some(u => u.id === id)) return;
    for(const active of [...this.run.upgrades])this.removePower(active);
    this.pendingEvolution=false;this.nextEvolutionAt=this.elapsed+26;
    this.run.upgrades.push(id); this.run.history.push(id);
    this.powerExpiries[id]=this.elapsed+POWER_DURATION[id];
    if (id === 'armour') this.armour = true;
    if (id === 'phoenix') this.phoenix = true;
    this.dino.evolve(this.run.history.length);
    this.dino.invincibleUntil = this.elapsed + 1;
    this.audio.play('evolve'); this.burst(this.dino.x, this.dino.y - 25, 0xd9f28b, 28);
    this.resumeRun();
  }
  evolutionReady() {
    return this.pendingEvolution && this.run.upgrades.length===0 && this.elapsed>=this.nextEvolutionAt;
  }
  openEvolution() {
    if(this.state!=='running'||!this.evolutionReady())return;
    this.choices=upgradeChoices([]);this.state='evolving';this.physics.pause();this.ui.upgrades(this.choices);
  }
  skipEvolution() {
    this.pendingEvolution=false;this.nextEvolutionAt=this.elapsed+12;this.resumeRun();
  }
  spawnObstacle(forcedType, x = WIDTH + 80) {
    const type=forcedType||Phaser.Utils.Array.GetRandom(this.world.map.hazards);
    if(type==='gap') {
      const gap=this.world.spawnGap(x);this.clearUnsafeDNA();return gap;
    }
    const flying=['bird','bat','drone','ghost'].includes(type);
    const obstacle=this.obstacles.create(x,flying?GROUND-38:GROUND,type).setOrigin(.5,1);
    const w=flying?44:type==='rock'?46:type==='boar'?51:35;
    const h=flying?22:type==='rock'?38:type==='boar'?38:Math.min(60,obstacle.height);
    obstacle.body.setSize(w,h,false).setOffset((obstacle.width-w)/2,obstacle.height-h);
    obstacle.body.reset(obstacle.x,obstacle.y);obstacle.body.updateFromGameObject();
    obstacle.body.prev.copy(obstacle.body.position);obstacle.body.prevFrame.copy(obstacle.body.position);obstacle.body.autoFrame.copy(obstacle.body.position);
    const palette={volcano:0xffb06b,tundra:0xa9edff,cyber:0xb0edff,ruins:0xc2c4e8};
    if(palette[this.world.map.id])obstacle.setTint(palette[this.world.map.id]);
    obstacle.passed=false;obstacle.kind=type;obstacle.bornAt=this.elapsed;
    obstacle.flying=flying;
    if(type==='alien')obstacle.fireAt=this.elapsed+.7;
    this.clearUnsafeDNA();
    return obstacle;
  }
  expirePowers() {
    for(const id of expiredPowers(this.powerExpiries,this.elapsed))this.removePower(id);
  }
  removePower(id) {
    this.run.upgrades=this.run.upgrades.filter(power=>power!==id);delete this.powerExpiries[id];
    if(id==='armour')this.armour=false;
    if(id==='phoenix')this.phoenix=false;
    if(id==='dash')this.dashUntil=0;
  }
  fireLaser(alien) {
    const laser=this.obstacles.create(alien.x-35,GROUND-37,'laser');
    laser.kind='laser';laser.passed=true;
    laser.body.setSize(25,7,true);laser.setVelocityX(-this.speed-155);
    // Reserve the entire approaching laser lane, not just its current position.
    for(const dna of [...this.collectibles.getChildren()]) {
      if(dna.x<laser.x+45 && Math.abs(dna.y-laser.y)<48)dna.destroy();
    }
    this.audio.play('click');
  }
  spawnDNA() {
    const hazards=this.dnaHazards();
    // Keep a trio together. Try another height or a later stretch rather than
    // burying an individual coin inside a cactus or over a valley.
    const heights=Phaser.Utils.Array.Shuffle([GROUND-28,GROUND-110]);
    for(const start of [WIDTH+40,WIDTH+180,WIDTH+320])for(const y of heights) {
      const positions=[0,1,2].map(i=>start+i*44);
      if(!positions.every(x=>pickupClear(x,y,hazards,this.world.gaps)))continue;
      positions.forEach(x=>this.collectibles.create(x,y,'dna').setDepth(9));return;
    }
    // A crowded stretch can simply have no pickups.
  }
  dnaHazards() {
    return this.obstacles.getChildren().map(obstacle=>{
      const b=obstacle.body;
      if(obstacle.kind==='laser')return {left:PLAYER_X-50,right:b.right,top:b.top-8,bottom:b.bottom+8};
      // Account for future shots before a visible alien fires.
      if(obstacle.kind==='alien')return {left:PLAYER_X-50,right:b.right,top:GROUND-65,bottom:GROUND};
      return {left:b.left,right:b.right,top:b.top,bottom:b.bottom};
    });
  }
  clearUnsafeDNA() {
    const hazards=this.dnaHazards();
    for(const dna of [...this.collectibles.getChildren()]) {
      if(!pickupClear(dna.x,dna.y,hazards,this.world.gaps))dna.destroy();
    }
  }
  collect(dna) {
    if (this.state !== 'running' || !dna.active) return;
    this.burst(dna.x, dna.y, 0xd9f28b, 6); dna.destroy();
    this.run.dna++; this.addXP(3); this.audio.play('collect');this.checkpoint();
  }
  hit(falling=false) {
    if (this.state !== 'running' || (!falling && this.elapsed < this.dino.invincibleUntil)) return;
    if (this.armour && !falling) {
      this.removePower('armour'); this.dino.invincibleUntil = this.elapsed + 1.5;
      this.burst(this.dino.x, this.dino.y - 30, 0x8fc9ff, 20); this.audio.play('hit'); return;
    }
    if (this.phoenix) {
      this.removePower('phoenix'); this.obstacles.clear(true, true);
      this.world.gaps=[];this.dino.body.reset(PLAYER_X,GROUND);
      this.dino.invincibleUntil = this.elapsed + 2.5;
      this.burst(this.dino.x, this.dino.y - 30, 0xffad76, 50);
      this.audio.play('evolve'); this.cameras.main.flash(220, 255, 160, 80);
      this.notice = 'PHOENIX COMEBACK · YOUR RUN CONTINUES'; this.noticeUntil = this.elapsed + 3;
      return;
    }
    this.lastCrash = this.run.distance;
    this.pendingComeback = true;this.checkpoint(false);
    this.state = 'dying'; this.physics.pause(); this.audio.play('hit');
    this.cameras.main.shake(170, 0.006); this.burst(this.dino.x, this.dino.y - 25, 0xd9f28b, 32);
    this.tweens.add({ targets: this.dino, angle: -35, alpha: 0.25, duration: 380 });
    this.deathTimer = this.time.delayedCall(650, () => this.endRun());
  }
  endRun() {
    if (this.banked) return;
    this.checkpoint(false);
    this.banked = true; this.state = 'over'; this.physics.pause();
    const previousBest = this.bestAtRunStart??this.save.best;
    this.save.best = Math.max(previousBest, Math.floor(this.run.distance));
    this.save.resume=null;this.save.runs++;
    this.run.bountyAwarded=awardFirstRunBounty(this.save);
    this.persist(); this.ui.gameOver(previousBest);
  }
  burst(x, y, tint, count) {
    const emitter = this.add.particles(x, y, 'spark', { speed: { min: 35, max: 200 }, lifespan: 500, gravityY: 220, scale: { start: 1, end: 0 }, tint, emitting: false }).setDepth(25);
    emitter.explode(count); this.time.delayedCall(650, () => emitter.destroy());
  }
  activateDash() {
    if (this.state !== 'running' || !this.run.upgrades.includes('dash') || this.elapsed < this.dashReady) return;
    this.dashUntil = this.elapsed + 0.65; this.dashReady = this.elapsed + 6;
    this.dino.invincibleUntil = Math.max(this.dino.invincibleUntil, this.dashUntil);
    this.audio.play('evolve');
  }
  canComeback() {
    return this.state === 'running' && this.comebackCharge && inComebackWindow(this.comebackTarget, this.run.distance);
  }
  activateComeback() {
    if(!this.canComeback()) return false;
    this.comebackCharge = false; this.comebackUsed = true;
    this.comebackUntil = this.elapsed + COMEBACK_DURATION;
    this.dino.invincibleUntil = Math.max(this.dino.invincibleUntil, this.comebackUntil);
    // A full launch works even while airborne. It carries a baseline dinosaur
    // across the widest valley without depending on another mutation.
    this.dino.setVelocityY(-870); this.dino.jumps = 1;
    this.jumpBuffer = 0;
    for(const obstacle of [...this.obstacles.getChildren()]) {
      if(obstacle.x > PLAYER_X - 80 && obstacle.x < PLAYER_X + 620) {
        this.burst(obstacle.x,obstacle.y-20,0xffd98b,12); obstacle.destroy();
      }
    }
    this.jumpRings.push({x:this.dino.x,y:Math.min(this.dino.y,GROUND),at:this.elapsed,color:0xffd98b});
    this.burst(this.dino.x,this.dino.y-25,0xffd98b,30);
    this.audio.play('evolve'); this.cameras.main.shake(130,.003);
    this.notice = 'BOUNCE BACK! FAILURE BECOMES YOUR LAUNCH'; this.noticeUntil = this.elapsed + 2.5;
    return true;
  }
  updateComebackUI() {
    const ready = this.canComeback();
    const active = this.state === 'running' && this.elapsed < this.comebackUntil;
    const show = this.state === 'running' && (this.comebackCharge || active);
    this.comebackButton.hidden = !show;
    this.comebackButton.disabled = !ready;
    this.comebackButton.classList.toggle('ready',ready);
    if(active) this.comebackButton.textContent = '↻ BOUNCE BACK!';
    else if(ready) this.comebackButton.textContent = '↻ C / TAP · BOUNCE BACK NOW';
    else this.comebackButton.textContent = `↻ COMEBACK ARMED · ${Math.max(0,Math.ceil(this.comebackTarget-this.run.distance))}m TO LAST LIMIT`;
  }
  drawMutations() {drawAbilityEffects(this);}
  drawWorld(dt) {
    if(this.state==='running'||this.state==='menu')this.scroll+=dt*(this.state==='menu'?35:this.speed);
    this.world.update(dt);
  }
  update(_, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    this.speed = speedAtDistance(this.run.distance);
    this.drawWorld(dt);
    this.drawMutations();
    this.updateComebackUI();
    this.evolveButton.hidden=this.state!=='running'||!this.evolutionReady();
    this.ability.setVisible(this.state === 'running' && this.run.upgrades.includes('dash'));
    this.ability.setText(this.elapsed >= this.dashReady ? 'ϟ X / TAP TO DASH' : `ϟ RECHARGING ${Math.ceil(this.dashReady - this.elapsed)}s`);
    this.touchDashButton.style.display = this.state === 'running' && this.run.upgrades.includes('dash') ? 'block' : 'none';
    this.touchDashButton.textContent = this.elapsed >= this.dashReady ? 'ϟ DASH' : `ϟ ${Math.ceil(this.dashReady - this.elapsed)}s`;
    const target = this.comebackTarget ?? this.lastCrash;
    this.echo.setVisible(this.state === 'running' && Number.isFinite(target) && !this.echoClaimed);
    this.echo.setText(this.comebackCharge ? '↻ YOUR LAST LIMIT\nC / TAP TO BOUNCE BACK' : '↻ YOUR LAST LIMIT\n+5 DNA IF YOU PASS');
    if (Number.isFinite(target) && !this.echoClaimed) this.echo.x = PLAYER_X + (target - this.run.distance) * 12;
    const running = this.state === 'running';
    this.hud.setVisible(this.state !== 'menu'); this.xpBack.setVisible(this.state !== 'menu'); this.xpFill.setVisible(this.state !== 'menu'); this.pauseButton.setVisible(running || this.state === 'paused');
    this.powerText.setVisible(this.state!=='menu');
    if (!running) return;
    this.elapsed += dt;
    if(this.elapsed-(this.lastCheckpoint||0)>=2)this.checkpoint();
    this.expirePowers(); this.run.distance += this.speed * dt / 12; this.addXP(dt * 2);
    if(this.comebackCharge && this.run.distance > this.comebackTarget + COMEBACK_AFTER) {
      this.comebackCharge = false;
      this.notice = 'LAST LIMIT PASSED · COMEBACK WINDOW CLOSED'; this.noticeUntil = this.elapsed + 2;
    }
    if (Number.isFinite(target) && !this.echoClaimed && this.run.distance > target) {
      this.echoClaimed = true; this.run.dna += 5; this.addXP(8);this.checkpoint();
      this.notice = 'BOUNCE BACK! LAST LIMIT BROKEN · +5 DNA'; this.noticeUntil = this.elapsed + 3;
      this.burst(this.dino.x, this.dino.y - 50, 0xd9f28b, 30); this.audio.play('evolve');
    }
    const powers=this.run.upgrades.map(id=>`${this.upgradeName(id)} ${Math.ceil(this.powerExpiries[id]-this.elapsed)}s`);
    this.powerText.setVisible(true).setText(powers.length?'ACTIVE  /  '+powers.join('  ·  '):'COLLECT DNA TO DISCOVER A TEMPORARY POWER');
    const icons = { armour: this.armour ? '◈' : '◇', double: '↑↑', magnet: '◎', spring: '↟', dash: 'ϟ', phoenix: this.phoenix ? '♨' : '·' };
    this.hud.setText(`${String(Math.floor(this.run.distance)).padStart(5, '0')} m   /   DNA ${this.run.dna}\nLV ${this.run.level}  ·  PACE ${Math.round(this.speed/START_SPEED*100)}%  ${this.run.upgrades.map(u => icons[u]).join('  ')}`);
    this.xpFill.width = Math.min(190, this.run.xp / nextLevelXP(this.run.level) * 190);
    this.tip.setText(this.elapsed < this.noticeUntil ? this.notice : this.world.map.hint);
    this.dino.updatePose(this.keys.DOWN.isDown || this.touchSlide, this.elapsed);
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.keys.UP) || this.jumpRequested) { this.jumpBuffer = 0.12; this.jumpRequested = false; }
    if (this.jumpBuffer > 0) { if (this.dino.jump(this.run.upgrades)) {
      this.jumpBuffer = 0; this.audio.play('jump');
      this.jumpRings.push({x:this.dino.x,y:this.dino.y-3,at:this.elapsed,color:this.dino.jumps>1?0x8fdfff:0xd2eaba});
    } else this.jumpBuffer -= dt; }
    const hold = this.keys.SPACE.isDown || this.keys.UP.isDown || this.touchJump;
    if (!hold && this.dino.body.velocity.y < -310 && this.elapsed >= this.comebackUntil) this.dino.setVelocityY(-310);
    this.dino.setAlpha(this.elapsed < this.dino.invincibleUntil ? (Math.floor(this.elapsed * 16) % 2 ? 0.4 : 1) : 1);
    this.nextSpawn -= dt;
    if (this.nextSpawn <= 0 && this.world.canSpawn()) { this.spawnObstacle(); this.nextSpawn = spawnInterval(this.speed); }
    this.nextDNA -= dt;
    if (this.nextDNA <= 0) { this.spawnDNA(); this.nextDNA = 2.7; }
    this.clearUnsafeDNA();
    this.obstacles.getChildren().forEach(obstacle => {
      obstacle.setVelocityX(obstacle.kind==='laser'?-this.speed-155:-this.speed);
      if(obstacle.flying||obstacle.kind==='boar')obstacle.setTexture(`${obstacle.kind}${Math.floor(this.elapsed/.1)%4}`);
      if(obstacle.kind==='alien'&&!obstacle.fired) {
        obstacle.setTint(Math.floor(this.elapsed*10)%2?0xffb8d9:0xffffff);
        if(this.elapsed>=obstacle.fireAt&&obstacle.x>PLAYER_X+310){obstacle.fired=true;obstacle.clearTint();this.fireLaser(obstacle);}
      }
      if (!obstacle.passed && obstacle.x < PLAYER_X - 55) { obstacle.passed = true; this.run.passed++; this.addXP(5); }
      if (obstacle.x < -100) obstacle.destroy();
    });
    this.collectibles.getChildren().forEach(dna => {
      dna.setVelocityX(-this.speed); dna.setVelocityY(0);
      if (this.run.upgrades.includes('magnet') && Phaser.Math.Distance.Between(dna.x, dna.y, this.dino.x, this.dino.y - 25) < 180) this.physics.moveTo(dna, this.dino.x, this.dino.y - 25, 540);
      if (dna.x < -50) dna.destroy();
    });
    if(this.dino.body.blocked.down&&!this.dino.sliding&&this.elapsed-this.lastDust>.1){
      this.dust.emitParticleAt(this.dino.x-20,this.dino.y-3,2);this.lastDust=this.elapsed;
    }
    if(this.dino.y>HEIGHT+55){this.hit(true);return;}
    if (this.run.xp >= nextLevelXP(this.run.level)) {
      const threshold = nextLevelXP(this.run.level); this.run.xp -= threshold; this.run.level++;
      this.pendingEvolution=true;
    }
  }
}
