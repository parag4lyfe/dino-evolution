import { WIDTH, HEIGHT, GROUND, PLAYER_X } from '../config.js';

export const MAPS = [
  { id: 'desert', name: 'ANCIENT DESERT', unlock: 0, floor: 0x71503b, rim: 0xf2d595, hazards: ['cactus', 'rock', 'bird'], hint: 'JUMP CACTI · SLIDE UNDER BIRDS' },
  { id: 'jungle', name: 'LOST JUNGLE', unlock: 500, floor: 0x344335, rim: 0x9bd374, hazards: ['boar', 'stump', 'bat', 'gap'], hint: 'JUMP BOARS & VALLEYS · SLIDE UNDER BATS' },
  { id: 'volcano', name: 'VOLCANIC WASTELAND', unlock: 1000, floor: 0x43231f, rim: 0xffa34e, hazards: ['rock', 'crystal', 'gap', 'bird'], hint: 'JUMP LAVA RIFTS & OBSIDIAN · DUCK FIREBIRDS' },
  { id: 'tundra', name: 'FROZEN TUNDRA', unlock: 1500, floor: 0x455c83, rim: 0xe3fcff, hazards: ['rock', 'crystal', 'bat'], hint: 'JUMP ICE SPIRES · DUCK FROST BATS' },
  { id: 'cyber', name: 'CYBER CITY', unlock: 2500, floor: 0x18223f, rim: 0x6ff7ed, hazards: ['alien', 'crystal', 'drone'], hint: 'SENTRIES FLASH BEFORE FIRING · DODGE LASERS' },
  { id: 'ruins', name: 'PREHISTORIC RUINS', unlock: 4000, floor: 0x30354e, rim: 0xa9d4ec, hazards: ['tomb', 'ghost', 'stump', 'gap'], hint: 'JUMP ANCIENT PILLARS & CHASMS · DUCK SPIRITS' },
];
export function mapIndexForDistance(distance) {
  return MAPS.reduce((index,map,i)=>distance>=map.unlock?i:index,0);
}

