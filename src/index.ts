import * as PIXI from 'pixi.js';
import $ from 'jquery';
import Keyboard from 'pixi.js-keyboard';
import Player from './objects/player';
import Enemy from './objects/enemy';
import Bullet from './objects/bullet';
import Bomb from './objects/bomb';
import FallingObject from './objects/fallingObject';
import DisplayText from './objects/displayText';

import playerImg from './assets/bunny.png';
import enemyImg from './assets/police.png';
import fallingObjectImg from './assets/eliquid.png';
import bulletImg from './assets/bullet.png';
import cloudImg from './assets/cloud.png';
import bombImg from './assets/efest.png';
// eslint-disable-next-line import/no-unresolved
import explosions from './assets/explosion/*.png';

function boxesIntersect(a, b) {
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

  private displayText: DisplayText;

  private container: PIXI.Container;

  private gravity: number;

  private shootInterval: NodeJS.Timer;

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

    const enemy = new Enemy(loader, rendererWidth, rendererHeight, container);
    this.enemies.push(enemy);

    this.shootInterval = setInterval(() => {
      this.enemies.forEach((aEnemy) => {
        this.bullets.forEach((_bullet) => {
          _bullet.shoot(
            aEnemy.sprite.x + aEnemy.sprite.width / 2,
            aEnemy.sprite.y,
            this.player.sprite.x,
            this.player.sprite.y,
          );
        });
      });
    }, 2000);
  }

  handleFallingObjectCollision() {
    this.fallingObjects.forEach((_fallingObject) => {
      if (boxesIntersect(this.player.sprite, _fallingObject.fallingObject)) {
        this.displayText.addScore(10);
        this.fallingObjects = this.fallingObjects.filter((e) => e !== _fallingObject);
      }
    });
  }

  private handleBulletCollision() {
    this.bullets.forEach((_bullet) => {
      if (boxesIntersect(this.player.sprite, _bullet)) {
        this.player.setHp(this.player.getHp() - 10);
        this.bullets = this.bullets.filter((e) => e !== _bullet);
        this.displayText.setHp(this.player.getHp());
      }
    });
  }
  /* add clouds to new class then fix
  handleCloudCollision() {
    this.player.cloudSprites.forEach((cloudSprite) => {
      this.enemy.enemies = this.enemy.enemies
        .filter((aEnemy) => boxesIntersect(cloudSprite, aEnemy))
        .map((aEnemy) => {
          aEnemy.hp -= 1;
        });
    });
  }
  */

  private removeBomb(bomb: Bomb) {
    this.container.removeChild(bomb.sprite);
    this.bombs = this.bombs.filter((_bomb: Bomb) => bomb !== _bomb);
  }

  private handleBombCollision() {
    // extract floor collision detect
    this.bombs.forEach((_bomb) => {
      this.enemies.forEach((_enemy) => {
        if (_bomb.created) {
          if (boxesIntersect(_bomb.sprite, _enemy.sprite) && !_bomb.exploded) {
            _bomb.explode(_bomb.sprite.x, _bomb.sprite.y);
            this.removeBomb(_bomb);
          } else if (_bomb.sprite.y >= this.rendererHeight && !_bomb.exploded) {
            _bomb.explode(_bomb.sprite.x, _bomb.sprite.y);
            this.removeBomb(_bomb);
          }
          // this.bomb.explosions.forEach((explosion) => {
          //   if(boxesIntersect(explosion, enemy)) {
          //     enemy.hp -= 1;
          //   }
          // });
        }
      });
    });
    this.bombs.forEach((_bomb) => {
      if (_bomb.exploded) {
        _bomb.explosions.forEach((_explosion) => {
          this.enemies.forEach((_enemy) => {
            if (boxesIntersect(_explosion, _enemy)) {
              _enemy.setHp(_enemy.getHp() - 10);
            }
          });
        });
      }
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
    // this.player.updateCloudFrame(); ADD LATER
    this.bullets.forEach((_bullet) => {
      _bullet.handleBulletPhysics();
    });
    this.bombs.forEach((_bomb) => {
      if (_bomb.created) {
        _bomb.renderSpriteFrame();
      }
    });
    this.enemies.forEach((_enemy) => {
      _enemy.checkIfDead();
      _enemy.render(this.player.sprite.x);
    });
    // this.enemy.printHpText(); ADD LATER

    // this.handleCloudCollision(); ADD LATER
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
      // this.player.loadCloud(); ADD LATER
    }
    if (Keyboard.isKeyReleased('KeyE')) {
      // this.player.attackCloud(); ADD LATER
    }
    if (Keyboard.isKeyDown('KeyQ')) {
      const bomb = new Bomb(this.loader, this.explosionFrames, this.container);
      this.bombs.push(bomb);
      bomb.loadBomb();
    }
    if (Keyboard.isKeyReleased('KeyQ')) {
      console.log('released Q');
      this.bombs[this.bombs.length - 1].create(
        this.player.sprite.x,
        this.player.sprite.y,
        this.player.checkIfBunnyGoRight(),
      );
      // this.bombs[this.bombs.length - 1].create(
      //   this.player.sprite.x,
      //   this.player.sprite.y,
      //   this.player.checkIfBunnyGoRight(),
      // );
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
  console.log('Ready');
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

  // const bullet = new Bullet(loader, rendererWidth, rendererHeight, container);
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
