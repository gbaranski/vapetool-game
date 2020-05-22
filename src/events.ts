import GameState from './gameState';
import Text from './objects/text';
import { getFont2 } from './objects/textStyles';
import { TextTypes } from './types';

export default class HandleEvents {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public handlePlayerDie() {
    if (this.gameState.player.getHp() <= 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const deathText = new Text(
        this.gameState.userData.rendererWidth / 4,
        this.gameState.userData.rendererHeight / 4,
        `
        You're dead\n
        Score: ${this.gameState.player.score}ml
        `,
        getFont2(),
        TextTypes.DEATH_TEXT,
        this.gameState.container,
      );
      this.gameState.app.ticker.stop();
    }
  }

  public handleExpiredClouds() {
    this.gameState.cloudSprites.forEach((_cloudSprite) => {
      _cloudSprite.handlePhysics();
      if (_cloudSprite.sprite.scale.x < 0.1) {
        this.gameState.container.removeChild(_cloudSprite.sprite);
        this.gameState.cloudSprites = this.gameState.cloudSprites.filter((e) => e !== _cloudSprite);
        this.gameState.gameObjects = this.gameState.gameObjects.filter((e) => e !== _cloudSprite);
      }
    });
  }
}
