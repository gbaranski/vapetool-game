import * as PIXI from 'pixi.js';
import GameObject from './gameObject';
import { objectTypes } from '../types';

export default class FallingObject extends GameObject {
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
    super(objectTypes.FALLING_OBJECT, 100);
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;
    this.container = container;

    this.sprite = new PIXI.Sprite(sprite.texture);
    this.sprite.scale.x = 0.1;
    this.sprite.scale.y = 0.1;
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.x = Math.floor(Math.random() * this.rendererWidth);
    this.sprite.y = 0;
    this.container.addChild(this.sprite);
  }
}
