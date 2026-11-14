// Original animated character art inspired by the supplied colour/character cues.
// All characters fit the same 74x60 frame and use identical gameplay hitboxes.
export function makeSkinTextures(scene) {
  const g=scene.make.graphics({x:0,y:0},false);
  for(const kind of ['bubblegum','charmender','cyber','gandhiji','modiji','trump','habibi','camel','golden']) {
    for(const pose of [...Array.from({length:8},(_,i)=>`run${i}`),'jump','slide']) {
      g.clear();drawCharacter(g,kind,pose);
      g.generateTexture(`${kind}-${pose}`,74,60);
    }
  }
  g.destroy();
}
function drawCharacter(p,kind,pose) {
  if(['habibi','camel','golden'].includes(kind)){drawDesertRoyalDino(p,kind,pose);return;}
  if(['gandhiji','modiji','trump'].includes(kind)){drawPortraitDino(p,kind,pose);return;}
  const bubble=kind==='bubblegum',cyber=kind==='cyber',slide=pose==='slide';
  const frame=pose.startsWith('run')?Number(pose.slice(3)):0;
  const swing=pose.startsWith('run')?Math.sin(frame*Math.PI/4):0;
  const bob=slide?0:Math.round(Math.sin(frame*Math.PI/2));
  const ink=cyber?0x071b28:0x43233b,body=bubble?0xf358a4:cyber?0x26343d:0xff9b47;
  const shade=bubble?0xc52f83:cyber?0x14212b:0xd65a29;
  const light=bubble?0xffa6d3:cyber?0x516572:0xffc86b;
  const belly=bubble?0xffe5a4:cyber?0x435460:0xffe7a7;
  const headY=(slide?28:6)+bob,bodyY=slide?36:27+bob;
  // Swept tail, thick outline and a lighter inner edge.
  p.lineStyle(11,ink);p.beginPath();p.moveTo(30,bodyY+12);p.lineTo(16,bodyY+12);p.lineTo(6,bodyY-1);p.strokePath();
  p.lineStyle(7,shade);p.beginPath();p.moveTo(30,bodyY+12);p.lineTo(16,bodyY+12);p.lineTo(6,bodyY-1);p.strokePath();
  if(bubble){
    p.fillStyle(ink);for(let i=0;i<4;i++)p.fillRect(15+i*4,bodyY-6+i*3,8,8);
    p.fillStyle(belly);for(let i=0;i<4;i++)p.fillRect(16+i*4,bodyY-5+i*3,5,5);
  }
  // Back leg and main body.
  p.fillStyle(ink);p.fillRoundedRect(35-swing*4,44,12,16-Math.max(0,swing)*5,4);
  p.fillStyle(shade);p.fillRoundedRect(37-swing*4,45,8,13-Math.max(0,swing)*5,3);
  p.fillStyle(ink);p.fillRoundedRect(22,bodyY-2,29,slide?21:27,10);
  p.fillStyle(body);p.fillRoundedRect(24,bodyY,25,slide?17:23,9);
  p.fillStyle(belly);p.fillEllipse(40,bodyY+12,13,slide?12:21);
  // Large expressive head and protruding muzzle.
  p.fillStyle(ink);p.fillRoundedRect(34,headY,31,29,9);p.fillRoundedRect(48,headY+16,24,14,5);
  p.fillStyle(body);p.fillRoundedRect(36,headY+2,27,25,8);p.fillRoundedRect(49,headY+18,21,10,4);
  p.fillStyle(light);p.fillRoundedRect(39,headY+4,18,5,3);p.fillRoundedRect(56,headY+19,11,3,1);
  p.fillStyle(ink);p.fillEllipse(49,headY+13,15,18);
  p.fillStyle(cyber?0x12dce5:0xfff9f0);p.fillEllipse(50,headY+13,11,14);
  p.fillStyle(bubble?0xb63e68:cyber?0x8afff4:0x1793bd);p.fillEllipse(52,headY+14,6,10);
  p.fillStyle(ink);p.fillEllipse(53,headY+14,3,8);p.fillStyle(0xffffff);p.fillRect(49,headY+8,3,3);
  p.fillStyle(ink);p.fillRect(65,headY+18,2,3);p.fillRect(59,headY+26,9,1);
  if(bubble){
    p.fillStyle(0xffb5d9);p.fillCircle(59,headY+22,3);p.fillStyle(0xfff3b8);p.fillRect(60,headY+27,2,3);
    // Rounded bow, sewn onto the character design rather than a power-up hat.
    p.fillStyle(ink);p.fillEllipse(40,headY+1,13,10);p.fillEllipse(52,headY+1,13,10);
    p.fillStyle(0xf7356c);p.fillEllipse(40,headY,10,7);p.fillEllipse(52,headY,10,7);
    p.fillStyle(0xff859f);p.fillRect(44,headY-3,5,7);
  }
  if(cyber){
    p.lineStyle(2,0x1ee1e0);p.lineBetween(28,bodyY+5,34,bodyY+5);p.lineBetween(29,bodyY+10,29,bodyY+17);
    p.fillStyle(0x85fff4);p.fillRect(37,bodyY+7,4,4);p.fillRect(22,bodyY+13,3,3);
  }
  // Front foot and little hand; stride is visible in all eight running frames.
  const lift=Math.max(0,-swing)*5;
  p.fillStyle(ink);p.fillRoundedRect(23+swing*3,45,12,15-lift,4);
  p.fillStyle(body);p.fillRoundedRect(25+swing*3,46,8,12-lift,3);
  p.fillStyle(cyber?0x38f3ec:0xfff2cf);p.fillRect(25+swing*3,57-lift,8,2);
  p.fillStyle(ink);p.fillRoundedRect(45,bodyY+3,13,7,3);p.fillStyle(body);p.fillRoundedRect(47,bodyY+4,9,4,2);
  if(!bubble){
    const flame=2+Math.sin(frame*Math.PI/2)*1.5,fy=bodyY-5;
    p.fillStyle(cyber?0x0e6b88:0xe84b26);p.fillEllipse(7,fy,14,20+flame);
    p.fillStyle(cyber?0x04d5df:0xffa126);p.fillEllipse(7,fy-2,10,15+flame);
    p.fillStyle(cyber?0xa5fff3:0xfff096);p.fillEllipse(7,fy+1,5,9);
    p.fillStyle(cyber?0x50fff6:0xffd543);p.fillRect(3,fy-15-flame,3,3);
  }
}

