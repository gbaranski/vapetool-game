export default abstract class GameObject {
  public sprite: PIXI.Sprite;

  public vx: number = 0;

  public vy: number = 0;

  public ax: number;

  public ay: number;

  public isColliding: boolean;

  static objectCounter: number = 0;

  public name: string;

  constructor(name: string, public mass: number) {
    GameObject.objectCounter += 1;
    this.name = `${name}_${GameObject.objectCounter}`;
  }

  draw() {
    if (this.isColliding) {
      this.sprite.tint = 0.5;
    } else {
      this.sprite.tint = 0xffffff;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handlePhysics() {}

  handleGravity(secondsPassed: number) {
    if (this.mass !== Number.MAX_VALUE) {
      const gravity = 9.81;
      this.vy += gravity * secondsPassed;
    }
    console.log('handle gravity', this.name);
  }

  preventFalling() {
    this.vy = 0;
  }

  update(secondsPassed: number) {
    this.sprite.x += this.vx * secondsPassed;
    this.sprite.y += this.vy * secondsPassed;
  }
}
