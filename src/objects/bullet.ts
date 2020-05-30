import * as PIXI from 'pixi.js';
import GameObject from './gameObject';
import { ObjectType } from '../types';

export default class Bullet extends GameObject {
  private container: PIXI.Container;

  private rendererWidth: number;

  private rendererHeight: number;

  private bulletSpeed: number;

  public trails: PIXI.Sprite[] = [];

  constructor(
    sprite: PIXI.Sprite,
    rendererWidth: number,
    rendererHeight: number,
    container: PIXI.Container,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
  ) {
    super(ObjectType.BULLET, 1);
    this.container = container;
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;

    this.bulletSpeed = -5; // default -50
    this.sprite = new PIXI.Sprite(sprite.texture);
    this.sprite.x = startX;
    this.sprite.y = startY;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.x = -0.1;
    this.sprite.scale.y = -0.1;
    this.sprite.rotation = rotateToPoint(startX, startY, targetX, targetY);
    this.container.addChild(this.sprite);
  }

  handleOutOfBounds(sprite: PIXI.Sprite) {
    if (
      sprite.x < 0 ||
      sprite.y < 0 ||
      sprite.x > this.rendererWidth ||
      sprite.y > this.rendererHeight
    ) {
      this.container.removeChild(sprite);
      return false;
    }
    return true;
  }

  handlePhysics() {
    if (this.trails.length > 200) {
      this.container.removeChild(this.trails.shift());
    }

    const trailPart = new PIXI.Sprite(PIXI.Texture.WHITE);
    trailPart.tint = 0xff0000;
    trailPart.scale.set(1.5);
    trailPart.x = this.sprite.x;
    trailPart.y = this.sprite.y;
    trailPart.anchor.set(-1, 0.5);
    trailPart.rotation = this.sprite.rotation;

    this.container.addChild(trailPart);
    this.trails.push(trailPart);
    this.trails.forEach((_trail, index) => {
      this.trails[index].x += this.vx - this.vx / 15;
      this.trails[index].y += this.vy - this.vy / 15;
      this.trails[index].alpha = index / 1000;
    });

    this.vx = Math.cos(this.sprite.rotation) * this.bulletSpeed;
    this.vy = Math.sin(this.sprite.rotation) * this.bulletSpeed;
    this.sprite.x += this.vx;
    this.sprite.y += this.vy;
  }
}

function rotateToPoint(mx: number, my: number, px: number, py: number) {
  const dist_Y = my - py;
  const dist_X = mx - px;
  const angle = Math.atan2(dist_Y, dist_X);
  // var degrees = angle * 180/ Math.PI;
  return angle;
}
