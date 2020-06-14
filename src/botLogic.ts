import GameState from './gameState';
import Bullet from './objects/bullet';
import { getEuclideanDistance } from './helpers';

export default class BotLogic {
  constructor(private gameState: GameState) {
    setInterval(() => {
      if (this.gameState.userData.isPaused) {
        return;
      }

      this.gameState.enemies.forEach((_enemy) => {
        let closestObject: any = {
          euclideanDistance: Number.MAX_SAFE_INTEGER,
          sprite: null,
        };
        this.gameState.bodyguards.forEach((_bodyguard) => {
          const euclideanDistance = getEuclideanDistance(_enemy.sprite, _bodyguard.sprite);
          if (euclideanDistance < closestObject.euclideanDistance) {
            closestObject = {
              euclideanDistance,
              sprite: _bodyguard.sprite,
            };
          }
        });
        if (
          getEuclideanDistance(_enemy.sprite, this.gameState.player.sprite) <
            closestObject.euclideanDistance ||
          this.gameState.bodyguards.length === 0
        ) {
          closestObject = {
            euclideanDistance: null, // can also assign to real euclidean but not even using it anywhere
            sprite: this.gameState.player.sprite,
          };
        }
        const bullet = new Bullet(
          this.gameState.sprites.bullet,
          this.gameState.userData.rendererWidth,
          this.gameState.userData.rendererHeight,
          this.gameState.container,
          _enemy.sprite.x,
          _enemy.sprite.y,
          closestObject.sprite.x,
          closestObject.sprite.y,
        );
        this.gameState.bullets.push(bullet);
      });
    }, 2000);
  }
}
