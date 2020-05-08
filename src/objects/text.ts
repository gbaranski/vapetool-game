import * as PIXI from 'pixi.js';

export default class Text {
  private textObject: PIXI.Text;

  private textStyle: PIXI.TextStyle;

  private container: PIXI.Container;

  private x: number;

  private y: number;

  constructor(x: number, y: number, text: any, style: PIXI.TextStyle, container: PIXI.Container) {
    this.textStyle = style;
    this.container = container;
    this.x = x;
    this.y = y;
    this.textObject = new PIXI.Text(text, this.textStyle);
    this.textObject.position.set(this.x, this.y);
    this.container.addChild(this.textObject);
  }

  updateText(newText: string) {
    this.textObject.text = newText;
    // this.container.removeChild(this.textObject);
    // this.textObject = new PIXI.Text(this.text, this.textStyle);
    // this.textObject.position.set(this.x, this.y);
    // this.container.addChild(this.textObject);
  }
}
