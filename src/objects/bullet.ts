import * as PIXI from 'pixi.js';

export default class Bullet {
  private texture: PIXI.Texture;

  public sprite: PIXI.Sprite;

  private container: PIXI.Container;

  private rendererWidth: number;

  private rendererHeight: number;

  private bulletSpeed: number;

  constructor(
    loader: PIXI.Loader,
    rendererWidth: number,
    rendererHeight: number,
    container: PIXI.Container,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
  ) {
    this.texture = loader.resources.bullet.texture;
    this.container = container;
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;

    this.bulletSpeed = -50;
    this.sprite = new PIXI.Sprite(this.texture);
    this.sprite.x = startX;
    this.sprite.y = startY;
    this.sprite.anchor.set(0.5);
    this.sprite.scale.x = -0.1;
    this.sprite.scale.y = -0.1;
    this.sprite.rotation = rotateToPoint(startX, startY, targetX, targetY);
    this.container.addChild(this.sprite);
  }

  handleOutOfBounds(sprite) {
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

  handleBulletPhysics() {
    this.sprite.x += Math.cos(this.sprite.rotation) * this.bulletSpeed;
    this.sprite.y += Math.sin(this.sprite.rotation) * this.bulletSpeed;
    // this.bullets = this.bullets.filter(this.handleOutOfBounds);
  }
}

function rotateToPoint(mx, my, px, py) {
  const dist_Y = my - py;
  const dist_X = mx - px;
  const angle = Math.atan2(dist_Y, dist_X);
  // var degrees = angle * 180/ Math.PI;
  return angle;
}
