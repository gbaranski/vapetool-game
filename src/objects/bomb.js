import * as PIXI from 'pixi.js'

export default class Bomb {
  constructor(loader, explosionFrames, container) {
    this.explosionTextures = [];
    this.container = container;
    loader.load((loader, resources) => {
      this.bombTexture = new PIXI.Texture(resources.bomb.texture);
      const texture = new PIXI.AnimatedSprite(explosionFrames.map(path => PIXI.Texture.from(path)));
      this.explosionTextures.push(texture);
    });
    this.bombs = [];
    // this.explosions = [];
    this.loadTime;
  }
  loadBomb() {
    this.loadTime = new Date().getTime();
  }
  create(x, y, playerDirection) {
    console.log(playerDirection);
    const bomb = new PIXI.Sprite(this.bombTexture);
    const timeDifference = new Date().getTime() - this.loadTime;
    bomb.x = x;
    bomb.y = y;
    if (playerDirection) {
      bomb.vx = 30;
    } else {
      bomb.vx = -30;
    }
    bomb.vy = -Math.abs(timeDifference / 20);
    bomb.gravity = 2;
    bomb.scale.x = 0.2;
    bomb.scale.y = 0.2;
    bomb.anchor.set(0.5, 0.5);
    this.bombs.push(bomb);
    this.container.addChild(bomb);
  }
  renderBombFrame() {
    this.bombs.forEach((bomb) => {
      bomb.x += bomb.vx;
      bomb.vy += bomb.gravity;
      bomb.y += bomb.vy;
      bomb.angle += +10;
    });
  }
  remove(bomb) {
    setTimeout(() => {
      this.bombs = this.bombs.filter((e) => e !== bomb);
    }, 1000);
    // container.removeChild(bomb);
  }
  explode(x, y) {
    const explosion = new PIXI.AnimatedSprite(this.explosionTextures);
    explosion.x = x;
    explosion.y = y;
    explosion.anchor.set(0.5);
    explosion.rotation = Math.random() * Math.PI;
    explosion.scale.set(0.75 + Math.random() * 0.5);
    explosion.gotoAndPlay(Math.random() * 27);
    // this.explosions.push(explosion);
    this.container.removeChild(explosion);
    this.container.addChild(explosion);
    setTimeout(() => {
        this.container.removeChild(explosion);   
    }, 1000);
  }
}
