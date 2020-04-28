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
    }
    create() {
        console.log(this.bunny);
        this.bunny.x = app.renderer.view.width / 2;
        this.bunny.y = app.renderer.view.height - this.bunny.height;
        container.addChild(this.bunny);


    }
    move(dx) {
        this.bunny.x = this.bunny.x + dx / 2;
    }
    jump(y) {
        const jumpInterval = setInterval(() => {
            this.bunny.y = this.bunny.y - 1;
            if (this.bunny.y == y) {
                clearInterval(jumpInterval);
                const rotateInterval = setInterval(() => {
                    this.bunny.angle += 10;
                    if (this.bunny.angle > 360) {
                        clearInterval(rotateInterval);
                        this.bunny.angle = 0;
                        const fallInterval = setInterval(() => {
                            this.bunny.y = this.bunny.y + 1;
                            if (this.bunny.y == app.renderer.view.height - this.bunny.height) {
                                clearInterval(fallInterval);
                            }
                        }, 1);
                    }
                }, 10);
            }
        }, 10);
    }
}

document.body.appendChild(app.view);
const container = new PIXI.Container();

app.stage.addChild(container);
bunny = new Bunny();
bunny.texture.baseTexture.on('loaded', function () {
    bunny.create();
});

document.onkeydown = function (key) {
    key = key || window.event;
    switch (key.keyCode) {
        case 38: // up 
            bunny.jump(bunny.bunny.y - 50);
            break;
        case 40: // down
            bunny.move(0, 10);
            break;
        case 37: // left
            bunny.move(-10, 0);
            break;
        case 39:
            bunny.move(10, 0);
            break;
    }
};





/*
for (let i = 0; i < 25; i++) {

    bunny.anchor.set(0.5);
    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
}

// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// Center bunny sprite in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

// Listen for animate update
app.ticker.add((delta) => {
    // rotate the container!
    // use delta to create frame-independent transform
    container.rotation -= 0.01 * delta;
});
*/