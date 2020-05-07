import Keyboard from 'pixi.js-keyboard';
import Player from './objects/player';
import Enemy from './objects/enemy';
import Bullet from './objects/bullet';
import Bomb from './objects/bomb';
import FallingObject from './objects/fallingObject';
import Text from './objects/text';
import CloudSprite from './objects/cloudSprite';
import { getFont1, getFont2 } from './objects/textStyles';
import { boxesIntersect } from './helpers';

export default class GameState {
  private sprites: any;

  private player: Player;

  private enemies: Enemy[] = [];

  private bullets: Bullet[] = [];

  private bombs: Bomb[] = [];

  private fallingObjects: FallingObject[] = [];

  private cloudSprites: CloudSprite[] = [];

  private container: PIXI.Container;

  private gravity: number;

  private shootInterval: NodeJS.Timeout;

  private cloudLoadTime: number;

  private bombLoadTime: number;

  private rendererWidth: number;

  private rendererHeight: number;

  private ticker: PIXI.Ticker;

  private explosionFrames: Object;

  private hpText: Text;

  private scoreText: Text;

  private deathText: Text;

  private loader: PIXI.Loader;

  constructor(
    container: PIXI.Container,
    rendererWidth: number,
    rendererHeight: number,
    explosionFrames: Object,
    loader: PIXI.Loader,
    sprites: any,
  ) {
    this.sprites = sprites;
    this.container = container;
    this.loader = loader;
    this.rendererWidth = rendererWidth;
    this.rendererHeight = rendererHeight;
    this.explosionFrames = explosionFrames;

    this.player = new Player(
      this.sprites.player,
      this.rendererWidth,
      this.rendererHeight,
      this.container,
    );

    const fallingObject = new FallingObject(
      this.sprites.fallingObject,
      this.rendererWidth,
      this.rendererHeight,
      this.container,
    );
    this.fallingObjects.push(fallingObject);

    this.gravity = 1;
    this.createNewEnemy();
    setTimeout(() => {
      this.createNewEnemy();
    }, 500);
    this.hpText = new Text(0, 0, `HP: ${this.player.getHp()}`, getFont1(), this.container);
    this.hpText.updateText();

    this.scoreText = new Text(0, 40, `Score: ${this.player.score}ml`, getFont1(), this.container);
    this.scoreText.updateText();
    this.shootInterval = setInterval(() => {
      this.enemies.forEach((_enemy) => {
        const bullet = new Bullet(
          this.sprites.bullet,
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

  private createNewEnemy() {
    const enemy = new Enemy(
      this.sprites.enemy,
      this.rendererWidth,
      this.rendererHeight,
      this.container,
    );
    this.enemies.push(enemy);
  }

  private handleFallingObjectCollision() {
    this.fallingObjects.forEach((_fallingObject) => {
      if (boxesIntersect(this.player.sprite, _fallingObject.sprite)) {
        this.scoreText.text = `Score: ${this.player.score + 10}ml`;
        this.scoreText.updateText();
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
        this.hpText.text = `HP: ${this.player.getHp()}`;
        this.hpText.updateText();
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
      this.deathText = new Text(
        this.rendererWidth / 2,
        this.rendererHeight / 2,
        `
        You're dead\n
        Score: ${this.player.score}ml
        `,
        getFont2(),
        this.container,
      );
      this.deathText.updateText();
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

    if (Keyboard.isKeyPressed('KeyQ')) {
      this.bombLoadTime = new Date().getTime();
    }

    if (Keyboard.isKeyReleased('KeyQ')) {
      const bomb = new Bomb(this.sprites.bomb, this.explosionFrames, this.container);
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
