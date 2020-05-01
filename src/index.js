function keyboard(value) {
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


class GameState {
  constructor(player, fallingObject, displayText) {
    this.player = player;
    this.fallingObject = fallingObject;
    this.displayText = displayText;
    this.gravity = 0.5;
    this.handleKeyboardPress();
  }
  gameLoop() {
    console.log(this.player.sprite.vx);
    this.player.handlePhysics(this.gravity);
    this.player.handleFlips();
    this.fallingObject.handleFallingObjectsPhysics(this.player.sprite, this.displayText);
  }

  handleKeyboardPress() {
    let keyA = keyboard("a");
    keyA.press = () => {
      this.player.ax = -1;
    };
    keyA.release = () => {
      this.player.ax = 0;
    };

    let keyD = keyboard("d");
    keyD.press = () => {
      this.player.ax = 1;
    };
    keyD.release = () => {
      this.player.ax = 0;
    };

    let keyW = keyboard("w");
    keyW.press = () => {
      this.player.jump();
    };
    let keySpace = keyboard(" ");
    keySpace.press = () => {
      this.player.flipping = true;
    };
  }
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
  loader.add('player', 'src/assets/bunny.png');
  loader.add('fallingObject', 'src/assets/eliquid.png');
  const player = new Player(loader);
  const fallingObject = new FallingObject(loader);
  const displayText = new DisplayText();
  const gameState = new GameState(player, fallingObject, displayText);
  document.body.appendChild(app.view);
  app.stage.addChild(container);
      loader.onComplete.add(() => {
        fallingObject.create();
        player.create();
        displayText.updateScoreText();
        app.ticker.add((delta) => gameState.gameLoop(delta));
    });
});
