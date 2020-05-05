import * as PIXI from 'pixi.js'

export default class Bullet {
  constructor(loader,rendererWidth, rendererHeight, container) {
    loader.load((loader, resources) => {
      this.texture = new PIXI.Texture(resources.bullet.texture);
    });
    this.container = container;
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;
    
    this.bullets = [];

    this.bulletSpeed = -50;
  }
  shoot(startX, startY, targetX, targetY) {
    let bullet = new PIXI.Sprite(this.texture);
    bullet.x = startX;
    bullet.y = startY;
    bullet.anchor.set(0.5);
    bullet.scale.x = -0.1;
    bullet.scale.y = -0.1;
    bullet.rotation = rotateToPoint(startX, startY, targetX, targetY);
    this.bullets.push(bullet);
    this.container.addChild(bullet);
  }
  handleOutOfBounds(sprite) {
    console.log(this.rendererWidth)
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
    this.bullets.forEach((bullet) => {
      bullet.x += Math.cos(bullet.rotation) * this.bulletSpeed;
      bullet.y += Math.sin(bullet.rotation) * this.bulletSpeed;
    });
    // this.bullets = this.bullets.filter(this.handleOutOfBounds);
  }
}

function rotateToPoint(mx, my, px, py) {
  const dist_Y = my - py;
  const dist_X = mx - px;
  const angle = Math.atan2(dist_Y, dist_X);
  //var degrees = angle * 180/ Math.PI;
  return angle;
}
