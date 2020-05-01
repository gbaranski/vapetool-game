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
    handleFallingObjectsPhysics(sprite, displayText) {
      this.fallingObjects.forEach((element) => {
        if (element.y <= app.renderer.view.height - element.height) {
          element.y += element.vy;
        }
        if (hitTestRectangle(sprite, element)) {
          displayText.addScore(10);
          container.removeChild(element);
          this.fallingObjects = this.fallingObjects.filter(
            (e) => e !== element
          );
        }
      });
    }
  }