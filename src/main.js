import Phaser from 'phaser';
import './styles.css';
import './ui-polish.css';
import './game-layout.css';
import { WIDTH, HEIGHT, GRAVITY } from './config.js';
import { GameScene } from './scenes/GameScene.js';
import { restoreSave } from './systems/save.js';
async function boot(){
 await restoreSave();
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: WIDTH, height: HEIGHT,
  backgroundColor: '#253b43',
  render: { antialias: true, roundPixels: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: GRAVITY }, debug: false } },
  scene: [GameScene],
});

const stage=document.querySelector('#stage');
const screenButton=document.querySelector('#screen-toggle');
let nativeFullscreen=false;
function setExpanded(expanded){
  stage.classList.toggle('screen-expanded',expanded);
  document.body.classList.toggle('game-expanded',expanded);
  screenButton.textContent=expanded?'⤢ EXIT FULL SCREEN':'⛶ FULL SCREEN';
  screenButton.setAttribute('aria-pressed',String(expanded));
  requestAnimationFrame(()=>game.scale.refresh());
}
screenButton.onclick=async()=>{
  if(stage.classList.contains('screen-expanded')){
    if(document.fullscreenElement)await document.exitFullscreen();
    setExpanded(false);return;
  }
  // Expanded play also works where the browser disallows the Fullscreen API,
  // including some mobile browsers and embedded preview windows.
  setExpanded(true);
  try{
    if(stage.requestFullscreen){await stage.requestFullscreen();nativeFullscreen=true;}
  }catch{nativeFullscreen=false;}
  game.scale.refresh();
};
document.addEventListener('fullscreenchange',()=>{
  if(!document.fullscreenElement&&nativeFullscreen){nativeFullscreen=false;setExpanded(false);}
  requestAnimationFrame(()=>game.scale.refresh());
});
window.addEventListener('resize',()=>game.scale.refresh());

}
boot();
