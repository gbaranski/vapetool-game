import * as PIXI from 'pixi.js';

export default class Wall {
  public rectangle: PIXI.Sprite;

  constructor(rendererWidth: number, rendererHeight: number, container: PIXI.Container) {
    this.rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);

    this.rectangle.width = 100;
    this.rectangle.height = 300;
    this.rectangle.tint = 0x212121;

    this.rectangle.x = rendererWidth / 3;

    this.rectangle.y = rendererHeight - this.rectangle.height;

    container.addChild(this.rectangle);
  }
}
