import * as PIXI from 'pixi.js';

export default class Text {
  private textObject: PIXI.Text;

  public text: string;

  private textStyle: PIXI.TextStyle;

  private container: PIXI.Container;

  private x: number;

  private y: number;

  constructor(
    x: number,
    y: number,
    text: string,
    style: PIXI.TextStyle,
    container: PIXI.Container,
  ) {
    this.text = text;
    this.textStyle = style;
    this.container = container;
    this.x = x;
    this.y = y;
  }

  updateText() {
    this.container.removeChild(this.textObject);
    this.textObject = new PIXI.Text(this.text, this.textStyle);
    this.textObject.position.set(this.x, this.y);
    this.container.addChild(this.textObject);
  }
}
