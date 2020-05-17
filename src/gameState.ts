import Keyboard from 'pixi.js-keyboard';
import Player from './objects/player';
import Enemy from './objects/enemy';
import Bullet from './objects/bullet';
import Bomb from './objects/bomb';
import FallingObject from './objects/fallingObject';
import Text from './objects/text';
import CloudSprite from './objects/cloudSprite';
import Wall from './objects/wall';
import Bodyguard from './objects/bodyguard';

import { getFont1, getFont2, getFont3 } from './objects/textStyles';
import { boxesIntersect, rectIntersect } from './helpers';
import GameObject from './objects/gameObject';

export default class GameState {
  private sprites: any;

  private player: Player;

  private enemies: Enemy[] = [];

  private bodyguards: Bodyguard[] = [];

  private bullets: Bullet[] = [];

  private bombs: Bomb[] = [];

  private fallingObjects: FallingObject[] = [];

  private cloudSprites: CloudSprite[] = [];

  private container: PIXI.Container;

  private shootInterval: NodeJS.Timeout;

  private cloudLoadTime: number;

  private bombLoadTime: number;

  private rendererWidth: number;

  private rendererHeight: number;

  private ticker: PIXI.Ticker;

  private explosionFrames: Object;

  private hpText: Text;

  private scoreText: Text;

  private debugText: Text;

  private deathText: Text;

  private wall: Wall;

  private loader: PIXI.Loader;

  private playerCollideWithWall: boolean;

  private gameObjects: GameObject[] = [];

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

    // this.wall = new Wall(rendererWidth, rendererHeight, container);

    // this.gameObjects.push(this.wall);

    this.player = new Player(
      this.sprites.player,
      this.rendererWidth,
      this.rendererHeight,
      this.container,
    );
    this.gameObjects.push(this.player);

    const fallingObject = new FallingObject(
      this.sprites.fallingObject,
      this.rendererWidth,
      this.rendererHeight,
      this.container,
    );
    this.gameObjects.push(fallingObject);
    this.fallingObjects.push(fallingObject);

    this.createNewEnemy();
    setTimeout(() => {
      this.createNewEnemy();
    }, 500);

    this.createNewBodyguard();
    this.hpText = new Text(0, 0, `HP: ${this.player.getHp()}`, getFont1(), this.container);

    this.scoreText = new Text(0, 40, `Score: ${this.player.score}ml`, getFont1(), this.container);

