import * as PIXI from 'pixi.js';

export function getFont1() {
  return new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fill: 'white',
    stroke: '#ff3300',
    strokeThickness: 4,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
  });
}

export function getFont2() {
  return new PIXI.TextStyle({
    fontFamily: 'Montserrat',
    fontSize: 100,
    fill: 'white',
    stroke: '#ff3300',
    strokeThickness: 4,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
  });
}
export function getFont3() {
  return new PIXI.TextStyle({
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: 16,
    fontStyle: 'italic',
  });
}
