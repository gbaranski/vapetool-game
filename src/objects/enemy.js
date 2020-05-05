import * as PIXI from 'pixi.js'
export default class Enemy {
  constructor(loader, rendererWidth, rendererHeight, container) {
    loader.load((loader, resources) => {
      this.texture = new PIXI.Texture(resources.enemy.texture);
    });
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;

    this.container = container;
  
    this.enemies = [];
    this.hpTexts = [];
    this.hpTextStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "white",
      stroke: "#ff3300",
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });
  }
  create() {
    let enemy = new PIXI.Sprite(this.texture);
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
      const hpText = new PIXI.Text(Math.floor(enemy.hp), this.hpTextStyle);
      hpText.position.set(enemy.x, enemy.y - enemy.height);
      this.hpTexts.push(hpText);
      this.container.addChild(hpText);
    });
  }
  render(spriteX) {
    this.enemies.forEach(enemy => {
      const distanceFromPlayer = enemy.melee ? 0 : 200;
      enemy.vx = 0;
      if(enemy.x > spriteX && enemy.x - spriteX > distanceFromPlayer) {
        enemy.vx = -2;
      }
      if(enemy.x < spriteX && spriteX - enemy.x > distanceFromPlayer) {
        enemy.vx = 2;
      }
      enemy.x += enemy.vx;
    });
  }
  checkIfDead() {
    this.enemies.forEach((enemy) => {
      if(enemy.hp <= 0) {
        this.container.removeChild(enemy);
        this.enemies = this.enemies.filter(
          (e) => e !== enemy);
      }
    });
  }
}
