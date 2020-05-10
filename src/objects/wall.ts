import * as PIXI from 'pixi.js';

export default class Wall {
  public sprite: PIXI.Sprite;

  constructor(rendererWidth: number, rendererHeight: number, container: PIXI.Container) {
    this.sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);

    this.sprite.width = 100;
    this.sprite.height = 300;
    this.sprite.tint = 0x212121;

    this.sprite.x = rendererWidth / 3;

    this.sprite.anchor.set(0.5, 0.5);

    this.sprite.y = rendererHeight - this.sprite.height / 2;

    container.addChild(this.sprite);
  }
}