function drawDesertRoyalDino(p,kind,pose) {
  const golden=kind==='golden',camel=kind==='camel',slide=pose==='slide';
  const frame=pose.startsWith('run')?Number(pose.slice(3)):0;
  const stride=pose.startsWith('run')?Math.sin(frame*Math.PI/4):0;
  const bob=slide?0:Math.round(Math.sin(frame*Math.PI/2));
  const hy=(slide?27:11)+bob,by=slide?38:31+bob;
  const ink=golden?0x8b4b18:0x59382d,skin=golden?0xffd94c:0xffc780;
  const shine=golden?0xfff5ac:0xffe1a4;
  // Tail and rear stride sit behind the clothing/cape.
  p.lineStyle(10,ink);p.beginPath();p.moveTo(29,by+10);p.lineTo(15,by+10);p.lineTo(5,by-2);p.strokePath();
  p.lineStyle(6,skin);p.beginPath();p.moveTo(29,by+10);p.lineTo(15,by+10);p.lineTo(5,by-2);p.strokePath();
  p.lineStyle(2,shine);p.lineBetween(7,by,15,by+9);
  p.fillStyle(ink);p.fillRoundedRect(35-stride*4,45,11,15-Math.max(0,stride)*5,3);
  p.fillStyle(skin);p.fillRoundedRect(37-stride*4,47,7,11-Math.max(0,stride)*5,2);
  p.fillStyle(ink);p.fillRoundedRect(22,by-2,29,slide?21:25,7);
  p.fillStyle(camel?skin:golden?0xffdc55:0xfff8ec);p.fillRoundedRect(24,by,25,slide?17:21,6);
  if(golden||camel){
    // A red cape / woven saddle blanket, with animated trailing edge.
    p.fillStyle(0x70312b);p.fillPoints([{x:31,y:by-3},{x:41,y:by+2},{x:34,y:by+21},{x:17,y:by+20+stride},{x:22,y:by+5}],true);
    p.fillStyle(0xc9323e);p.fillPoints([{x:30,y:by-2},{x:38,y:by+3},{x:32,y:by+18},{x:20,y:by+17+stride},{x:24,y:by+5}],true);
    p.lineStyle(2,golden?0xfff2d2:0xffcc69);p.lineBetween(20,by+18+stride,32,by+19);
    if(camel){
      p.lineStyle(1,0xffd275);p.strokeRoundedRect(24,by+3,10,12,2);
      p.fillStyle(0xffdd86);p.fillRect(27,by+7,4,3);
      for(let i=0;i<3;i++){p.fillRect(22+i*6,by+20,2,4);p.fillCircle(23+i*6,by+24,2);}
    }else{p.fillStyle(0xfff8e5);p.fillRoundedRect(31,by-3,16,6,3);}
  }else{
    p.lineStyle(2,0xd5b05c);p.lineBetween(44,by+1,44,by+20);p.lineBetween(26,by+20,45,by+20);
    p.lineStyle(1,0xd8d4cb);p.lineBetween(29,by+5,33,by+17);
  }
  // Expressive face, clearly separate from each costume's headwear.
  p.fillStyle(ink);p.fillRoundedRect(34,hy,31,29,10);p.fillRoundedRect(49,hy+17,23,13,5);
  p.fillStyle(skin);p.fillRoundedRect(36,hy+2,27,25,9);p.fillRoundedRect(50,hy+19,20,9,4);
  p.fillStyle(shine);p.fillRoundedRect(40,hy+4,17,4,2);p.fillRoundedRect(56,hy+20,11,3,1);
  p.fillStyle(0x2b2528);p.fillRoundedRect(47,hy+10,6,9,1);p.fillStyle(0xffffff);p.fillRect(48,hy+11,2,2);
  p.fillStyle(ink);p.fillRect(65,hy+20,2,2);p.fillRect(60,hy+26,8,1);
  if(camel){
    // Camel hood, ears, little muzzle and gold-trimmed spectacles.
    p.fillStyle(ink);p.fillRoundedRect(32,hy-6,31,13,5);p.fillRoundedRect(52,hy-3,18,11,5);
    p.fillStyle(0xd79a51);p.fillRoundedRect(34,hy-5,27,10,4);p.fillRoundedRect(53,hy-2,15,8,4);
    p.fillStyle(0xffd884);p.fillEllipse(37,hy-6,8,10);p.fillEllipse(54,hy-7,6,8);
    p.fillStyle(0x5f392b);p.fillRect(45,hy-3,3,3);p.fillRect(64,hy+1,2,2);
    p.fillStyle(0xd79a51);p.fillRect(33,hy+3,5,19);
    p.lineStyle(1.5,0x8b541d);p.strokeCircle(50,hy+14,8);p.lineBetween(34,hy+13,42,hy+13);
  }else{
    p.fillStyle(0x1b2029);p.fillRoundedRect(43,hy+9,14,12,2);p.fillRoundedRect(59,hy+10,12,10,2);
    p.lineStyle(2,golden?0x171d26:0xd8aa47);p.lineBetween(35,hy+10,71,hy+10);
    p.fillStyle(0xf4fbff);p.fillRect(46,hy+11,3,3);p.fillRect(62,hy+12,3,3);
    if(golden){
      // Jewelled crown with three small rounded points, not a flat tint.
      p.fillStyle(0xae641c);p.fillRect(36,hy-3,29,8);p.fillRect(36,hy-10,5,10);p.fillRect(48,hy-12,5,12);p.fillRect(60,hy-10,5,10);
      p.fillStyle(0xffdf4f);p.fillRect(38,hy-3,25,6);p.fillRect(38,hy-9,3,8);p.fillRect(49,hy-10,3,9);p.fillRect(60,hy-9,3,8);
      p.fillStyle(0xfff2ae);p.fillRect(38,hy+1,25,2);p.fillStyle(0xdb2944);p.fillRect(48,hy-2,4,4);
      const sparkleX=frame%4<2?28:64,sparkleY=frame%4<2?hy+12:by+10;
      p.fillStyle(0xfff7b9);p.fillRect(sparkleX-3,sparkleY,7,1);p.fillRect(sparkleX,sparkleY-3,1,7);
    }else{
      // White ghutra and black agal with soft folds and gold-trimmed thobe.
      p.fillStyle(0xc5b7af);p.fillRoundedRect(31,hy-7,34,14,5);p.fillRect(30,hy+1,9,28);
      p.fillStyle(0xfffcf3);p.fillRoundedRect(34,hy-8,29,12,5);p.fillPoints([{x:34,y:hy},{x:41,y:hy+3},{x:31,y:by+14},{x:23,y:by+13}],true);
      p.lineStyle(2,0xd2c4bb);p.lineBetween(35,hy+7,27,by+10);
      p.fillStyle(0x262529);p.fillRoundedRect(32,hy-3,33,5,2);p.fillStyle(0x454248);p.fillRect(35,hy-3,25,1);
    }
  }
  const lift=Math.max(0,-stride)*5;
  p.fillStyle(ink);p.fillRoundedRect(24+stride*3,47,12,13-lift,3);
  p.fillStyle(skin);p.fillRoundedRect(26+stride*3,48,8,10-lift,2);
  p.fillStyle(golden?0xfff1a0:0x654431);p.fillRect(25+stride*3,57-lift,10,3);
  p.fillStyle(ink);p.fillRoundedRect(46,by+4,13,7,3);
  p.fillStyle(kind==='habibi'?0xfffcf0:skin);p.fillRoundedRect(47,by+4,6,5,2);
  p.fillStyle(skin);p.fillRoundedRect(52,by+5,6,4,1);
  if(golden){p.fillStyle(0xa86622);p.fillCircle(44,by+4,4);p.fillStyle(0xffe276);p.fillCircle(44,by+4,3);p.fillStyle(0xd52d40);p.fillCircle(44,by+4,1.5);}
}

