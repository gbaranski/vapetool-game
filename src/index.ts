import * as PIXI from 'pixi.js';
import $ from 'jquery';
import Keyboard from 'pixi.js-keyboard';
import Player from './objects/player';
import Enemy from './objects/enemy';
import Bullet from './objects/bullet';
import Bomb from './objects/bomb';
import FallingObject from './objects/fallingObject';
import DisplayText from './objects/displayText';
import CloudSprite from './objects/cloudSprite';

import playerImg from './assets/bunny.png';
import enemyImg from './assets/police.png';
import fallingObjectImg from './assets/eliquid.png';
import bulletImg from './assets/bullet.png';
import cloudImg from './assets/cloud.png';
import bombImg from './assets/efest.png';
// eslint-disable-next-line import/no-unresolved
import explosions from './assets/explosion/*.png';

function boxesIntersect(a: PIXI.Sprite, b: PIXI.Sprite) {
  const ab = a.getBounds();
  const bb = b.getBounds();
  return (
    ab.x + ab.width > bb.x &&
    ab.x < bb.x + bb.width &&
    ab.y + ab.height > bb.y &&
    ab.y < bb.y + bb.height
  );
}

class GameState {
  private player: Player;

  private enemies: Enemy[] = [];

  private bullets: Bullet[] = [];

  private bombs: Bomb[] = [];

  private fallingObjects: FallingObject[] = [];

  private cloudSprites: CloudSprite[] = [];

  private displayText: DisplayText;

  private container: PIXI.Container;

  private gravity: number;

  private shootInterval: NodeJS.Timeout;

  private cloudLoadTime: number;

  private bombLoadTime: number;

  private rendererWidth: number;

  private rendererHeight: number;

  private ticker: PIXI.Ticker;

  private explosionFrames: Object;

  private loader: PIXI.Loader;

  constructor(
    player: Player,
    fallingObject: FallingObject,
    displayText: DisplayText,
    container: PIXI.Container,
    rendererWidth: number,
    rendererHeight: number,
    ticker: PIXI.Ticker,
    explosionFrames: Object,
    loader: PIXI.Loader,
  ) {
    this.player = player;
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;
    this.ticker = ticker;
    this.explosionFrames = explosionFrames;
    this.loader = loader;

    this.fallingObjects.push(fallingObject);

    this.displayText = displayText;

    this.container = container;

    this.gravity = 1;

    this.handleKeyboardPress();

    const enemy = new Enemy(loader, this.rendererWidth, this.rendererHeight, container);
    this.enemies.push(enemy);

    this.shootInterval = setInterval(() => {
      this.enemies.forEach((_enemy) => {
        const bullet = new Bullet(
          loader,
          rendererWidth,
          rendererHeight,
          container,
          _enemy.sprite.x + _enemy.sprite.width / 2,
          _enemy.sprite.y,
          this.player.sprite.x,
          this.player.sprite.y,
        );
        this.bullets.push(bullet);
      });
    }, 2000);
  }

  private handleFallingObjectCollision() {
    this.fallingObjects.forEach((_fallingObject) => {
      if (boxesIntersect(this.player.sprite, _fallingObject.sprite)) {
        this.displayText.addScore(10);
        this.container.removeChild(_fallingObject.sprite);
        this.fallingObjects = this.fallingObjects.filter((e) => e !== _fallingObject);
      }
    });
  }

