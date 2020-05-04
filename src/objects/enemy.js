class Enemy {
  constructor(loader) {
    loader.load((loader, resources) => {
      this.texture = new PIXI.Texture(resources.enemy.texture);
    });
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
    enemy.x = Math.floor(Math.random() * Math.floor(app.renderer.view.width));
    enemy.y = app.renderer.view.height - enemy.height / 2;
    enemy.anchor.set(0.5);
    this.enemies.push(enemy);
    container.addChild(enemy);
  }
  printHpText() {
    this.hpTexts.forEach((hpText) => {
      container.removeChild(hpText);
    });
    this.enemies.forEach((enemy) => {
      const hpText = new PIXI.Text(enemy.hp, this.hpTextStyle);
      hpText.position.set(enemy.x, enemy.y - enemy.height);
      this.hpTexts.push(hpText);
      container.addChild(hpText);
    });
  }
  checkIfDead() {
    this.enemies.forEach((enemy) => {
      if(enemy.hp <= 0) {
        container.removeChild(enemy);
        this.enemies = this.enemies.filter(
          (e) => e !== enemy);
      }
    });
  }
}
