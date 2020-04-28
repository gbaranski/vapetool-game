const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1,
});
class Bunny {
    constructor() {
        this.texture = PIXI.Texture.from('src/assets/bunny.png');
        this.bunny = new PIXI.Sprite(this.texture);
        this.jumping = false;
    }
    create() {
        console.log(this.bunny);
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
        this.message;
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
    updateText() {
        container.removeChild(this.message);
        this.message = new PIXI.Text(`Score: ${this.score}ml`, this.style);
        this.message.position.set(0, 0);
        container.addChild(this.message);
    }
    addScore(amount) {
        this.score += amount;
        this.updateText();
    }
}

class GameState {
    constructor() {
        this.gravity = 0.5;
    }
    gameLoop() {
        this.handleKeyboardPress();
        bunny.bunny.x += bunny.bunny.vx;
        bunny.bunny.y += bunny.bunny.vy;
        if (bunny.bunny.y <= app.renderer.view.height - bunny.bunny.height) {
            bunny.bunny.vy += this.gravity;
        } else {
            bunny.bunny.vy = 0;
        }
        fallingObject.fallingObjects.forEach(element => {
            if (element.y <= app.renderer.view.height - element.height) {
                element.y += element.vy;
            } else {
                element.vy = 0;
            }
            if (hitTestRectangle(bunny.bunny, element)) {
                console.log("hit")
                displayText.addScore(10);
                container.removeChild(element);
                fallingObject.fallingObjects = fallingObject.fallingObjects.filter(function (e) {
                    return e !== element;
                });
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
            if (!bunny.jumping) {
                bunny.jump();
            }

        }
    }
    keyboard(value) {
        let key = {};
        key.value = value;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = event => {
            if (event.key === key.value) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
                event.preventDefault();
            }
        };

        //The `upHandler`
        key.upHandler = event => {
            if (event.key === key.value) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
                event.preventDefault();
            }
        };

        //Attach event listeners
        const downListener = key.downHandler.bind(key);
        const upListener = key.upHandler.bind(key);

        window.addEventListener(
            "keydown", downListener, false
        );
        window.addEventListener(
            "keyup", upListener, false
        );

        // Detach event listeners
        key.unsubscribe = () => {
            window.removeEventListener("keydown", downListener);
            window.removeEventListener("keyup", upListener);
        };

        return key;
    }
};

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

        //A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            hit = true;
        } else {

            //There's no collision on the y axis
            hit = false;
        }
    } else {

        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};
gameState = new GameState();
bunny = new Bunny();
fallingObject = new FallingObject();
displayText = new DisplayText();
document.body.appendChild(app.view);
const container = new PIXI.Container();

app.stage.addChild(container);

bunny.texture.baseTexture.on('loaded', function () {
    bunny.create();
});
fallingObject.texture.baseTexture.on('loaded', function () {
    fallingObject.create();
    displayText.updateText();
})