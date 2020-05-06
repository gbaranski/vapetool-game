import * as PIXI from 'pixi.js';

export default class Enemy {
  public sprite: PIXI.Sprite;

  private texture: PIXI.Texture;

  private vx: number;

  private hp: number;

  private melee: number;

  private hpTextStyle: PIXI.TextStyle;

  private container: PIXI.Container;

  constructor(
    loader: any,
    rendererWidth: number,
    rendererHeight: number,
    container: PIXI.Container,
  ) {
    loader.load(({ resources }) => {
      this.texture = new PIXI.Texture(resources.enemy.texture);
    });
    console.log(this.texture);
    this.container = container;
    this.sprite = new PIXI.Sprite(this.texture);
    this.sprite.scale.x = 0.1;
    this.sprite.scale.y = 0.1;
    this.hp = 100;
    this.melee = Math.round(Math.random());

    this.sprite.x = Math.floor(Math.random() * Math.floor(rendererWidth));
    this.sprite.y = rendererHeight - this.sprite.height / 2;
    this.sprite.anchor.set(0.5);
    this.container.addChild(this.sprite);
  }
  /* Add later
  updateHpText() {
    this.hpTextStyle = new PIXI.TextStyle ({
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
    this.container.addChild();
  }
  */

  render(playerX: number) {
    const distanceFromPlayer = this.melee ? 0 : 200;
    this.vx = 0;
    if (this.sprite.x > playerX && this.sprite.x - playerX > distanceFromPlayer) {
      this.vx = -2;
    }
    if (this.sprite.x < playerX && playerX - this.sprite.x > distanceFromPlayer) {
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

/*
export default class Enemies {
  public enemies: Enemy[] = [];

  constructor(rendererWidth, rendererHeight, container) {
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;

    this.container = container;

    this.hpTexts = [];
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
  }

  create() {
    const enemy = new PIXI.Sprite(this.texture);
    enemy.scale.x = 0.1;
    enemy.scale.y = 0.1;
    enemy.hp = 100;
    enemy.melee = Math.round(Math.random());
    enemy.x = Math.floor(Math.random() * Math.floor(this.rendererWidth));
    enemy.y = this.rendererHeight - enemy.height / 2;
    enemy.anchor.set(0.5);
    this.enemies.push(enemy);
    this.container.addChild(enemy);
  }

  printHpText() {
    this.hpTexts.forEach((hpText) => {
      this.container.removeChild(hpText);
    });
    this.enemies.forEach((enemy) => {
      const hpText = new PIXI.Text(enemy.hp, this.hpTextStyle);
      hpText.position.set(enemy.x, enemy.y - enemy.height);
      this.hpTexts.push(hpText);
      this.container.addChild(hpText);
    });
  }

  render(spriteX) {
    this.enemies.forEach((enemy) => {
      const distanceFromPlayer = enemy.melee ? 0 : 200;
      enemy.vx = 0;
      if (enemy.x > spriteX && enemy.x - spriteX > distanceFromPlayer) {
        enemy.vx = -2;
      }
      if (enemy.x < spriteX && spriteX - enemy.x > distanceFromPlayer) {
        enemy.vx = 2;
      }
      enemy.x += enemy.vx;
    });
  }

  checkIfDead() {
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) {
        this.container.removeChild(enemy);
        this.enemies = this.enemies.filter((e) => e !== enemy);
      }
    });
  }
}
*/