  private handleBulletCollision() {
    this.bullets.forEach((_bullet) => {
      if (boxesIntersect(this.player.sprite, _bullet.sprite)) {
        this.player.setHp(this.player.getHp() - 10);
        this.bullets = this.bullets.filter((e) => e !== _bullet);
        this.container.removeChild(_bullet.sprite);
        this.displayText.setHp(this.player.getHp());
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
  // handleCloudCollision() {
  //   this.cloudSprites.forEach((cloudSprite) => {
  //     this.enemies = this.enemies
  //       .filter((aEnemy) => boxesIntersect(cloudSprite, aEnemy))
  //       .map((aEnemy) => {
  //         aEnemy.hp -= 1;
  //       });
  //   });
  // }

  private removeBomb(bomb: Bomb) {
    this.container.removeChild(bomb.sprite);
    setTimeout(() => {
      this.bombs = this.bombs.filter((_bomb: Bomb) => bomb !== _bomb);
    }, 1000);
  }

  private handleBombCollision() {
    this.bombs.forEach((_bomb) => {
      if (_bomb.sprite.y >= this.rendererHeight && !_bomb.exploded) {
        _bomb.explode(_bomb.sprite.x, _bomb.sprite.y);
        this.removeBomb(_bomb);
      }
      this.enemies.forEach((_enemy) => {
        if (_bomb.created) {
          if (boxesIntersect(_bomb.sprite, _enemy.sprite) && !_bomb.exploded) {
            _bomb.explode(_bomb.sprite.x, _bomb.sprite.y);
            this.removeBomb(_bomb);
          }
          _bomb.explosions.forEach((explosion: any) => {
            if (boxesIntersect(explosion, _enemy.sprite)) {
              _enemy.setHp(_enemy.getHp() - 1);
            }
          });
        }
      });
    });
  }

  handlePlayerDie() {
    if (this.player.getHp() <= 0) {
      this.displayText.showDeathScreen();
      this.ticker.stop();
    }
  }

  gameLoop() {
    this.handleKeyboardPress();
    Keyboard.update();
    this.player.handlePhysics(this.gravity);
    this.player.handleFlips();
    this.cloudSprites.forEach((_cloudSprite) => {
      _cloudSprite.updateFrame();
      if (_cloudSprite.sprite.scale.x < 0.1) {
        this.container.removeChild(_cloudSprite.sprite);
        this.cloudSprites = this.cloudSprites.filter((e) => e !== _cloudSprite);
      }
    });
    this.bullets.forEach((_bullet) => {
      _bullet.handleBulletPhysics();
    });
    this.bombs.forEach((_bomb) => {
      if (_bomb.created) {
        _bomb.renderSpriteFrame();
      }
    });
    this.enemies.forEach((_enemy) => {
      _enemy.updateHpText();
      if (_enemy.checkIfDead()) {
        this.container.removeChild(_enemy.sprite);
        this.container.removeChild(_enemy.hpText);
        this.enemies = this.enemies.filter((e) => e !== _enemy);
      }
      _enemy.render(this.player.sprite.x);
    });

    this.handleCloudCollision();
    this.handleBombCollision();
    this.handleFallingObjectCollision();
    this.handleBulletCollision();
    this.handlePlayerDie();
    this.fallingObjects.forEach((_fallingObject) => {
      _fallingObject.handlePhysics();
    });
  }

  handleKeyboardPress() {
    if (Keyboard.isKeyDown('ArrowLeft', 'KeyA')) {
      this.player.setAx(-1);
      this.player.setLastMoveRight(false);
    }
    if (Keyboard.isKeyReleased('ArrowLeft', 'KeyA')) {
      this.player.setAx(0);
    }
    if (Keyboard.isKeyDown('ArrowRight', 'KeyD')) {
      this.player.setAx(1);
      this.player.setLastMoveRight(true);
    }
    if (Keyboard.isKeyReleased('ArrowRight', 'KeyD')) {
      this.player.setAx(0);
    }
    if (Keyboard.isKeyDown('ArrowUp', 'KeyW')) {
      this.player.jump();
    }
    if (Keyboard.isKeyDown('Space')) {
      this.player.setFlipping(true);
    }
    if (Keyboard.isKeyPressed('KeyE')) {
      this.cloudLoadTime = new Date().getTime();
    }

    if (Keyboard.isKeyReleased('KeyE')) {
      const cloud = new CloudSprite(this.loader);
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

    if (Keyboard.isKeyPressed('KeyQ')) {
      this.bombLoadTime = new Date().getTime();
    }

    if (Keyboard.isKeyReleased('KeyQ')) {
      const bomb = new Bomb(this.loader, this.explosionFrames, this.container);
      const timeDifference = new Date().getTime() - this.bombLoadTime;
      bomb.create(
        this.player.sprite.x,
        this.player.sprite.y,
        this.player.checkIfBunnyGoRight(),
        timeDifference,
      );
      this.bombs.push(bomb);
    }
  }
}

const app = new PIXI.Application({
  width: $(window).width(),
  height: $(window).height(),
  transparent: false,
  backgroundColor: 0x1099bb,
  resolution: 1,
});

const container = new PIXI.Container();
export const explosionFrames = Object.values(explosions);

$(document).ready(() => {
  const loader = PIXI.Loader.shared;
  loader.add('player', playerImg);
  loader.add('enemy', enemyImg);
  loader.add('fallingObject', fallingObjectImg);
  loader.add('bullet', bulletImg);
  loader.add('cloud', cloudImg);
  loader.add('bomb', bombImg);
  // TODO consider removing
  explosionFrames.forEach((frame: string) => loader.add(frame, frame));
  const rendererWidth: number = app.renderer.view.width;
  const rendererHeight: number = app.renderer.view.height;

  const player = new Player(loader, rendererWidth, rendererHeight, container);
  const fallingObject = new FallingObject(loader, rendererWidth, rendererHeight, container);
  const displayText = new DisplayText(rendererWidth, rendererHeight, container);

  // function scheduleEnemyCreation() {
  //   setTimeout(() => { enemy.create(); scheduleEnemyCreation() }, 3000)
  // }
  loader.onComplete.add(() => {
    const gameState = new GameState(
      player,
      fallingObject,
      displayText,
      container,
      rendererWidth,
      rendererHeight,
      app.ticker,
      explosionFrames,
      loader,
    );
    document.body.appendChild(app.view);
    app.stage.addChild(container);
    fallingObject.create();
    player.create();
    displayText.updateScoreText();
    // displayText.setHp(this.player.hp
    displayText.updateHpText();

    // scheduleEnemyCreation()

    app.ticker.add(() => gameState.gameLoop());
  });
});
