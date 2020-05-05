import * as PIXI from 'pixi.js'
import $ from "jquery";
import Player from "./objects/player";
import Enemy from "./objects/enemy";
import Bullet from "./objects/bullet";
import Bomb from "./objects/bomb";
import FallingObject from "./objects/fallingObject";
import DisplayText from "./objects/displayText";
import Keyboard from 'pixi.js-keyboard';

function boxesIntersect(a, b)
{
  const ab = a.getBounds();
  const bb = b.getBounds();
  return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}
function hitTestRectangle(r1, r2) {
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  hit = false;
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }
  return hit;
}

class GameState {
  constructor(player, enemy, bullet, bomb, fallingObject, displayText, container) {
    this.player = player;
    this.enemy = enemy;
    this.bullet = bullet;
    this.bomb = bomb;
    this.fallingObject = fallingObject;
    this.displayText = displayText;
    this.container = container;
    this.gravity = 1;
    this.handleKeyboardPress();
    this.shootInterval = setInterval(() => {
      this.enemy.enemies.forEach((enemy) => {
        this.bullet.shoot(
          enemy.x + enemy.width / 2,
          enemy.y,
          this.player.sprite.x,
          this.player.sprite.y
        );
      });
    }, 2000);
  }
  handleFallingObjectCollision() {
    this.fallingObject.fallingObjects.forEach((element) => {
      if (hitTestRectangle(this.player.sprite, element)) {
        this.displayText.addScore(10);
        this.container.removeChild(element);
        this.displayText.setHp(this.player.hp);
        this.fallingObject.fallingObjects = this.fallingObject.fallingObjects.filter(
          (e) => e !== element
        );
      }
    });
  }
  handleBulletCollision() {
    this.bullet.bullets.forEach((bullet) => {
      if (hitTestRectangle(this.player.sprite, bullet)) {
        this.player.hp = this.player.hp - 10;
        this.displayText.setHp(this.player.hp);
        this.container.removeChild(bullet);
        this.bullet.bullets = this.bullet.bullets.filter((e) => e !== bullet);
      }
    });
  }
  handleCloudCollision() {
    this.player.cloudSprites.forEach((cloudSprite) => {
      this.enemy.enemies.forEach((enemy) => {
        if (boxesIntersect(cloudSprite, enemy)) {
          console.log("Hitted");
          enemy.hp -= 1;
        }
      });
    });
  }
  handleBombCollision() {
    // extract floor collision detect
    this.bomb.bombs.forEach((bomb) => {
      this.enemy.enemies.forEach((enemy) => {
        if(boxesIntersect(bomb, enemy) && !bomb.exploded) {
          this.bomb.explode(bomb.x, bomb.y, bomb);
          this.bomb.remove(bomb);
        } else if(bomb.y >= app.renderer.view.height && !bomb.exploded) {
          this.bomb.explode(bomb.x, bomb.y, bomb)
          this.bomb.remove(bomb);
        }
        // this.bomb.explosions.forEach((explosion) => {
        //   if(boxesIntersect(explosion, enemy)) {
        //     enemy.hp -= 1;
        //   }
        // });
      })
    });
    this.bomb.explosions.forEach((explosion) => {
      this.enemy.enemies.forEach((enemy) => {
        if(boxesIntersect(explosion, enemy)) {
          enemy.hp -= 1;
        }
      })
    });
  }
  handlePlayerDie() {
    if (this.player.hp <= 0) {
      console.log("Player is dead");
      this.displayText.showDeathScreen();
      app.ticker.stop();
    }
  }
  gameLoop() {
    this.handleKeyboardPress()
    Keyboard.update();
    this.player.handlePhysics(this.gravity);
    this.player.handleFlips();
    this.player.updateCloudFrame();
    this.bullet.handleBulletPhysics();
    this.bomb.renderBombFrame();
    this.enemy.printHpText();
    this.enemy.checkIfDead();
    this.enemy.render(this.player.sprite.x)
    
    this.handleCloudCollision();
    this.handleBombCollision();
    this.handleFallingObjectCollision();
    this.handleBulletCollision();
    this.handlePlayerDie();
    this.fallingObject.handlePhysics(this.player.sprite, this.displayText);
  }

