'use strict';

export default class Controls {

  constructor(scene, camera) {

    this.scene = scene;
    this.camera = camera;

    window.addEventListener('mousemove', e => this.onMouseMove(e));
    window.addEventListener('mouseup', e => this.onMouseUp(e));

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
      values.longSpeed = (window.innerWidth/3 - e.clientX) / 700;
    } else if(e.clientX > 2 * window.innerWidth/3) {
      values.longDir = true;
      values.longSpeed = (e.clientX - 2 * window.innerWidth/3) / 700;
    } else {
      values.longSpeed = 0;
    }

    if(e.clientY < window.innerHeight/3) {
      values.latDir = true;
      values.latSpeed = (window.innerHeight/3 - e.clientY) / 700;
    } else if(e.clientY > 2 * window.innerHeight/3) {
      values.latDir = false;
      values.latSpeed = (e.clientY - 2 * window.innerHeight/3) / 700;
    } else {
      values.latSpeed = 0;
    }

    bean.fire(this, 'mouse_moved', [values]);

  }

  onMouseUp(e) {

    let mouseX = ( e.clientX / window.innerWidth ) * 2 - 1;
    let mouseY = -( e.clientY / window.innerHeight ) * 2 + 1;
    let mouse = new THREE.Vector2(mouseX, mouseY);

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    let intersects = raycaster.intersectObjects(this.scene.children);

    bean.fire(this, 'mouse_clicked', [intersects]);

  }

}
