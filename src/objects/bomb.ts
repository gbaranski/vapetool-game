import * as PIXI from 'pixi.js';

export default class Bomb {
  private bombTexture: PIXI.Texture;

  private animatedExplosionSprite: PIXI.AnimatedSprite;

  public bomb: PIXI.Sprite;

  public created: boolean;

  private vx: number;

  private vy: number;

  private gravity: number;

  public exploded: boolean;

  public explosions: any = [];

  private loadTime: any;

  private container: PIXI.Container;

  private loader: PIXI.Loader;

  private explosionFrames: any;

  constructor(loader: PIXI.Loader, explosionFrames, container) {
    // this.created = false;
    this.container = container;
    this.loader = loader;
    this.explosionFrames = explosionFrames;
    /*
    loader.load(() => {
      // this.bombTexture = new PIXI.Texture(resources.bomb.texture);
      this.bombTexture = loader.resources.bomb.texture;
      this.animatedExplosionSprite = new PIXI.AnimatedSprite(
        explosionFrames.map((path) => PIXI.Texture.from(path)),
      );
    });
    */
  }

  loadBomb() {
    this.loadTime = new Date().getTime();
  }

  create(x: number, y: number, isMoveDirectionRight: boolean) {
    this.bombTexture = this.loader.resources.bomb.texture;
    this.bomb = new PIXI.Sprite(this.bombTexture);
    const timeDifference = new Date().getTime() - this.loadTime;

    this.bomb.x = x;
    this.bomb.y = y;
    if (isMoveDirectionRight) {
      this.vx = 30;
    } else {
      this.vx = -30;
    }
    this.vy = -Math.abs(timeDifference / 20);
    this.gravity = 2;
    this.exploded = false;
    this.bomb.scale.x = 0.2;
    this.bomb.scale.y = 0.2;
    this.bomb.anchor.set(0.5, 0.5);
    this.created = true;
    this.container.addChild(this.bomb);
  }

  renderBombFrame() {
    if (!this.exploded) {
      this.bomb.x += this.vx;
      this.vy += this.gravity;
      this.bomb.y += this.vy;
      this.bomb.angle += +10;
    }
  }

  remove(bomb: PIXI.Sprite) {
    this.container.removeChild(bomb);
    // setTimeout(() => {
    //   this.bombs = this.bombs.filter((e) => e !== bomb);
    //   this.container.removeChild(bomb);
    // }, 300);
  }

  explode(x: number, y: number) {
    this.animatedExplosionSprite = new PIXI.AnimatedSprite(
      this.explosionFrames.map((path) => PIXI.Texture.from(path)),
    );
    const explosion = this.animatedExplosionSprite;
    this.exploded = true;
    explosion.scale.x = 4;
    explosion.scale.y = 4;
    explosion.x = x;
    explosion.y = y;
    explosion.anchor.set(0.5, 0.5);
    // explosion.scale.set(0.75 + Math.random() * 0.5);
    explosion.play();
    this.explosions.push(explosion);
    // this.container.removeChild(explosion);
    this.container.addChild(explosion);
    setTimeout(() => {
      this.explosions = this.explosions.filter((ex) => ex !== explosion);
      this.container.removeChild(explosion);
    }, 1000);
  }
}
