'use strict';

export default class Controls {

  constructor(scene, camera) {

    this.scene = scene;
    this.camera = camera;

    window.addEventListener('mousemove', e => this.onMouseMove(e));

  }

  onMouseMove(e) {

    let values = {
      longDir: false,
      longSpeed: 0,
      latDir: false,
      latSpeed: 0
    };

    if(e.clientX < window.innerWidth/3) {
      values.longDir = false;
      values.longSpeed = (window.innerWidth/3 - e.clientX) / 600;
    } else if(e.clientX > 2 * window.innerWidth/3) {
      values.longDir = true;
      values.longSpeed = (e.clientX - 2 * window.innerWidth/3) / 600;
    } else {
      values.longSpeed = 0;
    }

    if(e.clientY < window.innerHeight/3) {
      values.latDir = true;
      values.latSpeed = (window.innerHeight/3 - e.clientY) / 600;
    } else if(e.clientY > 2 * window.innerHeight/3) {
      values.latDir = false;
      values.latSpeed = (e.clientY - 2 * window.innerHeight/3) / 600;
    } else {
      values.latSpeed = 0;
    }

    bean.fire(this, 'mouse_moved', [values]);

  }

}
