class Bullet {
  constructor(loader) {
    loader.load((loader, resources) => {
      this.texture = new PIXI.Texture(resources.bullet.texture);
    });
    this.bullets = [];

    this.bulletSpeed = -50;
  }
  shoot(startX, startY, targetX, targetY) {
    let bullet = new PIXI.Sprite(this.texture);
    bullet.x = startX;
    bullet.y = startY;
    bullet.scale.x = -0.1;
    bullet.scale.y = -0.1;
    bullet.rotation = rotateToPoint(startX, startY, targetX, targetY);
    this.bullets.push(bullet);
    container.addChild(bullet);
  }
  handleOutOfBounds(sprite) {
    if (
      sprite.x < 0 ||
      sprite.y < 0 ||
      sprite.x > app.renderer.width ||
      sprite.y > app.renderer.height
    ) {
      container.removeChild(sprite);
      return false;
    }
    return true;
  }
  handleBulletPhysics() {
    this.bullets.forEach((bullet) => {
      bullet.x += Math.cos(bullet.rotation) * this.bulletSpeed;
      bullet.y += Math.sin(bullet.rotation) * this.bulletSpeed;
    });
    this.bullets = this.bullets.filter(this.handleOutOfBounds);
  }
}

function rotateToPoint(mx, my, px, py) {
  const dist_Y = my - py;
  const dist_X = mx - px;
  const angle = Math.atan2(dist_Y, dist_X);
  //var degrees = angle * 180/ Math.PI;
  return angle;
}
