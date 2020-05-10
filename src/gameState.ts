import Keyboard from 'pixi.js-keyboard';
import Player from './objects/player';
import Enemy from './objects/enemy';
import Bullet from './objects/bullet';
import Bomb from './objects/bomb';
import FallingObject from './objects/fallingObject';
import Text from './objects/text';
import CloudSprite from './objects/cloudSprite';
import Wall from './objects/wall';
import { getFont1, getFont2, getFont3 } from './objects/textStyles';
import { boxesIntersect, checkIfCollideFromRight } from './helpers';

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

  private xText: Text;

  private yText: Text;

  private vxText: Text;

  private vyText: Text;

  private frictionText: Text;

  private axText: Text;

  private deathText: Text;

  private wall: Wall;

  private loader: PIXI.Loader;

  private playerCollideWithWall: boolean;

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

    this.wall = new Wall(rendererWidth, rendererHeight, container);

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

    this.scoreText = new Text(0, 40, `Score: ${this.player.score}ml`, getFont1(), this.container);

    this.xText = new Text(0, 80, `x: ${this.player.sprite.x}`, getFont3(), this.container);

    this.yText = new Text(0, 100, `y: ${this.player.sprite.y}`, getFont3(), this.container);

    this.vxText = new Text(0, 120, `vx: ${this.player.getVx()}`, getFont3(), this.container);

    this.vyText = new Text(0, 140, `vy: ${this.player.getVy()}`, getFont3(), this.container);

    this.frictionText = new Text(
      0,
      160,
      `friction: ${this.player.getFriction()}`,
      getFont3(),
      this.container,
    );

    this.axText = new Text(0, 180, `ax: ${this.player.getAx()}`, getFont3(), this.container);

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
        this.scoreText.updateText(`Score: ${this.player.score + 10}ml`);
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
        this.hpText.updateText(`HP: ${this.player.getHp()}`);
      } else if (
        _bullet.sprite.x < 0 ||
        _bullet.sprite.x > this.rendererWidth ||
        _bullet.sprite.y < 0 ||
        _bullet.sprite.y > this.rendererHeight
      ) {
        this.bullets = this.bullets.filter((e) => e !== _bullet);
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

  private handleWallCollision() {
    if (boxesIntersect(this.player.sprite, this.wall.sprite)) {
      // this.player.pushPlayer(this.wall.sprite.y);
      // console.log(this.wall.sprite.getBounds().left - this.player.sprite.width);
      // // console.log(checkIfCollideFromRight(this.wall.sprite, this.player.sprite));
      // console.log(
      //   this.wall.sprite.getBounds().x + this.wall.sprite.getBounds().width > this.player.sprite.x,
      // );

      // console.log(
      //   this.wall.sprite.getBounds().x + this.wall.sprite.getBounds().width / 2 <
      //     this.player.sprite.getBounds().x + this.player.sprite.getBounds().width / 2,
      // );
      if (checkIfCollideFromRight(this.wall.sprite, this.player.sprite)) {
        this.player.blockLeftSideMovement = true;
      } else {
        this.player.blockRightSideMovement = true;
      }
      this.playerCollideWithWall = true;
    } else {
      this.playerCollideWithWall = false;
      this.player.blockLeftSideMovement = false;
      this.player.blockRightSideMovement = false;
    }
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
      this.ticker.stop();
    }
  }

  gameLoop() {
    this.xText.updateText(`x: ${this.player.sprite.x}`);
    this.yText.updateText(`y: ${this.player.sprite.y}`);
    this.vxText.updateText(`vx: ${this.player.getVx()}`);
    this.vyText.updateText(`vy: ${this.player.getVy()}`);
    this.frictionText.updateText(`friction: ${this.player.getFriction()}`);
    this.axText.updateText(`ax: ${this.player.getAx()}`);
    this.handleKeyboardPress();
    this.handleWallCollision();
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
    // if (Keyboard.isKeyDown('ArrowDown', 'KeyS')) {
    //   this.player.crouch();
    // }
    // if (Keyboard.isKeyReleased('ArrowDown', 'KeyS')) {
    //   this.player.unCrouch();
    // }

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
