import * as PIXI from 'pixi.js';
import GameObject from './gameObject';
import { ObjectType } from '../types';

export default class Bomb extends GameObject {
  private animatedExplosionSprite: PIXI.AnimatedSprite;

  public created: boolean;

  public exploded: boolean;

  public explosions: any = [];

  private loadTime: any;

  private container: PIXI.Container;

  private loader: PIXI.Loader;

  private explosionFrames: any;

  constructor(
    sprite: PIXI.Sprite,
    explosionFrames: any,
    startX: number,
    startY: number,
    vx: number,
    vy: number,
    timeDifference: number,
    container: PIXI.Container,
  ) {
    super(ObjectType.BOMB, 10);
    this.container = container;
    this.sprite = new PIXI.Sprite(sprite.texture);
    this.explosionFrames = explosionFrames;

    this.sprite.x = startX + vx;
    this.sprite.y = startY + vy;
    this.vx = vx;
    this.vy = vy;
    this.exploded = false;
    this.sprite.scale.x = 0.2;
    this.sprite.scale.y = 0.2;
    this.sprite.anchor.set(0.5, 0.5);
    this.created = true;
    this.container.addChild(this.sprite);
  }

  handlePhysics() {
    if (!this.exploded) {
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

    const blurFilter = new PIXI.filters.BlurFilter();
    this.container.filters = [blurFilter];
    let i: number = 0;

    const preContainerXY = {
      x: this.container.x,
      y: this.container.y,
    };
    let explodeFinished: boolean = false;

    const blurInterval = setInterval(() => {
      i += 1;
      blurFilter.blur = i / 20;

      this.container.x = preContainerXY.x - 2;
      this.container.y = preContainerXY.y - 2;
      console.log(this.container.x);
      setTimeout(() => {
        if (!explodeFinished) {
          this.container.x = preContainerXY.x + 4;
          this.container.y = preContainerXY.y + 4;
        }
      }, 10);
      console.log(this.container.x);
    });

    setTimeout(() => {
      clearInterval(blurInterval);
      explodeFinished = true;
      blurFilter.blur = 0;
      this.container.x = 0;
      this.container.y = 0;
      this.explosions = this.explosions.filter((_explosion: any) => _explosion !== explosion);
      this.container.removeChild(explosion);
    }, 1000);
  }
}
