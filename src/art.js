import { makeSkinTextures } from './skinArt.js';
// Original shaded sprites. Every dinosaur frame shares the same foot line.
export function makeTextures(scene) {
  makeSkinTextures(scene);
  const g=scene.make.graphics({x:0,y:0},false);
  const tex=(name,draw,w,h)=>{g.clear();draw(g);g.generateTexture(name,w,h);};
  function dino(p,frame,pose='run') {
    const bob=pose==='run'?Math.round(Math.sin(frame*Math.PI/2)):0;
    if(pose==='slide') {
      p.fillStyle(0xcbd9ba);p.fillRoundedRect(9,39,45,15,7);
      p.fillStyle(0xffffff);p.fillRoundedRect(20,34,37,19,8);p.fillRoundedRect(44,29,26,22,7);
      p.fillStyle(0xd6e6c9);p.fillRoundedRect(24,44,26,8,4);
      p.fillStyle(0x243c35);p.fillRect(59,34,5,5);p.fillRect(62,45,8,2);
      p.fillStyle(0xffffff);p.fillRect(60,34,2,2);p.fillRoundedRect(19,52,11,8,3);p.fillRoundedRect(43,52,13,8,3);return;
    }
    p.fillStyle(0xc3d2b7);p.fillEllipse(17,34+bob,31,13);p.fillRoundedRect(2,24+bob,8,12,4);
    const swing=pose==='run'?Math.sin(frame*Math.PI/4):0;
    p.fillStyle(0xbacbab);p.fillRoundedRect(36-swing*5,41,9,14-Math.max(0,swing)*6,3);p.fillRoundedRect(35-swing*5,54-Math.max(0,swing)*6,14,6,3);
    p.fillStyle(0xffffff);p.fillRoundedRect(22,21+bob,28,28,10);p.fillRoundedRect(34,5+bob,30,25,8);p.fillRoundedRect(47,18+bob,22,12,5);
    p.fillStyle(0xe5efd8);p.fillEllipse(39,37+bob,17,19);p.fillRoundedRect(23,45,9,14-Math.max(0,-swing)*6,3);p.fillRoundedRect(23,54-Math.max(0,-swing)*6,14,6,3);
    p.fillStyle(0xc0d3ac);p.fillRoundedRect(45,31+bob,12,5,2);
    p.fillStyle(0x243c35);p.fillRoundedRect(53,11+bob,6,7,2);p.fillRect(60,24+bob,8,2);
    p.fillStyle(0xffffff);p.fillRect(54,12+bob,2,2);p.fillStyle(0xd2e2be);p.fillCircle(59,21+bob,2);p.fillCircle(29,28+bob,2);p.fillCircle(26,35+bob,1);
  }
  for(let i=0;i<8;i++)tex(`dino${i}`,p=>dino(p,i),74,60);
  tex('dinoJump',p=>dino(p,0,'jump'),74,60);tex('slide',p=>dino(p,0,'slide'),74,60);
  tex('cactus',p=>{p.fillStyle(0x304d3e);p.fillRoundedRect(20,1,17,67,7);p.fillRoundedRect(3,23,13,27,5);p.fillRect(12,39,17,11);p.fillRoundedRect(40,13,13,27,5);p.fillRect(29,30,19,11);p.fillStyle(0x6e9b54);p.fillRoundedRect(22,3,10,64,4);p.fillRoundedRect(5,25,7,19,3);p.fillRoundedRect(42,15,6,17,3);p.lineStyle(1,0xb4c375);p.lineBetween(25,9,25,61);p.fillStyle(0xffb78e);p.fillCircle(27,4,4);},56,68);
  tex('rock',p=>{p.fillStyle(0x5b6370);p.fillPoints([{x:1,y:52},{x:8,y:20},{x:27,y:5},{x:52,y:13},{x:67,y:52}],true);p.fillStyle(0x9299a2);p.fillPoints([{x:8,y:20},{x:27,y:5},{x:37,y:24},{x:23,y:39}],true);p.fillStyle(0x737b83);p.fillTriangle(37,24,52,13,61,40);},68,52);
  for(const type of ['bird','bat','drone','ghost']) {
    const draw=(p,frame)=>{
      const lift=[-9,0,9,0][frame];
      if(type==='ghost') {p.fillStyle(0xc9b6ff);p.fillEllipse(38,25,32,34);p.fillRoundedRect(23,25,30,13,4);p.fillStyle(0x392969);p.fillEllipse(32,22,5,8);p.fillEllipse(44,22,5,8);p.fillStyle(0xefdfff,.5);p.fillCircle(37,12,7);}
      else if(type==='drone') {p.fillStyle(0x7be4dc);p.fillEllipse(37,23,53,17);p.fillStyle(0x3d6178);p.fillEllipse(37,26,66,9);p.fillStyle(0xb5faf3);p.fillEllipse(37,16,23,19);p.fillStyle(0xff90cb);p.fillCircle(37,28,4);p.fillCircle(18,26,2);p.fillCircle(56,26,2);}
      else {p.fillStyle(type==='bat'?0xb591db:0xe6ae7b);p.fillEllipse(36,27,25,15);p.fillPoints([{x:30,y:25},{x:5,y:12+lift},{x:13,y:30},{x:30,y:31}],true);p.fillPoints([{x:41,y:23},{x:65,y:10+lift},{x:56,y:31},{x:40,y:31}],true);p.fillStyle(0xffddb0);p.fillEllipse(45,23,15,13);p.fillStyle(0x222e3d);p.fillCircle(47,21,2);}
    };
    for(let frame=0;frame<4;frame++)tex(`${type}${frame}`,p=>draw(p,frame),74,44);
    tex(type,p=>draw(p,0),74,44);
  }
  const boar=(p,frame)=>{p.fillStyle(0x6d493a);p.fillRoundedRect(8,16,46,25,10);p.fillEllipse(55,28,23,23);p.fillStyle(0x412f2c);p.fillRoundedRect(15+(frame%2)*4,35,8,17,3);p.fillRoundedRect(42-(frame%2)*4,35,8,17,3);p.fillTriangle(45,20,47,5,56,19);p.fillStyle(0xc4855e);p.fillEllipse(62,31,15,12);p.fillStyle(0xffe8b0);p.fillRoundedRect(56,35,5,9,2);p.fillStyle(0xffe3b2);p.fillCircle(54,22,2);};
  for(let frame=0;frame<4;frame++)tex(`boar${frame}`,p=>boar(p,frame),74,52);tex('boar',p=>boar(p,0),74,52);
  tex('stump',p=>{p.fillStyle(0x563d2d);p.fillRoundedRect(7,8,44,50,5);p.fillStyle(0xba8e5a);p.fillEllipse(29,9,44,16);p.lineStyle(2,0x79603d);p.strokeEllipse(29,9,25,9);p.lineBetween(18,21,17,52);p.lineBetween(40,21,43,53);p.fillStyle(0x8cab60);p.fillRect(6,18,11,8);},60,58);
  tex('tomb',p=>{p.fillStyle(0x44425e);p.fillRoundedRect(8,3,38,61,16);p.fillStyle(0x9691b2);p.fillRoundedRect(11,3,30,58,12);p.fillStyle(0x55536e);p.fillRect(23,16,5,27);p.fillRect(16,23,19,5);p.fillStyle(0x666e75);p.fillRect(3,58,48,6);},54,64);
  tex('crystal',p=>{p.fillStyle(0x6434a1);p.fillPoints([{x:4,y:62},{x:10,y:25},{x:25,y:0},{x:38,y:22},{x:52,y:62}],true);p.fillStyle(0x9f79ea);p.fillTriangle(10,25,25,0,25,61);p.fillStyle(0x94eee3);p.fillTriangle(25,0,38,22,25,61);p.lineStyle(2,0xd4ffff);p.lineBetween(25,5,25,51);},56,62);
  tex('alien',p=>{p.fillStyle(0x5b8bb5);p.fillRoundedRect(15,26,28,22,7);p.fillStyle(0x9ce8cf);p.fillEllipse(29,16,33,30);p.fillStyle(0x20344d);p.fillEllipse(22,16,8,11);p.fillEllipse(36,16,8,11);p.fillStyle(0x536a95);p.fillRect(17,43,9,13);p.fillRect(33,43,9,13);p.fillStyle(0xe9a6e1);p.fillRoundedRect(1,31,23,9,3);p.fillStyle(0xb8faf1);p.fillRect(0,32,5,7);},58,56);
  tex('laser',p=>{p.fillStyle(0xf782b8,.3);p.fillRoundedRect(0,0,34,14,7);p.fillStyle(0xff99d5);p.fillRoundedRect(2,4,28,6,3);p.fillStyle(0xffffff);p.fillRect(5,6,21,2);},34,14);
  tex('dna',p=>{
    p.fillStyle(0x101b38);p.fillCircle(16,16,15);
    p.lineStyle(2,0xffffff);p.strokeCircle(16,16,13);
    p.fillStyle(0x19c7f1);p.fillCircle(16,16,10);
    p.lineStyle(3,0x15294c);p.lineBetween(11,8,21,24);p.lineBetween(21,8,11,24);
    p.lineStyle(2,0xffffff);p.lineBetween(12,10,20,10);p.lineBetween(12,22,20,22);p.fillStyle(0xffffff);p.fillCircle(16,16,2);
  },32,32);
  tex('spark',p=>{p.fillStyle(0xffffff);p.fillRect(0,0,4,4);},4,4);g.destroy();
}
