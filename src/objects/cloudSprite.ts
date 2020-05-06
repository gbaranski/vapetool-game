import * as PIXI from 'pixi.js';

export default class CloudSprite {
  public sprite: PIXI.Sprite;

  private vx: number;

  private vy: number;

  private loader: PIXI.Loader;

  public shouldRemoveCloudSprite: boolean;

  private scaleMultiplier: number;

  private container: PIXI.Container;

  constructor(loader: PIXI.Loader) {
    this.loader = loader;
  }

  attackCloud(
    isBunnyGoingRight: boolean,
    timeDifference: number,
    playerX: number,
    playerY: number,
    container: PIXI.Container,
  ) {
    this.container = container;
    this.sprite = new PIXI.Sprite(this.loader.resources.cloud.texture);

    this.shouldRemoveCloudSprite = false;
    this.scaleMultiplier = 1.05;
    this.sprite.anchor.set(0.5, 1);
    this.sprite.scale.x = timeDifference / 1000;
    this.sprite.scale.y = timeDifference / 1000;
    this.sprite.x = playerX + 20;
    this.sprite.y = playerY + 20;

    if (isBunnyGoingRight) {
      this.vx = 1;
      this.vx = 0;
    } else {
      this.vx = 0;
      this.vx = -1;
    }
    this.container.addChild(this.sprite);
  }

  updateFrame() {
    if (!this.shouldRemoveCloudSprite) {
      this.scaleMultiplier = 1.05;
    } else {
      this.scaleMultiplier = 0.95;
    }
    if (this.sprite.scale.x < 0.01 && this.sprite.scale.y <= 0.01) {
      //   this.sprite = this.sprite.filter((e) => e !== this.sprite;
      //   this.container.removeChild(this.sprite);
    }
    this.sprite.scale.x = Math.min(this.sprite.scale.x * this.scaleMultiplier, 4);
    this.sprite.scale.y = Math.min(this.sprite.scale.y * this.scaleMultiplier, 4);
    this.sprite.x += this.vx;
  }
}
