import * as PIXI from 'pixi.js';

import MobileTouch from './mobileDevices/index';
import HandleKeyboard from './handleKeyboard';

import Player from './objects/player';
import Enemy from './objects/enemy';
import Bullet from './objects/bullet';
import Bomb from './objects/bomb';
import FallingObject from './objects/fallingObject';
import Text from './objects/text';
import CloudSprite from './objects/cloudSprite';
// import Wall from './objects/wall';
import Bodyguard from './objects/bodyguard';

import { getFont1, getFont2, getFont3 } from './objects/textStyles';
import { boxesIntersect, detectCollision } from './helpers';
import GameObject from './objects/gameObject';
import { TextTypes, ButtonTypes } from './types';
import Button from './objects/button';

export default class GameState {
  public player: Player;

  private enemies: Enemy[] = [];

  private bodyguards: Bodyguard[] = [];

  private bullets: Bullet[] = [];

  private bombs: Bomb[] = [];

  private fallingObjects: FallingObject[] = [];

  private cloudSprites: CloudSprite[] = [];

  private buttons: Button[] = [];

  public cloudLoadTime: number;

  public bombLoadTime: number;

  private displayTexts: Text[] = [];

  private gameObjects: GameObject[] = [];

  private handleKeyboard: HandleKeyboard;

  private mobileTouch: MobileTouch;

  private userData: any = {
    isOnMobile: false,
    rendererWidth: 0,
    rendererHeight: 0,
  };

  private buttonStates: any = {
    bombButton: false,
    cloudButton: false,
  };

  private topPressLastDate: number;

  constructor(
    private container: PIXI.Container,
    private app: PIXI.Application,
    private explosionFrames: Object,
    private sprites: any,
  ) {
    this.userData.rendererWidth = this.app.renderer.view.width;
    this.userData.rendererHeight = this.app.renderer.view.height;
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    ) {
      this.userData.isOnMobile = true;

      const bombButton = new Button(
        ButtonTypes.BOMB,
        this.sprites.bombButton,
        this.userData.rendererWidth - this.sprites.bombButton.width,
        0,
        this.container,
      );
      bombButton.sprite.on('touchstart', () => {
        this.buttonStates.bombButton = true;
        this.bombLoadTime = new Date().getTime();
      });
      bombButton.sprite.on('touchend', () => {
        this.buttonStates.bombButton = false;
        this.throwBomb();
      });

      this.buttons.push(bombButton);

      const cloudButton = new Button(
        ButtonTypes.CLOUD,
        this.sprites.cloudButton,
        this.userData.rendererWidth -
          this.sprites.bombButton.width -
          this.sprites.cloudButton.width,
        0,
        this.container,
      );
      cloudButton.sprite.on('touchstart', () => {
        this.buttonStates.cloudButton = true;
        this.cloudLoadTime = new Date().getTime();
      });
      cloudButton.sprite.on('touchend', () => {
        this.buttonStates.cloudButton = false;
        this.attackCloud();
      });
    } else {
      this.userData.isOnMobile = false;
    }
    this.mobileTouch = new MobileTouch();

    this.player = new Player(
      this.sprites.player,
      this.userData.rendererWidth,
      this.userData.rendererHeight,
      this.container,
    );
    this.gameObjects.push(this.player);

    const fallingObject = new FallingObject(
      this.sprites.fallingObject,
      this.userData.rendererWidth,
      this.userData.rendererHeight,
      this.container,
    );

    this.gameObjects.push(fallingObject);
    this.fallingObjects.push(fallingObject);

    this.createNewEnemy();

    this.displayTexts.push(
      new Text(0, 0, `HP: ${this.player.getHp()}`, getFont1(), TextTypes.HP_TEXT, this.container),
    );
    this.displayTexts.push(
      new Text(
        0,
        40,
        `Score: ${this.player.score}ml`,
        getFont1(),
        TextTypes.SCORE_TEXT,
        this.container,
      ),
    );

