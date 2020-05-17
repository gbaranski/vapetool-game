export function boxesIntersect(a: PIXI.Sprite, b: PIXI.Sprite) {
  const ab = a.getBounds();
  const bb = b.getBounds();
  return (
    ab.x + ab.width > bb.x &&
    ab.x < bb.x + bb.width &&
    ab.y + ab.height > bb.y &&
    ab.y < bb.y + bb.height
  );
}

export function checkIfCollideFromRight(a: PIXI.Sprite, b: PIXI.Sprite) {
  return a.getBounds().x + a.getBounds().width / 2 < b.getBounds().x + b.getBounds().width;
}

export function rectIntersect(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number,
) {
  // Check x and y for overlap
  if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
    return false;
  }
  return true;
}
export function circleIntersect(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
) {
  // Calculate the distance between the two circles
  const squareDistance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);

  // When the distance is smaller or equal to the sum
  // of the two radius, the circles touch or overlap
  return squareDistance <= (r1 + r2) * (r1 + r2);
}

export function detectCollision(gameObjects: any[]) {
  let obj1;
  let obj2;

  // Reset collision state of all objects
  gameObjects.forEach((_gameObject) => {
    _gameObject.setCollidingFalse();
  });

  // Start checking for collisions
  for (let i = 0; i < gameObjects.length; i += 1) {
    obj1 = gameObjects[i];
    for (let j = i + 1; j < gameObjects.length; j += 1) {
      obj2 = gameObjects[j];

      // Compare object1 with object2

      // if (
      //   circleIntersect(
      //     obj1.sprite.x,
      //     obj1.sprite.y,
      //     Math.max(obj1.sprite.width / 2, obj1.sprite.height / 2),
      //     obj2.sprite.x,
      //     obj2.sprite.y,
      //     Math.max(obj2.sprite.width / 2, obj2.sprite.height / 2),
      //   )
      // ) {
      if (
        rectIntersect(
          obj1.sprite.x,
          obj1.sprite.y,
          obj1.sprite.width,
          obj1.sprite.height,
          obj2.sprite.x,
          obj2.sprite.y,
          obj2.sprite.width,
          obj2.sprite.height,
        )
      ) {
        const vCollision = { x: obj2.sprite.x - obj1.sprite.x, y: obj2.sprite.y - obj1.sprite.y };
        const distance = Math.sqrt(
          (obj2.sprite.x - obj1.sprite.x) * (obj2.sprite.x - obj1.sprite.x) +
            (obj2.sprite.y - obj1.sprite.y) * (obj2.sprite.y - obj1.sprite.y),
        );
        const vCollisionNorm = { x: vCollision.x / distance, y: vCollision.y / distance };
        const vRelativeVelocity = { x: obj1.vx - obj2.vx, y: obj1.vy - obj2.vy };
        const speed =
          vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
        if (speed < 0) {
          break;
        }
        obj1.vx -= speed * vCollisionNorm.x;
        obj1.vy -= speed * vCollisionNorm.y;
        obj2.vx += speed * vCollisionNorm.x;
        obj2.vy += speed * vCollisionNorm.y;

        const impulse = speed / (obj1.mass + obj2.mass) / 1000;
        obj1.vx -= impulse * obj2.mass * vCollisionNorm.x;
        obj1.vy -= impulse * obj2.mass * vCollisionNorm.y;
        obj2.vx += impulse * obj1.mass * vCollisionNorm.x;
        obj2.vy += impulse * obj1.mass * vCollisionNorm.y;

        obj1.isColliding = true;
        obj2.isColliding = true;
      }
    }
  }
}
