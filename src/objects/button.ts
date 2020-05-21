import * as PIXI from 'pixi.js';
import { ButtonTypes } from '../types';

export default class Button {
  public sprite: PIXI.Sprite;

  constructor(
    readonly buttonType: ButtonTypes,
    sprite: PIXI.Sprite,
    rendererWidth: number,
    rendererHeight: number,
    container: PIXI.Container,
  ) {
    if (this.buttonType === ButtonTypes.THROW_BOMB) {
      this.sprite = new PIXI.Sprite(sprite.texture);
      //   this.sprite.anchor.set(0.5);
      this.sprite.x = rendererWidth - this.sprite.width;
      this.sprite.y = 0;
      this.sprite.alpha = 0.4;
      this.sprite.interactive = true;
      container.addChild(this.sprite);
    }
  }
}
