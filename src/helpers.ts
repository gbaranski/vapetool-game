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
