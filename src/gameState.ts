import * as PIXI from 'pixi.js';

import HandleMobile from './mobileDevices/handleMobile';
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

import { getFont1, getFont3, getFont2 } from './objects/textStyles';
import { detectCollision } from './helpers';
import GameObject from './objects/gameObject';
import { TextTypes } from './types';
import Collisions from './collisions';
import HandleEvents from './events';

export default class GameState {
  public player: Player;

  public enemies: Enemy[] = [];

  private bodyguards: Bodyguard[] = [];

  public bullets: Bullet[] = [];

  public bombs: Bomb[] = [];

  public fallingObjects: FallingObject[] = [];

  public cloudSprites: CloudSprite[] = [];

  public cloudLoadTime: number;

  public bombLoadTime: number;

  public displayTexts: Text[] = [];

  public gameObjects: GameObject[] = [];

  private handleKeyboard: HandleKeyboard;

  private handleMobile: HandleMobile;

  private collisions: Collisions;

  private handleEvents: HandleEvents;

  private pauseText: Text;

  public userData: any = {
    isOnMobile: false,
    rendererWidth: 0,
    rendererHeight: 0,
  };

  constructor(
    public container: PIXI.Container,
    public app: PIXI.Application,
    private explosionFrames: Object,
    public sprites: any,
  ) {
    this.userData.rendererWidth = this.app.renderer.view.width;
    this.userData.rendererHeight = this.app.renderer.view.height;
    this.handleKeyboard = new HandleKeyboard(this);
    this.handleMobile = new HandleMobile(this);

    this.collisions = new Collisions(this);
    this.handleEvents = new HandleEvents(this);
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

    this.pauseText = new Text(
      this.userData.rendererWidth / 4,
      this.userData.rendererHeight / 4,
      'Paused',
      getFont2(),
      TextTypes.PAUSE_TEXT,
      this.container,
    );
    this.pauseText.removeFromContainer();

    setInterval(() => {
      if (!this.userData.isPaused) {
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
      }
    }, 2000);
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

  public removeBomb(bomb: Bomb) {
    this.container.removeChild(bomb.sprite);
    setTimeout(() => {
      this.bombs = this.bombs.filter((_bomb: Bomb) => bomb !== _bomb);
    }, 1000);
  }

  private handleGamePause() {
    if (!document.hasFocus() && !this.userData.isPaused) {
      this.userData.isPaused = true;
      this.pauseText.addBackToContainer();
    } else if (document.hasFocus()) {
      this.userData.isPaused = false;
      this.pauseText.removeFromContainer();
    }
  }

  gameLoop(delta: number) {
    this.handleGamePause();
    if (this.userData.isPaused) {
      return;
    }

    this.handleKeyboard.handleKeyboardPress();
    this.handleMobile.handleTouches();

    this.collisions.handleCloudCollision();
    this.collisions.handleFallingObjectCollision();
    this.collisions.handleBulletCollision();
    this.handleEvents.handlePlayerDie();
    this.handleEvents.handleExpiredClouds();
    this.collisions.handleBombCollision();

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
}
