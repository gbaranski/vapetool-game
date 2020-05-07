import * as PIXI from 'pixi.js';

export default class FallingObject {
  public sprite: PIXI.Sprite;

  private vy: number;

  private rendererWidth: number;

  private objectGravity: number;

  private rendererHeight: number;

  private container: PIXI.Container;

  constructor(
    sprite: PIXI.Sprite,
    rendererWidth: number,
    rendererHeight: number,
    container: PIXI.Container,
  ) {
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;
    this.container = container;
    this.objectGravity = 3;

    this.sprite = new PIXI.Sprite(sprite.texture);
    this.sprite.scale.x = 0.1;
    this.sprite.scale.y = 0.1;
    this.sprite.x = Math.floor(Math.random() * this.rendererWidth);
    this.sprite.y = 0;
    this.vy = this.objectGravity;
    this.container.addChild(this.sprite);
  }

  handlePhysics() {
    if (this.sprite.y <= this.rendererHeight - this.sprite.height) {
      this.sprite.y += this.vy;
    }
  }
}