function drawPortraitDino(p,kind,pose) {
  const gandhi=kind==='gandhiji',modi=kind==='modiji',slide=pose==='slide';
  const frame=pose.startsWith('run')?Number(pose.slice(3)):0;
  const stride=pose.startsWith('run')?Math.sin(frame*Math.PI/4):0;
  const bob=slide?0:Math.round(Math.sin(frame*Math.PI/2));
  const headY=(slide?26:7)+bob,bodyY=slide?38:31+bob;
  const ink=0x47332f,skin=gandhi?0xf4c68e:modi?0xffcc91:0xffb06c;
  const cloth=gandhi?0xfff4df:modi?0x233953:0x202e58;
  // Shared warm-toned dinosaur silhouette, with individual clothes and faces.
  p.lineStyle(10,ink);p.beginPath();p.moveTo(30,bodyY+10);p.lineTo(15,bodyY+10);p.lineTo(5,bodyY-2);p.strokePath();
  p.lineStyle(6,skin);p.beginPath();p.moveTo(30,bodyY+10);p.lineTo(15,bodyY+10);p.lineTo(5,bodyY-2);p.strokePath();
  p.fillStyle(ink);p.fillRoundedRect(35-stride*4,45,11,15-Math.max(0,stride)*5,3);
  p.fillStyle(skin);p.fillRoundedRect(37-stride*4,47,7,11-Math.max(0,stride)*5,2);
  p.fillStyle(ink);p.fillRoundedRect(22,bodyY-2,29,slide?21:25,7);
  p.fillStyle(cloth);p.fillRoundedRect(24,bodyY,25,slide?17:21,6);
  if(gandhi){
    p.fillStyle(0xdccfb9);p.fillPoints([{x:25,y:bodyY+2},{x:43,y:bodyY+17},{x:49,y:bodyY+12},{x:49,y:bodyY+19},{x:42,y:bodyY+22},{x:24,y:bodyY+7}],true);
    p.fillStyle(0xffffff);p.fillPoints([{x:28,y:bodyY-2},{x:49,y:bodyY+11},{x:45,y:bodyY+15},{x:24,y:bodyY+3}],true);
  }else{
    p.fillStyle(0xfaf5ed);p.fillPoints([{x:35,y:bodyY},{x:45,y:bodyY},{x:41,y:bodyY+12}],true);
    if(modi){
      p.fillStyle(0x91a6b8);for(let i=0;i<3;i++)p.fillRect(44,bodyY+8+i*5,2,2);
      p.fillStyle(0xffb24d);p.fillCircle(29,bodyY+7,2);p.fillStyle(0x79a275);p.fillRect(29,bodyY+8,1,4);
      p.fillStyle(0xf4f1e9);p.fillRect(24,bodyY+19,25,3);
    }else{
      p.fillStyle(0xe94050);p.fillPoints([{x:39,y:bodyY+3},{x:43,y:bodyY+4},{x:43,y:bodyY+17},{x:39,y:bodyY+20},{x:38,y:bodyY+17}],true);
      p.lineStyle(1,0x52648f);p.lineBetween(31,bodyY+2,36,bodyY+14);
      p.fillStyle(0xecf3ff);p.fillRect(28,bodyY+7,5,3);
    }
  }
  // Bald/white-haired/blond heads remain recognisable at gameplay scale.
  p.fillStyle(ink);p.fillRoundedRect(34,headY,31,29,10);p.fillRoundedRect(49,headY+17,23,13,5);
  p.fillStyle(skin);p.fillRoundedRect(36,headY+2,27,25,9);p.fillRoundedRect(50,headY+19,20,9,4);
  p.fillStyle(0xffdfb2);p.fillRoundedRect(40,headY+4,17,4,2);
  if(gandhi){
    p.fillStyle(0xe1d8c9);p.fillEllipse(35,headY+14,9,13);p.fillStyle(0xfff9e8);p.fillRect(32,headY+10,5,5);
  }else if(modi){
    p.fillStyle(0xd6d2d2);p.fillRoundedRect(33,headY-3,28,12,6);p.fillRect(32,headY+3,6,17);
    p.fillStyle(0xffffff);p.fillRoundedRect(36,headY-4,25,9,4);p.fillRect(34,headY+1,9,6);
    p.fillStyle(0xe7e1db);p.fillRoundedRect(39,headY+23,28,11,5);
    p.fillStyle(0xffffff);p.fillPoints([{x:37,y:headY+20},{x:45,y:headY+26},{x:65,y:headY+25},{x:59,y:headY+34},{x:47,y:headY+33},{x:39,y:headY+28}],true);
    p.fillStyle(0xd6ceca);p.fillRect(45,headY+28,3,3);p.fillRect(54,headY+30,3,3);
  }else{
    p.fillStyle(0xb7792f);p.fillRoundedRect(33,headY-4,32,14,5);p.fillRect(32,headY+5,6,12);
    p.fillStyle(0xf8cf5c);p.fillRoundedRect(35,headY-5,30,10,4);p.fillRoundedRect(51,headY-2,19,6,3);
    p.fillStyle(0xffe68a);p.fillRect(38,headY-3,15,3);p.fillRect(54,headY,12,2);
    p.fillStyle(0xf2b943);p.fillRect(34,headY+4,10,4);
  }
  p.fillStyle(0x302c2c);p.fillRoundedRect(47,headY+10,6,9,1);p.fillStyle(0xffffff);p.fillRect(48,headY+11,2,2);
  p.fillStyle(ink);p.fillRect(65,headY+20,2,2);p.fillRect(60,headY+26,8,1);
  if(gandhi||modi){
    p.lineStyle(1.5,ink);p.strokeCircle(50,headY+14,8);p.strokeCircle(65,headY+15,6);
    p.lineBetween(34,headY+13,42,headY+13);p.lineBetween(57,headY+14,59,headY+14);
  }
  const lift=Math.max(0,-stride)*5;
  p.fillStyle(ink);p.fillRoundedRect(24+stride*3,47,12,13-lift,3);
  p.fillStyle(skin);p.fillRoundedRect(26+stride*3,48,8,10-lift,2);
  if(!gandhi){p.fillStyle(0x252b37);p.fillRect(25+stride*3,57-lift,10,3);}
  p.fillStyle(ink);p.fillRoundedRect(46,bodyY+4,13,7,3);
  p.fillStyle(gandhi?skin:0xfff8ec);p.fillRoundedRect(47,bodyY+4,6,5,2);
  p.fillStyle(skin);p.fillRoundedRect(52,bodyY+5,6,4,1);
  if(gandhi){p.lineStyle(3,0x795239);p.lineBetween(61,bodyY+6,63+(slide?1:stride),59);p.fillStyle(skin);p.fillRect(57,bodyY+5,7,4);}
}
