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
    move(dx) {
        this.bunny.vx = dx;
    }
    jump() {
        this.bunny.vy = -10;
    }
};

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
gameState = new GameState();
bunny = new Bunny();

document.body.appendChild(app.view);
const container = new PIXI.Container();

app.stage.addChild(container);

bunny.texture.baseTexture.on('loaded', function () {
    bunny.create();
});