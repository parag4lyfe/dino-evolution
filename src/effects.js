// Movement/activation effects only: no permanent hats, horns or accessories.
export function drawAbilityEffects(scene) {
  const g=scene.mutations,d=scene.dino,s=d.scaleX,x=d.x,y=d.y;
  const cy=y-(d.sliding?17:30)*s,t=scene.elapsed;g.clear();
  if(scene.run.upgrades.includes('magnet')) {
    g.lineStyle(1.5,0x9ef5cf,.35);g.beginPath();
    for(let i=0;i<2;i++)g.arc(x,cy,43+i*9,t*1.8+i*3,t*1.8+i*3+1.1,false);
    g.strokePath();
    for(let i=0;i<3;i++){const a=t*2+i*2.1;g.fillStyle(0xc9ffbd,.7);g.fillCircle(x+Math.cos(a)*49,cy+Math.sin(a)*34,2);}
  }
  if(scene.armour){g.lineStyle(2,0xb6eaff,.55+Math.sin(t*4)*.15);g.strokeEllipse(x,cy,57*s,(d.sliding?29:56)*s);}
  if(scene.phoenix){g.fillStyle(0xffb66e,.07+Math.sin(t*3)*.025);g.fillEllipse(x,cy,68*s,65*s);}
  if(scene.run.upgrades.includes('spring')&&d.body.blocked.down){g.lineStyle(2,0xffcf8b,.5);g.strokeEllipse(x,y-2,42+Math.sin(t*5)*5,7);}
  if(t<scene.dashUntil){for(let i=0;i<5;i++){g.fillStyle(0x89e5ff,(1-i/5)*.2);g.fillRoundedRect(x-38-i*16,cy-18,42,32,10);}g.lineStyle(2,0xc3faff,.8);g.lineBetween(x-95,cy,x-25,cy);g.lineBetween(x-70,cy+12,x-24,cy+12);}
  if(t<scene.comebackUntil){
    const age=1.2-(scene.comebackUntil-t);
    g.lineStyle(3,0xffdf9b,.8);g.strokeEllipse(x,cy,75+Math.sin(t*20)*4,72);
    for(let i=0;i<4;i++){g.fillStyle(0xffc878,.18-i*.035);g.fillRoundedRect(x-55-i*22,cy-21,44,39,13);}
    g.lineStyle(2,0xffe8aa,Math.max(0,1-age));g.strokeCircle(x,cy,45+age*110);
  }
  for(const ring of scene.jumpRings){const age=t-ring.at;if(age<.45){g.lineStyle(2,ring.color,(1-age/.45)*.7);g.strokeEllipse(ring.x,ring.y,20+age*125,6+age*26);}}
  scene.jumpRings=scene.jumpRings.filter(r=>t-r.at<.45);
}
