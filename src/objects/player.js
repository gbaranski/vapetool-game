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
    this.hp = 100;
  }
  create() {
    this.sprite.x = app.renderer.view.width / 2;
    this.sprite.y = app.renderer.view.height - this.sprite.height;
    this.sprite.vx = 0;
    this.sprite.vy = 0;
    this.sprite.anchor.set(0.5, 0.5);
    container.addChild(this.sprite);
  }
  jump() {
    if (this.checkIfOnGround()) {
      this.sprite.vy = -10;
    }
  }
  checkIfOnGround() {
    return this.sprite.y === app.renderer.view.height - this.sprite.height / 2;
  }
  canMoveRight() {
    return this.sprite.vx < 10 && this.ax > 0;
  }
  canMoveLeft() {
    return this.sprite.vx > -10 && this.ax < 0;
  }
  handlePhysics(gravity) {
    if (this.checkIfOnGround()) {
      this.friction = 0.5; // friction on ground
    } else {
      this.friction = 0.1; // friction in air
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

    if (this.sprite.y <= app.renderer.view.height - this.sprite.height / 2) {
      this.sprite.vy += gravity;
    } else {
      this.sprite.vy = 0;
    }
    this.ax = Math.floor(this.ax);
    this.sprite.y = Math.min(
      this.sprite.y,
      app.renderer.view.height - this.sprite.height / 2
    );
  }
  handleFlips() {
    if (this.sprite.vx > 0 && !this.flipping) {
      this.flipVelocity = 10;
    } else if (!this.flipping) {
      this.flipVelocity = -10;
    }

    if (this.flipping) {
      this.sprite.vy = Math.max(
        Math.min(
          this.sprite.vy < 0 ? this.sprite.vy * 1.05 : this.sprite.vy,
          10
        ),
        -10
      );
      this.sprite.vx = Math.max(Math.min(this.sprite.vx * 1.3, 10), -10);
      this.sprite.angle += this.flipVelocity;
      if (Math.abs(this.sprite.angle) > 360) {
        this.flipping = false;
        this.sprite.angle = 0;
      }
    }
  }
}
