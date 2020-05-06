import * as PIXI from 'pixi.js';

export default class Bullet {
  private texture: PIXI.Texture;

  private bullet: PIXI.Sprite;

  private container: PIXI.Container;

  private rendererWidth: number;

  private rendererHeight: number;

  private bulletSpeed: number;

  constructor(loader, rendererWidth, rendererHeight, container) {
    loader.load(({ resources }) => {
      this.texture = new PIXI.Texture(resources.bullet.texture);
    });
    this.container = container;
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;

    this.bulletSpeed = -50;
  }

  shoot(startX, startY, targetX, targetY) {
    this.bullet = new PIXI.Sprite(this.texture);
    this.bullet.x = startX;
    this.bullet.y = startY;
    this.bullet.anchor.set(0.5);
    this.bullet.scale.x = -0.1;
    this.bullet.scale.y = -0.1;
    this.bullet.rotation = rotateToPoint(startX, startY, targetX, targetY);
    this.container.addChild(this.bullet);
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
    this.bullet.x += Math.cos(this.bullet.rotation) * this.bulletSpeed;
    this.bullet.y += Math.sin(this.bullet.rotation) * this.bulletSpeed;
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
