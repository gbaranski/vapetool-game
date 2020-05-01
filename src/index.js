const app = new PIXI.Application({
    width: $(window).width(),
    height: $(window).height(),
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
});
const container = new PIXI.Container();
class Bunny {
    constructor() {
        this.texture = PIXI.Texture.from('src/assets/bunny.png');
        this.bunny = new PIXI.Sprite(this.texture);
        this.jumping = false;
        this.flipping = false;
        this.flipVelocity = 0;
    }
    create() {
        this.bunny.x = app.renderer.view.width / 2;
        this.bunny.y = app.renderer.view.height - this.bunny.height;
        this.bunny.vx = 0;
        this.bunny.vy = 0;
        container.addChild(this.bunny);
        app.ticker.add(delta => gameState.gameLoop(delta));
    }
    jump() {
        this.bunny.vy = -10;
    }
    handleFlips() {
        if (this.bunny.vx > 0 && this.flipping == false) {
            this.flipVelocity = 10;
        } else if (bunny.flipping == false) {
            this.flipVelocity = -10
        }
        if (this.flipping) {
            this.bunny.angle += this.flipVelocity
            if (Math.abs(this.bunny.angle) > 360) {
                this.flipping = false;
                this.bunny.angle = 0;
            }
        }
    }
};
class FallingObject {
    constructor() {
        this.texture = PIXI.Texture.from('src/assets/eliquid.png');
        this.fallingObjects = [];
        this.objectGravity = 3;
    }
    create() {
        for (let i = 0; i < 2; i++) {
            this.fallingObjects[i] = new PIXI.Sprite(this.texture);
            this.fallingObjects[i].scale.x = 0.1;
            this.fallingObjects[i].scale.y = 0.1;
            this.fallingObjects[i].x = Math.floor(Math.random() * (app.renderer.width))
            this.fallingObjects[i].y = 0;
            this.fallingObjects[i].vy = this.objectGravity;
            container.addChild(this.fallingObjects[i]);
        }
    }

}
class DisplayText {
    constructor() {
        this.scoreText;
        this.score = 0;
        this.style = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 36,
            fill: "white",
            stroke: '#ff3300',
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
        this.scoreText.position.set(app.renderer.view.width/2, app.renderer.height/2);
        container.addChild(this.scoreText);
    
    }
}

class GameState {
    constructor() {
        this.gravity = 0.5;
    }
    gameLoop() {
        this.handleKeyboardPress();
        this.handleBunnyPhysics();
        this.handleFallingObjectsPhysics();
        bunny.handleFlips();
    }
    handleBunnyPhysics() {
        bunny.bunny.x += bunny.bunny.vx;
        bunny.bunny.y += bunny.bunny.vy;
        if (bunny.bunny.y <= app.renderer.view.height - bunny.bunny.height) {
            bunny.bunny.vy += this.gravity;
        } else {
            bunny.bunny.vy = 0;
        }
    }
    handleFallingObjectsPhysics() {
        fallingObject.fallingObjects.forEach(element => {
            if (element.y <= app.renderer.view.height - element.height) {
                element.y += element.vy;
            }
            if (hitTestRectangle(bunny.bunny, element)) {
                displayText.addScore(10);
                container.removeChild(element);
                fallingObject.fallingObjects = fallingObject.fallingObjects.filter(e =>  e !== element);
            }
        });
    }

    handleKeyboardPress() {
        let keyA = this.keyboard("a");
        keyA.press = () => {
            bunny.bunny.vx = -10;
        }
        keyA.release = () => {
            if (bunny.bunny.vx = -10)
                bunny.bunny.vx = 0;
        }
        let keyD = this.keyboard("d");
        keyD.press = () => {
            bunny.bunny.vx = 10;
        }
        keyD.release = () => {
            if (bunny.bunny.vx = 10)
                bunny.bunny.vx = 0;
        }

        let keyW = this.keyboard("w");
        keyW.press = () => {
            bunny.jump();
        }
        let keySpace = this.keyboard(" ");
        keySpace.press = () => {
            bunny.flipping = true;
        }
    }
    keyboard(value) {
        let key = {};
        key.value = value;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        key.downHandler = event => {
            if (event.key === key.value) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
                event.preventDefault();
            }
        };
        key.upHandler = event => {
            if (event.key === key.value) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
                event.preventDefault();
            }
        };
        const downListener = key.downHandler.bind(key);
        const upListener = key.upHandler.bind(key);
        window.addEventListener(
            "keydown", downListener, false
        );
        window.addEventListener(
            "keyup", upListener, false
        );
        key.unsubscribe = () => {
            window.removeEventListener("keydown", downListener);
            window.removeEventListener("keyup", upListener);
        };
        return key;
    }
};

function hitTestRectangle(r1, r2) {
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
    hit = false;
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;
    if (Math.abs(vx) < combinedHalfWidths) {
        if (Math.abs(vy) < combinedHalfHeights) {
            hit = true;
        } else {
            hit = false;
        }
    } else {
        hit = false;
    }
    return hit;
};

$(document).ready(function() {
    gameState = new GameState();
    bunny = new Bunny();
    fallingObject = new FallingObject();
    displayText = new DisplayText();
    document.body.appendChild(app.view);
    app.stage.addChild(container);
    bunny.texture.baseTexture.on('loaded', function () {
        fallingObject.texture.baseTexture.on('loaded', function () {
            bunny.create();
            fallingObject.create();
            displayText.updateScoreText();
        })
    });
});
