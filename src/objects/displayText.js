class DisplayText {
    constructor() {
      this.scoreText;
      this.score = 0;
      this.style = new PIXI.TextStyle({
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
    }
    updateScoreText() {
      container.removeChild(this.scoreText);
      this.scoreText = new PIXI.Text(`Score: ${this.score}ml`, this.style);
      this.scoreText.position.set(0, 0);
      container.addChild(this.scoreText);
    }
    addScore(amount) {
      this.score += amount;
      this.updateScoreText();
    }
    addCenterText(text) {
      this.scoreText = new PIXI.Text(text, this.style);
      this.scoreText.position.set(
        app.renderer.view.width / 2,
        app.renderer.height / 2
      );
      container.addChild(this.scoreText);
    }
  }