export class WorldSystem {
  constructor(scene) {
    this.scene = scene; this.index = 0; this.startedAt = 0; this.gaps = [];
    this.sky = scene.add.image(0, 0, 'desert-map', 'sky').setOrigin(0).setDisplaySize(WIDTH, GROUND).setDepth(-3);
    this.decor = scene.add.graphics().setDepth(-2);
    this.floor = scene.add.graphics().setDepth(-1);
    this.warning = scene.add.text(WIDTH / 2, 115, '', {fontFamily:'monospace',fontSize:'17px',color:'#ffffff',backgroundColor:'#142324cc',padding:{x:16,y:9}}).setOrigin(.5).setDepth(22);
  }
  get map() { return MAPS[this.index]; }
  reset() { this.index = 0; this.startedAt = 0; this.gaps = []; this.setMap(0, false); }
  setMap(index, announce = true) {
    this.index = index % MAPS.length; this.startedAt = this.scene.elapsed;
    this.gaps = [];
    const { scene: s, map } = this;
    s.obstacles.clear(true, true); s.collectibles.clear(true, true);
    s.nextSpawn = 2.5;
    this.sky.setVisible(map.id !== 'cyber');
    if (map.id !== 'cyber') this.sky.setTexture(`${map.id}-map`, 'sky').setDisplaySize(WIDTH, GROUND);
    if (announce) { s.cameras.main.flash(600, 120, 170, 180); s.notice = `ENTERING ${map.name} · ${map.hint}`; s.noticeUntil = s.elapsed + 3.5; }
  }
  hasGround(x) { return !this.gaps.some(gap => x > gap.x && x < gap.x + gap.width); }
  spawnGap(x = WIDTH + 100) {
    const gap = { x, width: Math.round(this.scene.speed * 0.38) };
    this.gaps.push(gap); return gap;
  }
  canSpawn() {
    if(mapIndexForDistance(this.scene.run.distance)>this.index)return false;
    return !this.gaps.some(gap => gap.x + gap.width > PLAYER_X - 130);
  }
  update(dt) {
    const s = this.scene;
    if (s.state === 'running') {
      for (const gap of this.gaps) gap.x -= s.speed * dt;
      this.gaps = this.gaps.filter(gap => gap.x + gap.width > -80);
      // Never change terrain while the player is crossing/falling into a gap.
      const next=mapIndexForDistance(s.run.distance);
      if (next>this.index && this.gaps.length === 0 && s.dino.y <= GROUND + 2) this.setMap(next);
    }
    const nextMap=MAPS[this.index+1];
    s.label.setText(`${String(this.index + 1).padStart(2,'0')} / ${this.map.name}${nextMap?' · NEXT '+nextMap.unlock+'m':' · FINAL WORLD'}`);
    const nearGap = this.gaps.find(gap => gap.x > PLAYER_X && gap.x < PLAYER_X + 500);
    this.warning.setVisible(s.state === 'running' && Boolean(nearGap));
    this.warning.setText(this.map.id==='volcano'?'⚠ LAVA RIFT — HOLD JUMP':'⚠ CHASM AHEAD — HOLD JUMP');
    this.draw();
  }
  draw() {
    const s = this.scene, g = this.decor, f = this.floor, scroll = s.scroll;
    g.clear(); f.clear();
    if (this.map.id === 'cyber') {
      g.fillGradientStyle(0x10132e,0x10132e,0x39265d,0x39265d);g.fillRect(0,0,WIDTH,GROUND);
      g.fillStyle(0xe97be4,.5);g.fillCircle(820,140,50);
      for(let layer=0;layer<3;layer++)for(let i=-1;i<14;i++){
        const x=i*95-(scroll*(.08+layer*.1))%95,h=90+((i+20)*37+layer*61)%180;
        g.fillStyle([0x30264d,0x242a49,0x142b40][layer]);g.fillRect(x,GROUND-h,80,h);
        g.lineStyle(1,layer===2?0x55c8dc:0x765396,.6);g.lineBetween(x,GROUND-h,x+80,GROUND-h);
        g.fillStyle(layer===2?0x77e7dd:0xb97bb9,.6);
        for(let row=0;row<4;row++)for(let col=0;col<3;col++)g.fillRect(x+12+col*22,GROUND-h+18+row*30,8,4);
      }
      g.lineStyle(2,0x72e0df,.4);g.lineBetween(0,GROUND-18,WIDTH,GROUND-18);
    } else {
      // Subtle moving foreground makes supplied pixel scenes feel alive.
      const color = this.map.id==='tundra'?0xffffff:this.map.id==='volcano'?0xffac51:this.map.id==='ruins'?0xb6d5ff:0xe9dc95;
      g.fillStyle(color,.4);
      for(let i=0;i<32;i++) { const x=(i*79+WIDTH-(scroll*.15)%WIDTH)%WIDTH; const y=this.map.id==='tundra'?(i*37+s.elapsed*22)%GROUND:95+(i*37)%285; g.fillRect(x,y+Math.sin(s.elapsed+i)*3,2,2); }
    }
    if(s.state!=='menu'){g.fillStyle(0x0b1b29,.65);g.fillRoundedRect(16,14,WIDTH-32,125,8);}
    const segments=[]; let start=0;
    for(const gap of [...this.gaps].sort((a,b)=>a.x-b.x)) {
      const left=Math.max(0,gap.x), right=Math.min(WIDTH,gap.x+gap.width);
      if(right<=0||left>=WIDTH) continue;
      if(left>start)segments.push([start,left]); start=Math.max(start,right);
      f.fillStyle(0x102b31); f.fillRect(left,GROUND,right-left,HEIGHT-GROUND);
      const lava=this.map.id==='volcano';
      f.fillStyle(lava?0xf35b21:0x235f70); f.fillRect(left,GROUND+80,right-left,30);
      f.lineStyle(2,lava?0xffcc50:0x6ac3bc,.7);f.lineBetween(left,GROUND+83,right,GROUND+83);
      for(const edge of [left-6,right]) {f.fillStyle(0x78976c);f.fillRect(edge,GROUND,6,HEIGHT-GROUND);}
    }
    if(start<WIDTH)segments.push([start,WIDTH]);
    for(const [a,b] of segments) {
      f.fillStyle(this.map.floor);f.fillRect(a,GROUND,b-a,HEIGHT-GROUND);
      f.fillStyle(this.map.rim);f.fillRect(a,GROUND,b-a,6);
      f.fillStyle(0x111d28,.3);
      for(let x=a+12;x<b-12;x+=32) {const y=GROUND+22+Math.floor(x/32)%3*17;f.fillRect(x,y,15,6);}
      f.fillStyle(this.map.rim,.5);for(let x=a+3;x<b-5;x+=18)f.fillRect(x,GROUND+8,5,4);
    }
    if(this.hasGround(PLAYER_X)) {f.fillStyle(0x091e24,.25);f.fillEllipse(PLAYER_X,GROUND+8,65,9);}
  }
}
