import { objectTypes } from '../types';

export default abstract class GameObject {
  public sprite: PIXI.Sprite;

  public vx: number = 0;

  public vy: number = 0;

  public ax: number = 0;

  public ay: number = 0;

  public isColliding: boolean;

  static objectCounter: number = 0;

  public name: string;

  constructor(objectType: objectTypes, public mass: number) {
    GameObject.objectCounter += 1;
    this.name = `${objectType}_${GameObject.objectCounter}`;
    console.log(this.name);
  }

  draw() {
    if (this.isColliding) {
      this.sprite.tint = 0.5;
    } else {
      this.sprite.tint = 0xffffff;
    }
  }

  setCollidingFalse() {
    this.isColliding = false;
  }

  // eslint-disable-next-line class-methods-use-this
  handlePhysics() {}

  handleGravity(secondsPassed: number) {
    if (this.mass !== Number.MAX_VALUE) {
      const gravity = 1;
      this.vy += gravity * secondsPassed;
    }
  }

  preventFalling() {
    this.vy = 0;
  }

  update(secondsPassed: number) {
    if (this.mass !== Number.MAX_VALUE) {
      // this.vx += this.ax * secondsPassed;
      this.sprite.x += this.vx * secondsPassed;
      this.sprite.y += this.vy * secondsPassed;
    }
  }
}
