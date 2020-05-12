import * as PIXI from 'pixi.js';
import $ from 'jquery';
import GameState from './gameState';

import playerImg from './assets/bunny.png';
import enemyImg from './assets/police.png';
import fallingObjectImg from './assets/eliquid.png';
import bulletImg from './assets/bullet.png';
import cloudImg from './assets/cloud.png';
import bombImg from './assets/efest.png';
import bodyguardImg from './assets/bodyguard.png';
// eslint-disable-next-line import/no-unresolved
import explosions from './assets/explosion/*.png';

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
  loader.add('bodyguard', bodyguardImg);
  // TODO consider removing
  explosionFrames.forEach((frame: string) => loader.add(frame, frame));

  const sprites: any = {};
  loader.load((_loader, resources) => {
    sprites.player = new PIXI.Sprite(resources.player.texture);
    sprites.enemy = new PIXI.Sprite(resources.enemy.texture);
    sprites.fallingObject = new PIXI.Sprite(resources.fallingObject.texture);
    sprites.bullet = new PIXI.Sprite(resources.bullet.texture);
    sprites.cloud = new PIXI.Sprite(resources.cloud.texture);
    sprites.bomb = new PIXI.Sprite(resources.bomb.texture);
    sprites.bodyguard = new PIXI.Sprite(resources.bodyguard.texture);
  });
  const rendererWidth: number = app.renderer.view.width;
  const rendererHeight: number = app.renderer.view.height;
  loader.onComplete.add(() => {
    const gameState = new GameState(
      container,
      rendererWidth,
      rendererHeight,
      explosionFrames,
      loader,
      sprites,
    );
    document.body.appendChild(app.view);
    app.stage.addChild(container);
    app.ticker.add(() => gameState.gameLoop());
  });
});
