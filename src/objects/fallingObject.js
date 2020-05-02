class FallingObject {
  constructor(loader) {
    loader.load((loader, resources) => {
      this.texture = new PIXI.Texture(resources.fallingObject.texture);
    });
    this.fallingObjects = [];
    this.objectGravity = 3;
  }
  create() {
    for (let i = 0; i < 2; i++) {
      this.fallingObjects[i] = new PIXI.Sprite(this.texture);
      this.fallingObjects[i].scale.x = 0.1;
      this.fallingObjects[i].scale.y = 0.1;
      this.fallingObjects[i].x = Math.floor(Math.random() * app.renderer.width);
      this.fallingObjects[i].y = 0;
      this.fallingObjects[i].vy = this.objectGravity;
      container.addChild(this.fallingObjects[i]);
    }
  }
  handlePhysics(sprite, displayText) {
    this.fallingObjects.forEach((element) => {
      if (element.y <= app.renderer.view.height - element.height) {
        element.y += element.vy;
      }
    });
  }
}
