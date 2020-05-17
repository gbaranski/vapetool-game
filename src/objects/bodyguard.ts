import * as PIXI from 'pixi.js';
import GameObject from './gameObject';

export default class Bodyguard extends GameObject {
  private texture: PIXI.Texture;

  private hp: number;

  private melee: number;

  private hpTextStyle: PIXI.TextStyle;

  public hpText: PIXI.Text;

  private container: PIXI.Container;

  constructor(
    sprite: PIXI.Sprite,
    rendererWidth: number,
    rendererHeight: number,
    container: PIXI.Container,
  ) {
    super('Bodyguard', 100);
    this.container = container;
    this.sprite = new PIXI.Sprite(sprite.texture);
    this.sprite.scale.x = 1;
    this.sprite.scale.y = 1;
    this.hp = 100;

    this.sprite.x = 0;
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
    this.hpText.anchor.set(0.5, 0.5);
    this.container.addChild(this.hpText);
  }

  updateHpText() {
    this.hpText.text = this.hp.toString();
    this.hpText.x = this.sprite.x;
  }

  render(enemyX: number) {
    const distanceFromPlayer = 200;
    this.vx = 0;
    if (enemyX - this.sprite.x < distanceFromPlayer) {
      this.vx = 0;
    } else {
      this.vx = 2;
    }
    this.sprite.x += this.vx;
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
}
