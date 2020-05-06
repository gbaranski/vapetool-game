import * as PIXI from 'pixi.js';

export default class Bomb {
  private spriteTexture: PIXI.Texture;

  private animatedExplosionSprite: PIXI.AnimatedSprite;

  public sprite: PIXI.Sprite;

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

  constructor(loader: PIXI.Loader, explosionFrames: any, container: PIXI.Container) {
    // this.created = false;
    this.container = container;
    this.loader = loader;
    this.explosionFrames = explosionFrames;
    /*
    loader.load(() => {
      // this.spriteTexture = new PIXI.Texture(resources.sprite.texture);
      this.spriteTexture = loader.resources.sprite.texture;
      this.animatedExplosionSprite = new PIXI.AnimatedSprite(
        explosionFrames.map((path) => PIXI.Texture.from(path)),
      );
    });
    */
  }

  create(x: number, y: number, isMoveDirectionRight: boolean, timeDifference: number) {
    this.spriteTexture = this.loader.resources.bomb.texture;
    this.sprite = new PIXI.Sprite(this.spriteTexture);

    this.sprite.x = x;
    this.sprite.y = y;
    if (isMoveDirectionRight) {
      this.vx = 30;
    } else {
      this.vx = -30;
    }
    this.vy = -Math.abs(timeDifference / 50);
    this.gravity = 2;
    this.exploded = false;
    this.sprite.scale.x = 0.2;
    this.sprite.scale.y = 0.2;
    this.sprite.anchor.set(0.5, 0.5);
    this.created = true;
    this.container.addChild(this.sprite);
  }

  renderSpriteFrame() {
    if (!this.exploded) {
      this.sprite.x += this.vx;
      this.vy += this.gravity;
      this.sprite.y += this.vy;
      this.sprite.angle += +10;
    }
  }

  explode(x: number, y: number) {
    this.animatedExplosionSprite = new PIXI.AnimatedSprite(
      this.explosionFrames.map((path: any) => PIXI.Texture.from(path)),
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
      this.explosions = this.explosions.filter((_explosion: any) => _explosion !== explosion);
      this.container.removeChild(explosion);
    }, 1000);
  }
}
