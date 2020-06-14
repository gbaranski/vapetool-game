import GameState from './gameState';
import Bomb from './objects/bomb';
import CloudSprite from './objects/cloudSprite';

export default class Actions {
  private gameState: GameState;

  constructor(gameState: GameState, private explosionFrames: Object) {
    this.gameState = gameState;
  }

  public throwBomb() {
    const timeDifference = new Date().getTime() - this.gameState.bombLoadTime;
    const vx = this.gameState.player.checkIfBunnyGoRight() ? 10 : -10;
    const vy = -Math.abs(timeDifference / 20);
    const bomb = new Bomb(
      this.gameState.sprites.bomb,
      this.explosionFrames,
      this.gameState.player.sprite.x,
      this.gameState.player.sprite.y,
      vx,
      vy,
      timeDifference,
      this.gameState.container,
    );

    this.gameState.gameObjects.push(bomb);
    this.gameState.bombs.push(bomb);
  }

  public attackCloud() {
    const cloud = new CloudSprite(this.gameState.sprites.cloud);
    const timeDifference = new Date().getTime() - this.gameState.cloudLoadTime;
    cloud.attackCloud(
      this.gameState.player.checkIfBunnyGoRight(),
      timeDifference,
      this.gameState.player.sprite.x,
      this.gameState.player.sprite.y,
      this.gameState.container,
    );
    this.gameState.cloudSprites.push(cloud);
    setTimeout(() => {
      cloud.shouldRemoveCloudSprite = true;
    }, timeDifference);
  }
}
