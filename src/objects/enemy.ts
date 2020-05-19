import * as PIXI from 'pixi.js';
import GameObject from './gameObject';
import { ObjectType } from '../types';

export default class Enemy extends GameObject {
  private texture: PIXI.Texture;

  private hp: number;

  private melee: number;

  private hpTextStyle: PIXI.TextStyle;

  public hpText: PIXI.Text;

  public isBeingPushed: boolean = false;

  private container: PIXI.Container;

  constructor(
    sprite: PIXI.Sprite,
    rendererWidth: number,
    rendererHeight: number,
    container: PIXI.Container,
  ) {
    super(ObjectType.ENEMY, 100);
    this.container = container;
    this.sprite = new PIXI.Sprite(sprite.texture);
    this.sprite.scale.x = 0.1;
    this.sprite.scale.y = 0.1;
    this.hp = 100;
    this.melee = Math.round(Math.random());
    this.vx = -2;
    this.sprite.x = rendererWidth;
    this.sprite.y = rendererHeight - this.sprite.height / 2;
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);

    this.hpTextStyle = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 'white',
      stroke: '#ff3300',
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });
    this.hpText = new PIXI.Text(this.hp.toString(), this.hpTextStyle);
    this.hpText.position.set(this.sprite.x, this.sprite.y - this.sprite.height);
    this.container.addChild(this.hpText);
  }

  updateHpText() {
    this.hpText.text = this.hp.toString();
    this.hpText.x = this.sprite.x;
  }

  targetEnemy(playerX: number) {
    const distanceFromPlayer = this.melee ? 0 : 200;
    if (this.sprite.x > playerX && this.sprite.x - playerX > distanceFromPlayer) {
      if (!this.isBeingPushed) {
        this.vx = -2;
      }
    }
    if (this.sprite.x < playerX && playerX - this.sprite.x > distanceFromPlayer) {
      if (!this.isBeingPushed) {
        this.vx = 2;
      }
    }
  }

  checkIfDead() {
    return this.hp <= 0;
  }

  setHp(newHp: number) {
    this.hp = newHp;
  }

  getHp() {
    return this.hp;
  }

  setVx(newVx: number) {
    this.vx = newVx;
  }

  setPushVariable(newPush: boolean) {
    this.isBeingPushed = newPush;
  }
}