    this.displayTexts.push(
      new Text(0, 80, `Loading...`, getFont3(), TextTypes.DEBUG_TEXT, this.container),
    );

    setInterval(() => {
      this.enemies.forEach((_enemy) => {
        const bullet = new Bullet(
          this.sprites.bullet,
          this.userData.rendererWidth,
          this.userData.rendererHeight,
          this.container,
          _enemy.sprite.x + _enemy.sprite.width / 2,
          _enemy.sprite.y,
          this.player.sprite.x,
          this.player.sprite.y,
        );
        this.bullets.push(bullet);
      });
    }, 2000);

    this.handleKeyboard = new HandleKeyboard(this);
  }

  public createNewEnemy() {
    const enemy = new Enemy(
      this.sprites.enemy,
      this.userData.rendererWidth,
      this.userData.rendererHeight,
      this.container,
    );
    this.enemies.push(enemy);
    this.gameObjects.push(enemy);
  }

  public createNewBodyguard() {
    const bodyguard = new Bodyguard(
      this.sprites.bodyguard,
      this.userData.rendererWidth,
      this.userData.rendererHeight,
      this.container,
    );

    this.bodyguards.push(bodyguard);
    this.gameObjects.push(bodyguard);
  }

  private handleFallingObjectCollision() {
    this.fallingObjects.forEach((_fallingObject) => {
      if (boxesIntersect(this.player.sprite, _fallingObject.sprite)) {
        this.displayTexts
          .find((element) => element.textType === TextTypes.SCORE_TEXT)
          .updateText(`Score: ${this.player.score + 10}ml`);
        this.container.removeChild(_fallingObject.sprite);
        this.fallingObjects = this.fallingObjects.filter((e) => e !== _fallingObject);
        this.gameObjects = this.gameObjects.filter((obj) => obj !== _fallingObject);
      }
    });
  }

  private handleBulletCollision() {
    this.bullets.forEach((_bullet) => {
      if (boxesIntersect(this.player.sprite, _bullet.sprite)) {
        this.player.setHp(this.player.getHp() - 10);
        this.bullets = this.bullets.filter((e) => e !== _bullet);
        this.container.removeChild(_bullet.sprite);
        this.displayTexts
          .find((text) => text.textType === TextTypes.HP_TEXT)
          .updateText(`HP: ${this.player.getHp()}`);
      } else if (
        _bullet.sprite.x < 0 ||
        _bullet.sprite.x > this.userData.rendererWidth ||
        _bullet.sprite.y < 0 ||
        _bullet.sprite.y > this.userData.rendererHeight
      ) {
        this.bullets = this.bullets.filter((e) => e !== _bullet);
        this.gameObjects = this.gameObjects.filter((e) => e !== _bullet);
        this.container.removeChild(_bullet.sprite);
      }
    });
  }

  private handleCloudCollision() {
    this.cloudSprites.forEach((_cloudSprite) => {
      this.enemies.forEach((_enemy) => {
        if (boxesIntersect(_cloudSprite.sprite, _enemy.sprite)) {
          _enemy.setHp(_enemy.getHp() - 1);
        }
      });
    });
  }

  private removeBomb(bomb: Bomb) {
    this.container.removeChild(bomb.sprite);
    setTimeout(() => {
      this.bombs = this.bombs.filter((_bomb: Bomb) => bomb !== _bomb);
    }, 1000);
  }

  private handleBombCollision() {
    this.container.filters = [];
    this.bombs.forEach((_bomb) => {
      const blurFilter = new PIXI.filters.BlurFilter();

      _bomb.explosions.forEach((explosion: any) => {
        if (_bomb.exploded && boxesIntersect(this.player.sprite, explosion)) {
          const vCollision = {
            x: explosion.x - this.player.sprite.x,
            y: explosion.y - this.player.sprite.y,
          };
          if (vCollision.x < 0) {
            this.player.vx = 10;
          } else {
            this.player.vx = -10;
          }
          this.player.vy = -20;
          this.container.filters = [blurFilter];
          blurFilter.blur = 20;
        } else {
          blurFilter.blur = 0;
        }
      });

      if (
        _bomb.sprite.y + _bomb.sprite.height / 2 > this.userData.rendererHeight &&
        !_bomb.exploded
      ) {
        _bomb.explode(_bomb.sprite.x, _bomb.sprite.y);
        this.gameObjects = this.gameObjects.filter((e) => e !== _bomb);
        this.removeBomb(_bomb);
      }

      this.enemies.forEach((_enemy) => {
        if (_bomb.created) {
          if (boxesIntersect(_bomb.sprite, _enemy.sprite) && !_bomb.exploded) {
            _bomb.explode(_bomb.sprite.x, _bomb.sprite.y);
            this.removeBomb(_bomb);
            this.gameObjects = this.gameObjects.filter((e) => e !== _bomb);
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

  private handlePlayerDie() {
    if (this.player.getHp() <= 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const deathText = new Text(
        this.userData.rendererWidth / 4,
        this.userData.rendererHeight / 4,
        `
        You're dead\n
        Score: ${this.player.score}ml
        `,
        getFont2(),
        TextTypes.DEATH_TEXT,
        this.container,
      );
      this.app.ticker.stop();
    }
  }

  private handleExpiredClouds() {
    this.cloudSprites.forEach((_cloudSprite) => {
      _cloudSprite.handlePhysics();
      if (_cloudSprite.sprite.scale.x < 0.1) {
        this.container.removeChild(_cloudSprite.sprite);
        this.cloudSprites = this.cloudSprites.filter((e) => e !== _cloudSprite);
        this.gameObjects = this.gameObjects.filter((e) => e !== _cloudSprite);
      }
    });
  }

  gameLoop(delta: number) {
    this.handleKeyboard.handleKeyboardPress();
    this.handleTouches();

    this.handleCloudCollision();
    this.handleFallingObjectCollision();
    this.handleBulletCollision();
    this.handlePlayerDie();
    this.handleExpiredClouds();
    this.handleBombCollision();

    this.handleGravity(delta);
    this.handlePhysics();

    detectCollision(this.gameObjects); // TODO consider reordering
    this.update(delta);

    HandleKeyboard.update();

    this.draw(delta);
  }

  handleGravity(delta: number) {
    this.gameObjects.forEach((obj) => {
      if (obj.sprite.y < this.userData.rendererHeight - obj.sprite.height * obj.sprite.anchor.y) {
        obj.handleGravity(delta);
      } else {
        obj.preventFalling();
        obj.setSpriteY(this.userData.rendererHeight - obj.sprite.height * obj.sprite.anchor.y);
      }
    });
  }

  handlePhysics() {
    this.bombs.forEach((_bomb) => {
      if (_bomb.created) {
        _bomb.handlePhysics();
      }
    });
    this.player.handlePhysics();
    this.bullets.forEach((_bullet) => {
      _bullet.handlePhysics();
    });

    this.cloudSprites.forEach((_cloudSprite) => {
      _cloudSprite.handlePhysics();
    });
    this.enemies.forEach((_enemy) => {
      _enemy.updateHpText();
      if (_enemy.checkIfDead()) {
        this.container.removeChild(_enemy.sprite);
        this.container.removeChild(_enemy.hpText);
        this.enemies = this.enemies.filter((e) => e !== _enemy);
        this.gameObjects = this.gameObjects.filter((e) => e !== _enemy);
      }
      let closestObjectX: number = 0;
      this.bodyguards.forEach((_bodyguard) => {
        if (_bodyguard.sprite.x > closestObjectX) {
          closestObjectX = _bodyguard.sprite.x;
        }
      });
      if (this.player.sprite.x > closestObjectX) {
        closestObjectX = this.player.sprite.x;
      }
      _enemy.targetEnemy(closestObjectX);
    });
    this.bodyguards.forEach((bodyguard) => {
      bodyguard.updateHpText();
      if (bodyguard.checkIfDead()) {
        this.container.removeChild(bodyguard.sprite);
        this.container.removeChild(bodyguard.hpText);
        this.bodyguards = this.bodyguards.filter((e) => e !== bodyguard);
        this.gameObjects = this.gameObjects.filter((e) => e !== bodyguard);
      }
    });

    this.gameObjects.forEach((gameObject) => gameObject.handlePhysics());
  }

  update(delta: number) {
    this.gameObjects.forEach((obj) => obj.update(delta));
  }

  draw(delta: number) {
    this.gameObjects.forEach((_gameObject) => {
      _gameObject.draw();
    });
    this.displayTexts
      .find((text) => text.textType === TextTypes.DEBUG_TEXT)
      .updateText(
        `x: ${this.player.sprite.x}\n` +
          `y: ${this.player.sprite.y}\n` +
          `vx: ${this.player.getVx()}\n` +
          `vy: ${this.player.getVy()}\n` +
          `friction: ${this.player.getFriction()}\n` +
          `ax: ${this.player.getAx()}\n` +
          `delta: ${delta}\n` +
          `bullets: ${this.bullets.length}\n` +
          `bombs: ${this.bombs.length}\n`,
      );
    this.bodyguards.forEach((_bodyguard) => {
      if (this.enemies.length > 0) {
        _bodyguard.render(this.enemies[0].sprite.x);
        _bodyguard.updateHpText();
      }
    });
  }

  throwBomb() {
    const timeDifference = new Date().getTime() - this.bombLoadTime;
    const vx = this.player.checkIfBunnyGoRight() ? 10 : -10;
    const vy = -Math.abs(timeDifference / 20);
    const bomb = new Bomb(
      this.sprites.bomb,
      this.explosionFrames,
      this.player.sprite.x,
      this.player.sprite.y,
      vx,
      vy,
      timeDifference,
      this.container,
    );
    this.gameObjects.push(bomb);
    this.bombs.push(bomb);
  }

  attackCloud() {
    const cloud = new CloudSprite(this.sprites.cloud);
    const timeDifference = new Date().getTime() - this.cloudLoadTime;
    cloud.attackCloud(
      this.player.checkIfBunnyGoRight(),
      timeDifference,
      this.player.sprite.x,
      this.player.sprite.y,
      this.container,
    );
    this.cloudSprites.push(cloud);
    setTimeout(() => {
      cloud.shouldRemoveCloudSprite = true;
    }, timeDifference);
  }

  handleTouches() {
    if (this.userData.isOnMobile) {
      const touches = this.mobileTouch.getCurrentTouches();
      if (touches) {
        if (touches.length < 1) {
          this.player.setAx(0);
        }
        for (let i = 0; i < touches.length; i += 1) {
          if (
            touches[i].clientX > this.userData.rendererWidth / 2 &&
            touches[i].clientY > this.userData.rendererHeight / 2
          ) {
            this.player.setAx(1);
            this.player.setLastMoveRight(true);
          } else if (touches[i].clientY > this.userData.rendererHeight / 2) {
            this.player.setAx(-1);
            this.player.setLastMoveRight(false);
          }
          if (
            touches[i].clientY < this.userData.rendererHeight / 2 &&
            !this.buttonStates.bombButton &&
            !this.buttonStates.cloudButton
          ) {
            if (
              new Date().getTime() - this.topPressLastDate > 20 &&
              new Date().getTime() - this.topPressLastDate < 500
            ) {
              this.player.setFlipping(true);
            }
            this.player.jump();
            this.topPressLastDate = new Date().getTime();
          }
        }
      }
    }
  }
}
