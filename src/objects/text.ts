import * as PIXI from 'pixi.js';
import { TextTypes } from '../types';

export default class Text {
  private textObject: PIXI.Text;

  constructor(
    private x: number,
    private y: number,
    text: any,
    private textStyle: PIXI.TextStyle,
    readonly textType: TextTypes,
    private container: PIXI.Container,
  ) {
    this.textObject = new PIXI.Text(text, this.textStyle);
    this.textObject.position.set(this.x, this.y);
    this.container.addChild(this.textObject);
  }

  updateText(newText: string) {
    this.textObject.text = newText;
  }
}
