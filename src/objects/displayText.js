import * as PIXI from 'pixi.js'
export default class DisplayText {
  constructor(container) {
    this.container = container;
    this.scoreText;
    this.hpText;
    this.score = 0;
    this.scoreTextStyle = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "white",
      stroke: "#ff3300",
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });
    this.deathTextStyle = new PIXI.TextStyle({
      fontFamily: "Montserrat",
      fontSize: 100,
      fill: "white",
      stroke: "#ff3300",
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });
  }
  updateScoreText() {
    this.container.removeChild(this.scoreText);
    this.scoreText = new PIXI.Text(
      `Score: ${this.score}ml`,
      this.scoreTextStyle
    );
    this.scoreText.position.set(0, 0);
    this.container.addChild(this.scoreText);
  }
  addScore(amount) {
    this.score += amount;
    this.updateScoreText();
  }
  setHp(newHp) {
    this.hp = newHp;
    this.updateHpText();
  }
  updateHpText() {
    this.container.removeChild(this.hpText);
    this.hpText = new PIXI.Text(`HP: ${this.hp}`, this.scoreTextStyle);
    this.hpText.position.set(0, 40);
    this.container.addChild(this.hpText);
  }
  showDeathScreen() {
    const deathText = new PIXI.Text(
      `You're dead\n Score: ${this.score}`,
      this.deathTextStyle
    );
    deathText.anchor.set(0.5);
    deathText.position.set(app.renderer.width / 2, app.renderer.height / 2);
    this.container.addChild(deathText);
  }
}
