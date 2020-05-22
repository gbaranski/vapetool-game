import GameState from '../gameState';
import Button from '../objects/button';
import { ButtonTypes } from '../types';
import MobileTouch from '.';

export default class HandleMobile {
  private gameState: GameState;

  private mobileTouch: MobileTouch;

  private buttons: Button[] = [];

  private buttonStates: any = {
    bombButton: false,
    cloudButton: false,
  };

  private topPressLastDate: number;

  constructor(gameState: GameState) {
    this.gameState = gameState;

    this.mobileTouch = new MobileTouch();

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    ) {
      this.gameState.userData.isOnMobile = true;

      const bombButton = new Button(
        ButtonTypes.BOMB,
        this.gameState.sprites.bombButton,
        this.gameState.userData.rendererWidth - this.gameState.sprites.bombButton.width,
        0,
        this.gameState.container,
      );
      bombButton.sprite.on('touchstart', () => {
        this.buttonStates.bombButton = true;
        this.gameState.bombLoadTime = new Date().getTime();
      });
      bombButton.sprite.on('touchend', () => {
        this.buttonStates.bombButton = false;
        this.gameState.throwBomb();
      });

      this.buttons.push(bombButton);

      const cloudButton = new Button(
        ButtonTypes.CLOUD,
        this.gameState.sprites.cloudButton,
        this.gameState.userData.rendererWidth -
          this.gameState.sprites.bombButton.width -
          this.gameState.sprites.cloudButton.width,
        0,
        this.gameState.container,
      );
      cloudButton.sprite.on('touchstart', () => {
        this.buttonStates.cloudButton = true;
        this.gameState.cloudLoadTime = new Date().getTime();
      });
      cloudButton.sprite.on('touchend', () => {
        this.buttonStates.cloudButton = false;
        this.gameState.attackCloud();
      });
    } else {
      this.gameState.userData.isOnMobile = false;
    }
  }

  handleTouches() {
    if (this.gameState.userData.isOnMobile) {
      const touches = this.mobileTouch.getCurrentTouches();
      if (touches) {
        if (touches.length < 1) {
          this.gameState.player.setAx(0);
        }
        for (let i = 0; i < touches.length; i += 1) {
          if (
            touches[i].clientX > this.gameState.userData.rendererWidth / 2 &&
            touches[i].clientY > this.gameState.userData.rendererHeight / 2
          ) {
            this.gameState.player.setAx(1);
            this.gameState.player.setLastMoveRight(true);
          } else if (touches[i].clientY > this.gameState.userData.rendererHeight / 2) {
            this.gameState.player.setAx(-1);
            this.gameState.player.setLastMoveRight(false);
          }
          if (
            touches[i].clientY < this.gameState.userData.rendererHeight / 2 &&
            !this.buttonStates.bombButton &&
            !this.buttonStates.cloudButton
          ) {
            if (
              new Date().getTime() - this.topPressLastDate > 20 &&
              new Date().getTime() - this.topPressLastDate < 500
            ) {
              this.gameState.player.setFlipping(true);
            }
            this.gameState.player.jump();
            this.topPressLastDate = new Date().getTime();
          }
        }
      }
    }
  }
}
