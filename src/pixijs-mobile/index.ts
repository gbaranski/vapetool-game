export default class MobileTouch {
  private currentTouches: TouchList;

  constructor() {
    window.addEventListener(
      'touchstart',
      (event) => {
        this.currentTouches = event.touches;
        // console.log('New event', event);
      },
      false,
    );
    window.addEventListener(
      'touchend',
      (event) => {
        this.currentTouches = event.touches;
      },
      false,
    );
  }

  getCurrentTouches() {
    return this.currentTouches;
  }
}
