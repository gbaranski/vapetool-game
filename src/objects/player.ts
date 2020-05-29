import * as PIXI from 'pixi.js';
import GameObject from './gameObject';
import { ObjectType } from '../types';

export default class Player extends GameObject {
  private container: PIXI.Container;

  private rendererWidth: number;

  private rendererHeight: number;

  private flipping: boolean;

  private flipVelocity: number;

  private friction: number;

  private axErrorMargin: number;

  private hp: number;

  public score: number;

  private isLastMoveRight: boolean;

  public allowedDoubleJump: boolean;

  public blockRightSideMovement: boolean;

  public blockLeftSideMovement: boolean;

  public jumping: boolean;

  constructor(
    sprite: PIXI.Sprite,
    rendererWidth: number,
    rendererHeight: number,
    container: PIXI.Container,
  ) {
    super(ObjectType.PLAYER, 100);
    this.sprite = new PIXI.Sprite(sprite.texture);
    this.score = 0;

    this.container = container;

    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;

    this.flipping = false;
    this.flipVelocity = 0;
    this.friction = 0.5;
    this.ax = 0;
    this.axErrorMargin = 0.1;
    this.hp = 100;

    this.sprite.scale.x = 2;
    this.sprite.scale.y = 3;
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.x = this.rendererWidth / 2;
    this.sprite.y = this.rendererHeight - this.sprite.height / 2;
    this.container.addChild(this.sprite);
  }

  jump() {
    if (this.checkIfOnGround() || this.allowedDoubleJump) {
      this.jumping = true;
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

  handleFriction() {
    if (this.checkIfOnGround()) {
      this.friction = 0.7; // friction on ground
      this.allowedDoubleJump = false;
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
  }

  handlePhysics() {
    if (this.jumping) {
      this.ax = Math.floor(this.ax);
      this.vy = -18;
      this.jumping = false;
    }
    this.allowedDoubleJump = false;
    this.handleFriction();
    this.handleFlips();
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
      this.flipVelocity = 5;
    } else if (!this.flipping) {
      this.flipVelocity = -5;
    }

    if (this.flipping) {
      this.vy = Math.max(Math.min(this.vy < 0 ? this.vy * 1.02 : this.vy, 30), -30);
      this.vx = Math.max(Math.min(this.vx * 1.3, 10), -10);
      this.sprite.angle += this.flipVelocity;
      if (Math.abs(this.sprite.angle) > 360) {
        this.flipping = false;
        this.sprite.angle = 0;
      }
    }
  }

  pushPlayer(xPushMultiplier: number, yPushMultiplier: number) {
    this.vx = Math.min((this.vx += xPushMultiplier), 10);
    this.vy = Math.max((this.vy += yPushMultiplier), -15);
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

  getVx() {
    return this.vx;
  }

  getVy() {
    return this.vy;
  }

  getFriction() {
    return this.friction;
  }

  getAx() {
    return this.ax;
  }
}
