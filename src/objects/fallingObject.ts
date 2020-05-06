import * as PIXI from 'pixi.js';

export default class FallingObject {
  private texture: PIXI.Texture;

  public fallingObject: PIXI.Sprite;

  private vy: number;

  private rendererWidth: number;

  private objectGravity: number;

  private rendererHeight: number;

  private container: PIXI.Container;

  constructor(loader: PIXI.Loader, rendererWidth, rendererHeight, container) {
    loader.load(() => {
      this.texture = loader.resources.fallingObject.texture;
    });
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;
    this.container = container;
    this.objectGravity = 3;
  }

  create() {
    this.fallingObject = new PIXI.Sprite(this.texture);
    this.fallingObject.scale.x = 0.1;
    this.fallingObject.scale.y = 0.1;
    this.fallingObject.x = Math.floor(Math.random() * this.rendererWidth);
    this.fallingObject.y = 0;
    this.vy = this.objectGravity;
    this.container.addChild(this.fallingObject);
  }

  handlePhysics() {
    if (this.fallingObject.y <= this.rendererHeight - this.fallingObject.height) {
      this.fallingObject.y += this.vy;
    }
  }
}
