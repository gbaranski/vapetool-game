import Keyboard from 'pixi.js-keyboard';
import GameState from './gameState';

export default class HandleKeyboard {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  private canCreateBodyguard = true;

  private canCreateEnemy = true;

  public handleKeyboardPress() {
    if (Keyboard.isKeyDown('ArrowLeft', 'KeyA')) {
      this.gameState.player.setAx(-1);
      this.gameState.player.setLastMoveRight(false);
    }
    if (Keyboard.isKeyReleased('ArrowLeft', 'KeyA')) {
      this.gameState.player.setAx(0);
    }
    if (Keyboard.isKeyDown('ArrowRight', 'KeyD')) {
      this.gameState.player.setAx(1);
      this.gameState.player.setLastMoveRight(true);
    }
    if (Keyboard.isKeyReleased('ArrowRight', 'KeyD')) {
      this.gameState.player.setAx(0);
    }
    if (Keyboard.isKeyDown('ArrowUp', 'KeyW')) {
      this.gameState.player.jump();
    }
    if (Keyboard.isKeyDown('Digit1') && this.canCreateBodyguard) {
      this.canCreateBodyguard = false;
      this.gameState.createNewBodyguard();
    }
    if (Keyboard.isKeyReleased('Digit1')) {
      this.canCreateBodyguard = true;
    }
    if (Keyboard.isKeyDown('Digit2') && this.canCreateEnemy) {
      this.canCreateEnemy = false;
      this.gameState.createNewEnemy();
    }
    if (Keyboard.isKeyReleased('Digit2')) {
      this.canCreateEnemy = true;
    }
    if (Keyboard.isKeyDown('Space')) {
      this.gameState.player.setFlipping(true);
    }
    if (Keyboard.isKeyPressed('KeyE')) {
      this.gameState.cloudLoadTime = new Date().getTime();
    }

    if (Keyboard.isKeyReleased('KeyE')) {
      this.gameState.attackCloud();
    }

    if (Keyboard.isKeyPressed('KeyQ')) {
      this.gameState.bombLoadTime = new Date().getTime();
    }

    if (Keyboard.isKeyReleased('KeyQ')) {
      this.gameState.throwBomb();
    }
  }

  static update() {
    Keyboard.update();
  }
}