    this.debugText = new Text(0, 80, `Loading...`, getFont3(), this.container);

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
    this.gameObjects.push(enemy);
  }

  private createNewBodyguard() {
    const bodyguard = new Bodyguard(
      this.sprites.bodyguard,
      this.rendererWidth,
      this.rendererHeight,
      this.container,
    );

    this.gameObjects.push(bodyguard);
    this.bodyguards.push(bodyguard);
  }

  private handleFallingObjectCollision() {
    this.fallingObjects.forEach((_fallingObject) => {
      if (boxesIntersect(this.player.sprite, _fallingObject.sprite)) {
        this.scoreText.updateText(`Score: ${this.player.score + 10}ml`);
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
        this.hpText.updateText(`HP: ${this.player.getHp()}`);
      } else if (
        _bullet.sprite.x < 0 ||
        _bullet.sprite.x > this.rendererWidth ||
        _bullet.sprite.y < 0 ||
        _bullet.sprite.y > this.rendererHeight
      ) {
        this.bullets = this.bullets.filter((e) => e !== _bullet);
        this.gameObjects = this.gameObjects.filter((e) => e !== _bullet);
        this.container.removeChild(_bullet.sprite);
      }
    });
    this.bullets.forEach((_bullet) => {
      this.bodyguards.forEach((bodyguard) => {
        if (boxesIntersect(bodyguard.sprite, _bullet.sprite)) {
          bodyguard.setHp(bodyguard.getHp() - 10);
          this.bullets = this.bullets.filter((e) => e !== _bullet);
          this.container.removeChild(_bullet.sprite);
        } else if (
          _bullet.sprite.x < 0 ||
          _bullet.sprite.x > this.rendererWidth ||
          _bullet.sprite.y < 0 ||
          _bullet.sprite.y > this.rendererHeight
        ) {
          this.bullets = this.bullets.filter((e) => e !== _bullet);
          this.gameObjects = this.gameObjects.filter((e) => e !== _bullet);
          this.container.removeChild(_bullet.sprite);
        }
      });
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
            this.gameObjects = this.gameObjects.filter((e) => e !== _bomb);
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

  private handlePlayerDie() {
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
    this.handleCloudCollision();
    this.handleBombCollision();
    this.handleFallingObjectCollision();
    this.handleBulletCollision();
    this.handlePlayerDie();
    this.handleKeyboardPress();
    this.handleExpiredClouds();

    this.handleGravity(delta);

    this.handlePhysics();

    GameState.detectCollision(this.gameObjects); // TODO consider reordering
    this.update(delta);

    Keyboard.update();
    this.draw(delta);
  }

  handleGravity(delta: number) {
    this.gameObjects.forEach((obj) => {
      if (obj.sprite.y < this.rendererHeight - obj.sprite.height * obj.sprite.anchor.y) {
        obj.handleGravity(delta);
      } else {
        obj.preventFalling();
        obj.sprite.y = this.rendererHeight - obj.sprite.height * obj.sprite.anchor.y;
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

    this.debugText.updateText(
      `x: ${this.player.sprite.x}\n` +
        `y: ${this.player.sprite.y}\n` +
        `vx: ${this.player.getVx()}\n` +
        `vy: ${this.player.getVy()}\n` +
        `friction: ${this.player.getFriction()}\n` +
        `ax: ${this.player.getAx()}\n` +
        `delta: ${delta}\n`,
    );
    this.bodyguards.forEach((_bodyguard) => {
      if (this.enemies.length > 0) {
        _bodyguard.render(this.enemies[0].sprite.x);
        _bodyguard.updateHpText();
      }
    });
  }

  static detectCollision(gameObjects: GameObject[]) {
    let obj1;
    let obj2;

    // Reset collision state of all objects
    for (let i = 0; i < gameObjects.length; i += 1) {
      gameObjects[i].isColliding = false;
    }

    // Start checking for collisions
    for (let i = 0; i < gameObjects.length; i += 1) {
      obj1 = gameObjects[i];
      for (let j = i + 1; j < gameObjects.length; j += 1) {
        obj2 = gameObjects[j];

        // Compare object1 with object2
        if (
          rectIntersect(
            obj1.sprite.x,
            obj1.sprite.y,
            obj1.sprite.width,
            obj1.sprite.height,
            obj2.sprite.x,
            obj2.sprite.y,
            obj2.sprite.width,
            obj2.sprite.height,
          )
        ) {
          const vCollision = { x: obj2.sprite.x - obj1.sprite.x, y: obj2.sprite.y - obj1.sprite.y };
          const distance = Math.sqrt(
            (obj2.sprite.x - obj1.sprite.x) * (obj2.sprite.x - obj1.sprite.x) +
              (obj2.sprite.y - obj1.sprite.y) * (obj2.sprite.y - obj1.sprite.y),
          );
          const vCollisionNorm = { x: vCollision.x / distance, y: vCollision.y / distance };
          const vRelativeVelocity = { x: obj1.vx - obj2.vx, y: obj1.vy - obj2.vy };
          const speed =
            vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
          if (speed < 0) {
            break;
          }
          obj1.vx -= speed * vCollisionNorm.x;
          obj1.vy -= speed * vCollisionNorm.y;
          obj2.vx += speed * vCollisionNorm.x;
          obj2.vy += speed * vCollisionNorm.y;

          const impulse = speed / (obj1.mass + obj2.mass) / 1000;
          obj1.vx -= impulse * obj2.mass * vCollisionNorm.x;
          obj1.vy -= impulse * obj2.mass * vCollisionNorm.y;
          obj2.vx += impulse * obj1.mass * vCollisionNorm.x;
          obj2.vy += impulse * obj1.mass * vCollisionNorm.y;

          obj1.isColliding = true;
          obj2.isColliding = true;
        }
      }
    }
  }

  private canCreateBodyguard = true;

  private handleKeyboardPress() {
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
    if (Keyboard.isKeyDown('Digit1') && this.canCreateBodyguard) {
      this.canCreateBodyguard = false;
      console.log('createBodybuard');
      this.createNewBodyguard();
    }
    if (Keyboard.isKeyReleased('Digit1')) {
      this.canCreateBodyguard = true;
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
      this.gameObjects.push(cloud);
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
      this.gameObjects.push(bomb);
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
