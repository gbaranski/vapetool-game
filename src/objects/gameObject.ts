export default abstract class GameObject {
  public sprite: PIXI.Sprite;

  static objectCounter: number;

  constructor(public mass: number) {
    GameObject.objectCounter += 1;
    console.log(GameObject.objectCounter);
  }
}
