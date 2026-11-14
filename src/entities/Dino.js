import Phaser from 'phaser';
import { GROUND, PLAYER_X, JUMP, SKINS } from '../config.js';
export class Dino extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, skin) {
    super(scene, PLAYER_X, GROUND, 'dino0');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setTint(skin).setDepth(10);
    this.body.setSize(32, 47).setOffset(21, 11);
    this.jumps = 0;
    this.invincibleUntil = 0;
    this.evolution = 0;
  }
  evolve(count) {
    this.evolution = count;
    this.setScale(1 + Math.min(count, 6) * 0.055);
    this.updatePose(false, 0);
    this.body.updateFromGameObject();
  }
  setSkin(index) {
    this.characterArt=SKINS[index].art;
    this.setTint(SKINS[index].color);
    this.updatePose(false,this.scene.elapsed||0);
    return this;
  }
  jump(upgrades) {
    const grounded = this.body.blocked.down || this.body.touching.down;
    if (!grounded && (!upgrades.includes('double') || this.jumps >= 2)) return false;
    if (grounded) this.jumps = 0;
    this.jumps++;
    this.setVelocityY(JUMP * (upgrades.includes('spring') ? 1.15 : 1));
    return true;
  }
  updatePose(sliding, elapsed) {
    const grounded = this.body.blocked.down || this.body.touching.down;
    if (grounded) this.jumps = 0;
    if(grounded && !this.wasGrounded) this.landedAt=elapsed;
    this.wasGrounded=grounded;
    this.sliding = sliding && grounded;
    const base=1+Math.min(this.evolution,6)*.055;
    const age=elapsed-(this.landedAt??-1);
    const squash=grounded&&age<.18?Math.sin(age/.18*Math.PI)*.08:0;
    this.setScale(base*(1+squash*.5),base*(1-squash));
    const frame=Math.floor(elapsed/.065)%8;
    this.setTexture(this.characterArt?`${this.characterArt}-${this.sliding?'slide':!grounded?'jump':'run'+frame}`:this.sliding?'slide':!grounded?'dinoJump':`dino${frame}`);
    // Growth is visible, but does not secretly make the collision box harder.
    // Keep the same world-space collision dimensions at every evolution stage.
    const w = (this.sliding ? 48 : 32) / this.scaleX;
    const h = (this.sliding ? 24 : 47) / this.scaleY;
    this.body.setSize(w, h, false);
    this.body.setOffset((74 - w) / 2, 60 - h);
  }
}
