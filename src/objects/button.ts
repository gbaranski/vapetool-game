import * as PIXI from 'pixi.js';
import { ButtonTypes } from '../types';

export default class Button {
  public sprite: PIXI.Sprite;

  constructor(
    readonly buttonType: ButtonTypes,
    sprite: PIXI.Sprite,
    x: number,
    y: number,
    container: PIXI.Container,
  ) {
    this.sprite = new PIXI.Sprite(sprite.texture);
    //   this.sprite.anchor.set(0.5);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.alpha = 0.4;
    this.sprite.interactive = true;
    container.addChild(this.sprite);
  }
}
