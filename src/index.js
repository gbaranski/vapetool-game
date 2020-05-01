class Bunny {
  constructor(loader) {
    loader.load((loader, resources) => {
      this.sprite = new PIXI.Sprite(resources.bunny.texture)
    });
    this.jumping = false;
    this.flipping = false;
    this.flipVelocity = 0;
    this.friction = 0.5;
    this.ax = 0;
    this.axErrorMargin = 0.1;
  }
  create() {
    this.sprite.x = app.renderer.view.width / 2;
    this.sprite.y = app.renderer.view.height - this.sprite.height;
    this.sprite.vx = 0;
    this.sprite.vy = 0;
    container.addChild(this.sprite);
  }
  jump() {
    this.sprite.vy = -10;
  }
  checkIfOnGround() {
    return this.sprite.y === app.renderer.view.height - this.sprite.height;
  }
  canMoveRight(){
      return this.sprite.vx < 10 && this.ax > 0
  }
  canMoveLeft(){
    return this.sprite.vx > -10 && this.ax < 0
}
  handlePhysics(gravity) {
    if(this.checkIfOnGround()) {
        this.friction = 0.5;
    } else {
        this.friction = 0.1;
    }
    if (this.canMoveRight()) {
      this.sprite.vx += this.ax - this.friction;
    }
    if (this.canMoveLeft()) {
      this.sprite.vx += this.ax + this.friction;
    }
    if (this.ax === 0) {
      if (this.sprite.vx > 0) {
        this.sprite.vx -= this.friction;
        if(this.sprite.vx < this.axErrorMargin) {
          this.sprite.vx = 0;
        }
      } else if (this.sprite.vx < 0) {
        this.sprite.vx += this.friction;
        if(this.sprite.vx > this.axErrorMargin) {
          this.sprite.vx = 0;
        }
      }
    }
    this.sprite.x += this.sprite.vx;
    this.sprite.y += this.sprite.vy;
    this.sprite.y = Math.min(
      this.sprite.y,
      app.renderer.view.height - this.sprite.height
    );
    if (this.sprite.y <= app.renderer.view.height - this.sprite.height) {
      this.sprite.vy += gravity;
    } else {
      this.sprite.vy = 0;
    }
    this.ax = Math.floor(this.ax);
  }
  handleFlips() {
    if (this.sprite.vx > 0 && this.flipping == false) {
      this.flipVelocity = 10;
    } else if (this.flipping == false) {
      this.flipVelocity = -10;
    }
    if (this.flipping) {
      this.sprite.angle += this.flipVelocity;
      if (Math.abs(this.sprite.angle) > 360) {
        this.flipping = false;
        this.sprite.angle = 0;
      }
    }
  }
}

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

class DisplayText {
  constructor() {
    this.scoreText;
    this.score = 0;
    this.style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "white",
      stroke: "#ff3300",
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });
  }
  updateScoreText() {
    container.removeChild(this.scoreText);
    this.scoreText = new PIXI.Text(`Score: ${this.score}ml`, this.style);
    this.scoreText.position.set(0, 0);
    container.addChild(this.scoreText);
  }
  addScore(amount) {
    this.score += amount;
    this.updateScoreText();
  }
  addCenterText(text) {
    this.scoreText = new PIXI.Text(text, this.style);
    this.scoreText.position.set(
      app.renderer.view.width / 2,
      app.renderer.height / 2
    );
    container.addChild(this.scoreText);
  }
}

class GameState {
  constructor(bunny, fallingObject, displayText) {
    this.bunny = bunny;
    this.fallingObject = fallingObject;
    this.displayText = displayText;
    this.gravity = 0.5;
    this.handleKeyboardPress();
  }
  gameLoop() {
    console.log(this.bunny.sprite.vx);
    this.bunny.handlePhysics(this.gravity);
    this.bunny.handleFlips();
    this.fallingObject.handleFallingObjectsPhysics(this.bunny.sprite, this.displayText);
  }


  handleKeyboardPress() {
    let keyA = this.keyboard("a");
    keyA.press = () => {
      this.bunny.ax = -1;
    };
    keyA.release = () => {
      this.bunny.ax = 0;
    };

    let keyD = this.keyboard("d");
    keyD.press = () => {
      this.bunny.ax = 1;
    };
    keyD.release = () => {
      this.bunny.ax = 0;
    };

    let keyW = this.keyboard("w");
    keyW.press = () => {
      this.bunny.jump();
    };
    let keySpace = this.keyboard(" ");
    keySpace.press = () => {
      this.bunny.flipping = true;
    };
  }
  keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    key.downHandler = (event) => {
      if (event.key === key.value) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };
    key.upHandler = (event) => {
      if (event.key === key.value) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    return key;
  }
}

function hitTestRectangle(r1, r2) {
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  hit = false;
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }
  return hit;
}

const app = new PIXI.Application({
  width: $(window).width(),
  height: $(window).height(),
  backgroundColor: 0x1099bb,
  resolution: 1,
});

const container = new PIXI.Container();

$(document).ready(function () {
  const loader = PIXI.Loader.shared;
  loader.add('bunny', 'src/assets/bunny.png');
  loader.add('fallingObject', 'src/assets/eliquid.png');
  const bunny = new Bunny(loader);
  const fallingObject = new FallingObject(loader);
  const displayText = new DisplayText();
  const gameState = new GameState(bunny, fallingObject, displayText);
  document.body.appendChild(app.view);
  app.stage.addChild(container);
      loader.onComplete.add(() => {
        fallingObject.create();
        bunny.create();
        displayText.updateScoreText();
        app.ticker.add((delta) => gameState.gameLoop(delta));
    });
});
