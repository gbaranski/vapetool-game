import * as PIXI from 'pixi.js';
import GameState from './gameState';
import { boxesIntersect } from './helpers';
import { TextTypes } from './types';

export default class Collisions {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public handleBombCollision() {
    this.gameState.container.filters = [];
    this.gameState.bombs.forEach((_bomb) => {
      const blurFilter = new PIXI.filters.BlurFilter();

      _bomb.explosions.forEach((explosion: any) => {
        if (_bomb.exploded && boxesIntersect(this.gameState.player.sprite, explosion)) {
          const vCollision = {
            x: explosion.x - this.gameState.player.sprite.x,
            y: explosion.y - this.gameState.player.sprite.y,
          };
          if (vCollision.x < 0) {
            this.gameState.player.vx = 10;
          } else {
            this.gameState.player.vx = -10;
          }
          this.gameState.player.vy = -20;
          this.gameState.container.filters = [blurFilter];
          blurFilter.blur = 20;
        } else {
          blurFilter.blur = 0;
        }
      });

      if (
        _bomb.sprite.y + _bomb.sprite.height / 2 > this.gameState.userData.rendererHeight &&
        !_bomb.exploded
      ) {
        _bomb.explode(_bomb.sprite.x, _bomb.sprite.y);
        this.gameState.gameObjects = this.gameState.gameObjects.filter((e) => e !== _bomb);
        this.gameState.removeBomb(_bomb);
      }

      this.gameState.enemies.forEach((_enemy) => {
        if (_bomb.created) {
          if (boxesIntersect(_bomb.sprite, _enemy.sprite) && !_bomb.exploded) {
            _bomb.explode(_bomb.sprite.x, _bomb.sprite.y);
            this.gameState.removeBomb(_bomb);
            this.gameState.gameObjects = this.gameState.gameObjects.filter((e) => e !== _bomb);
          }
          _bomb.explosions.forEach((explosion: any) => {
            if (boxesIntersect(explosion, _enemy.sprite)) {
              const vCollision = {
                x: explosion.x - _enemy.sprite.x,
                y: explosion.y - _enemy.sprite.y,
              };
              _enemy.setPushVariable(true);
              if (vCollision.x < 0) {
                _enemy.setVx(5);
              } else {
                _enemy.setVx(-5);
              }
              _enemy.setHp(_enemy.getHp() - 1);
              const checkIfFinishedInterval = setInterval(() => {
                if (_bomb.explodeFinished) {
                  clearInterval(checkIfFinishedInterval);
                  _enemy.setPushVariable(false);
                }
              });
            }
          });
        }
      });
    });
  }

  public handleCloudCollision() {
    this.gameState.cloudSprites.forEach((_cloudSprite) => {
      this.gameState.enemies.forEach((_enemy) => {
        if (boxesIntersect(_cloudSprite.sprite, _enemy.sprite)) {
          _enemy.setHp(_enemy.getHp() - 1);
        }
      });
    });
  }

  public handleBulletCollision() {
    this.gameState.bullets.forEach((_bullet) => {
      if (boxesIntersect(this.gameState.player.sprite, _bullet.sprite)) {
        this.gameState.player.setHp(this.gameState.player.getHp() - 10);
        this.gameState.bullets = this.gameState.bullets.filter((e) => e !== _bullet);
        this.gameState.container.removeChild(_bullet.sprite);
        this.gameState.displayTexts
          .find((text) => text.textType === TextTypes.PLAYER_HP_TEXT)
          .updateText(`HP: ${this.gameState.player.getHp()}`);
      } else if (
        _bullet.sprite.x < 0 ||
        _bullet.sprite.x > this.gameState.userData.rendererWidth ||
        _bullet.sprite.y < 0 ||
        _bullet.sprite.y > this.gameState.userData.rendererHeight
      ) {
        this.gameState.bullets = this.gameState.bullets.filter((e) => e !== _bullet);
        this.gameState.gameObjects = this.gameState.gameObjects.filter((e) => e !== _bullet);
        this.gameState.container.removeChild(_bullet.sprite);
      }
      this.gameState.bodyguards.forEach((_bodyguard) => {
        if (boxesIntersect(_bodyguard.sprite, _bullet.sprite)) {
          _bodyguard.setHp(_bodyguard.getHp() - 10);
          this.gameState.bullets = this.gameState.bullets.filter((e) => e !== _bullet);
          this.gameState.container.removeChild(_bullet.sprite);
          _bodyguard.updateHpText();
        }
      });
    });
  }

  public handleFallingObjectCollision() {
    this.gameState.fallingObjects.forEach((_fallingObject) => {
      if (boxesIntersect(this.gameState.player.sprite, _fallingObject.sprite)) {
        this.gameState.displayTexts
          .find((element) => element.textType === TextTypes.SCORE_TEXT)
          .updateText(`Score: ${this.gameState.player.score + 10}ml`);
        this.gameState.container.removeChild(_fallingObject.sprite);
        this.gameState.fallingObjects = this.gameState.fallingObjects.filter(
          (e) => e !== _fallingObject,
        );
        this.gameState.gameObjects = this.gameState.gameObjects.filter(
          (obj) => obj !== _fallingObject,
        );
      }
    });
  }

  public handleShopCollision() {
    if (boxesIntersect(this.gameState.player.sprite, this.gameState.shop.sprite)) {
      if (
        this.gameState.shop.sprite.y - this.gameState.player.sprite.y >
        this.gameState.shop.sprite.height / 8
      ) {
        this.gameState.player.pushPlayer(0, -10);
      } else {
        this.gameState.player.pushPlayer(10, 0);
      }
    }
  }
}
