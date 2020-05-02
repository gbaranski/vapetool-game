class Player {
  constructor(loader) {
    loader.load((loader, resources) => {
      this.sprite = new PIXI.Sprite(resources.player.texture);
    });
    this.jumping = false;
    this.flipping = false;
    this.flipVelocity = 0;
    this.friction = 0.5;
    this.ax = 0;
    this.axErrorMargin = 0.1;
    this.hp = 10;
  }
  create() {
    this.sprite.x = app.renderer.view.width / 2;
    this.sprite.y = app.renderer.view.height - this.sprite.height;
    this.sprite.vx = 0;
    this.sprite.vy = 0;
    container.addChild(this.sprite);
  }
  jump() {
    this.sprite.vy = -10;
  }
  checkIfOnGround() {
    return this.sprite.y === app.renderer.view.height - this.sprite.height;
  }
  canMoveRight() {
    return this.sprite.vx < 10 && this.ax > 0;
  }
  canMoveLeft() {
    return this.sprite.vx > -10 && this.ax < 0;
  }
  handlePhysics(gravity) {
    if (this.checkIfOnGround()) {
      this.friction = 0.5;
    } else {
      this.friction = 0.1;
    }
    if (this.canMoveRight()) {
      this.sprite.vx += this.ax - this.friction;
    }
    if (this.canMoveLeft()) {
      this.sprite.vx += this.ax + this.friction;
    }
    if (this.ax === 0) {
      if (this.sprite.vx > 0) {
        this.sprite.vx -= this.friction;
        if (this.sprite.vx < this.axErrorMargin) {
          this.sprite.vx = 0;
        }
      } else if (this.sprite.vx < 0) {
        this.sprite.vx += this.friction;
        if (this.sprite.vx > this.axErrorMargin) {
          this.sprite.vx = 0;
        }
      }
    }
    this.sprite.x += this.sprite.vx;
    this.sprite.y += this.sprite.vy;
    this.sprite.y = Math.min(
      this.sprite.y,
      app.renderer.view.height - this.sprite.height
    );
    if (this.sprite.y <= app.renderer.view.height - this.sprite.height) {
      this.sprite.vy += gravity;
    } else {
      this.sprite.vy = 0;
    }
    this.ax = Math.floor(this.ax);
  }
  handleFlips() {
    if (this.sprite.vx > 0 && this.flipping == false) {
      this.flipVelocity = 10;
    } else if (this.flipping == false) {
      this.flipVelocity = -10;
    }
    if (this.flipping) {
      this.sprite.angle += this.flipVelocity;
      if (Math.abs(this.sprite.angle) > 360) {
        this.flipping = false;
        this.sprite.angle = 0;
      }
    }
  }
}