  handleKeyboardPress() {

    if(Keyboard.isKeyDown('ArrowLeft', 'KeyA')) {
      this.player.ax = -1;
      this.player.isLastMoveRight = false;
    }
    if (Keyboard.isKeyReleased('ArrowLeft', 'KeyA')) {
      this.player.ax = 0;
    }
    if (Keyboard.isKeyDown('ArrowRight', 'KeyD')) {
      this.player.ax = 1;
      this.player.isLastMoveRight = true;
    }
    if (Keyboard.isKeyReleased('ArrowRight', 'KeyD')) {
      this.player.ax = 0;
    }
    if (Keyboard.isKeyDown('ArrowUp', 'KeyW')) {
      this.player.jump();
    }
    if (Keyboard.isKeyDown('Space')) {
      this.player.flipping = true;
    }
    if (Keyboard.isKeyPressed('KeyE')) {
      this.player.loadCloud();
    }
    if (Keyboard.isKeyReleased('KeyE')) {
      this.player.attackCloud();
    }
    if(Keyboard.isKeyDown('KeyQ')) {
      this.bomb.loadBomb();
    }
    if(Keyboard.isKeyReleased('KeyQ')) {
      this.bomb.create(this.player.sprite.x, this.player.sprite.y, this.player.checkIfBunnyGoRight());
    }
  }
}

const app = new PIXI.Application({
  width: $(window).width(),
  height: $(window).height(),
  antialiasing: true,
  transparent: false,
  backgroundColor: 0x1099bb,
  resolution: 1,
});
window.app = app;
const container = new PIXI.Container();

import playerImg from './assets/bunny.png'
import enemyImg from './assets/police.png'
import fallingObjectImg from './assets/eliquid.png'
import bulletImg from './assets/bullet.png'
import cloudImg from './assets/cloud.png'
import bombImg from './assets/efest.png'
import explosions from './assets/explosion/*.png'
export const explosionFrames = Object.values(explosions);

$(document).ready(function () {
  const loader = PIXI.Loader.shared;
  loader.add("player", playerImg);
  loader.add("enemy", enemyImg);
  loader.add("fallingObject", fallingObjectImg);
  loader.add("bullet", bulletImg);
  loader.add("cloud", cloudImg);
  loader.add("bomb", bombImg);
  const player = new Player(loader, app.renderer.view.width, app.renderer.view.height,container);
  const enemy = new Enemy(loader, app.renderer.view.width, app.renderer.view.height, container);
  const bullet = new Bullet(loader, app.renderer.view.width, app.renderer.view.height, container);
  const bomb = new Bomb(loader, explosionFrames, container);
  const fallingObject = new FallingObject(loader, app.renderer.view.width, app.renderer.view.height, container);
  const displayText = new DisplayText(app.renderer.height.width, app.renderer.view.height, container);
  const gameState = new GameState(
    player,
    enemy,
    bullet,
    bomb,
    fallingObject,
    displayText, 
    container
  );
  document.body.appendChild(app.view);
  app.stage.addChild(container);
  // function scheduleEnemyCreation() {
  //   setTimeout(() => { enemy.create(); scheduleEnemyCreation() }, 3000)
  // }
  loader.onComplete.add(() => {
    fallingObject.create();
    player.create(app.renderer.view.width, app.renderer.view.height);
    enemy.create();
    enemy.create();
    displayText.updateScoreText();
    displayText.setHp(player.hp);
    displayText.updateHpText();
    //scheduleEnemyCreation()
    app.ticker.add((delta) => gameState.gameLoop(delta));
  });
});
