import * as PIXI from 'pixi.js';
import { ObjectType } from '../types';
import GameObject from './gameObject';

export default class Shop extends GameObject {
  constructor(
    private rendererWidth: number,
    private rendererHeight: number,
    sprite: PIXI.Sprite,
    objectType: ObjectType,
    private container: PIXI.Container,
  ) {
    super(objectType, Number.MAX_SAFE_INTEGER);
    this.sprite = new PIXI.Sprite(sprite.texture);
    this.sprite.x = this.sprite.width;
    this.sprite.y = rendererHeight - this.sprite.height * 2;
    this.sprite.anchor.set(0, 0.5);
    this.sprite.scale.set(5);
    this.container.addChild(this.sprite);
  }
}
