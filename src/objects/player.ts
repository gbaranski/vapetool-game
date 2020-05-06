import * as PIXI from 'pixi.js';

export default class Player {
  public sprite: PIXI.Sprite;

  private vx: number;

  private vy: number;

  // private cloudTexture: PIXI.Texture; MOVE TO DIFFERENT CLASS

  private loader: PIXI.Loader;

  private container: PIXI.Container;

  private rendererWidth: number;

  private rendererHeight: number;

  private cloudSprites: PIXI.Sprite[];

  private flipping: boolean;

  private flipVelocity: number;

  private friction: number;

  private ax: number;

  private axErrorMargin: number;

  private hp: number;

  public score: number;

  private isLastMoveRight: boolean;

  constructor(
    loader: PIXI.Loader,
    rendererWidth: number,
    rendererHeight: number,
    container: PIXI.Container,
  ) {
    this.loader = loader;

    this.loader.load((_loader, resources) => {
      this.sprite = new PIXI.Sprite(resources.player.texture);
      // this.cloudTexture = new PIXI.Texture(resources.cloud.texture);
    });

    this.score = 0;

    this.container = container;

    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;

    this.cloudSprites = [];
    this.flipping = false;
    this.flipVelocity = 0;
    this.friction = 0.5;
    this.ax = 0;
    this.axErrorMargin = 0.1;
    this.hp = 10000;
  }

  create() {
    this.vx = 0;
    this.vy = 0;
    this.sprite.scale.x = 2;
    this.sprite.scale.y = 3;
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.x = this.rendererWidth / 2;
    this.sprite.y = this.rendererHeight - this.sprite.height / 2;
    this.container.addChild(this.sprite);
  }

  jump() {
    if (this.checkIfOnGround()) {
      this.vy = -18;
    }
  }

  checkIfOnGround() {
    return this.sprite.y === this.rendererHeight - this.sprite.height / 2;
  }

  canMoveRight() {
    return this.vx < 10 && this.ax > 0;
  }

  canMoveLeft() {
    return this.vx > -10 && this.ax < 0;
  }

  handlePhysics(gravity: number) {
    if (this.checkIfOnGround()) {
      this.friction = 0.7; // friction on ground
    } else {
      this.friction = 0.1; // friction in air
    }
    if (this.canMoveRight()) {
      this.vx += this.ax - this.friction;
    }
    if (this.canMoveLeft()) {
      this.vx += this.ax + this.friction;
    }

    if (this.ax === 0) {
      if (this.vx > 0) {
        this.vx -= this.friction;
        if (this.vx < this.axErrorMargin) {
          this.vx = 0;
        }
      } else if (this.vx < 0) {
        this.vx += this.friction;
        if (this.vx > this.axErrorMargin) {
          this.vx = 0;
        }
      }
    }
    this.sprite.x += this.vx;
    this.sprite.y += this.vy;

    if (this.sprite.y <= this.rendererHeight - this.sprite.height / 2) {
      this.vy += gravity;
    } else {
      this.vy = 0;
    }
    this.ax = Math.floor(this.ax);
    this.sprite.y = Math.min(this.sprite.y, this.rendererHeight - this.sprite.height / 2);
  }

  checkIfBunnyGoRight() {
    return this.isLastMoveRight;
  }

  setLastMoveRight(lastMoveRight: boolean) {
    this.isLastMoveRight = lastMoveRight;
  }

  setFlipping(flipping: boolean) {
    this.flipping = flipping;
  }

  handleFlips() {
    if (this.checkIfBunnyGoRight() && !this.flipping) {
      this.flipVelocity = 10;
    } else if (!this.flipping) {
      this.flipVelocity = -10;
    }

    if (this.flipping) {
      this.vy = Math.max(Math.min(this.vy < 0 ? this.vy * 1.05 : this.vy, 30), -30);
      this.vx = Math.max(Math.min(this.vx * 1.3, 10), -10);
      this.sprite.angle += this.flipVelocity;
      if (Math.abs(this.sprite.angle) > 360) {
        this.flipping = false;
        this.sprite.angle = 0;
      }
    }
  }

  getHp() {
    return this.hp;
  }

  setHp(newHp: number) {
    this.hp = newHp;
  }

  setAx(newAx: number) {
    this.ax = newAx;
  }
  /*

  */
}
