class Enemy {
  constructor(loader) {
    loader.load((loader, resources) => {
      this.texture = new PIXI.Texture(resources.enemy.texture);
    });
    this.enemies = [];
  }
  create() {
    let enemy = new PIXI.Sprite(this.texture);
    enemy.scale.x = 0.1;
    enemy.scale.y = 0.1;
    enemy.x = Math.floor(Math.random() * Math.floor(app.renderer.view.width));
    enemy.y = app.renderer.view.height - enemy.height;
    this.enemies.push(enemy);
    container.addChild(enemy);
  }
}
