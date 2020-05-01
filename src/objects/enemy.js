class Enemy {
  constructor(loader) {
    loader.load((loader, resources) => {
      this.sprite = new PIXI.Sprite(resources.enemy.texture);
    });
  }
  create() {
    this.sprite.scale.x = 0.1;
    this.sprite.scale.y = 0.1;
    this.sprite.x = app.renderer.view.width / 2;
    this.sprite.y = app.renderer.view.height - this.sprite.height;
    container.addChild(this.sprite);
  }
}
