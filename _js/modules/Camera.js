'use strict';

import {latLongToVector3} from '../helpers/math';

export default class Camera {

  constructor() {

    this.long = 0;
    this.lat = 0;
    this.longSpeed = 0;
    this.latSpeed = 0;
    this.longDir = false;
    this.latDir = false;

    this.el = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight,
      1, 10000
    );

    this.el.position.set(0, 0, 200);
    this.el.lookAt(new THREE.Vector3(0, 0, 0));

    this.light = new THREE.SpotLight(0xffffff, 0.8);
    this.light.position.set(this.el.position.x, this.el.position.y, this.el.position.z);

  }

  setCameraValues(values) {

    this.longSpeed = values.longSpeed;
    this.latSpeed = values.latSpeed;
    this.longDir = values.longDir;
    this.latDir = values.latDir;

  }

  moveCamera() {

    let newCamLong;
    if(this.longDir) {
      newCamLong = this.long + this.longSpeed;
    } else {
      newCamLong = this.long - this.longSpeed;
    }

    if(newCamLong > -90 && newCamLong < 100) {
      this.long = newCamLong;
    }

    let newCamLat;
    if(this.latDir) {
      newCamLat = this.lat + this.latSpeed;
    } else {
      newCamLat = this.lat - this.latSpeed;
    }

    if(newCamLat > -45 && newCamLat < 45) {
      this.lat = newCamLat;
    }

    let pos = latLongToVector3(this.lat, this.long, 100, 100);
    this.el.position.set(pos.x, pos.y, pos.z);

    this.el.lookAt(new THREE.Vector3(0, 0, 0));

  }

  update() {

    this.moveCamera();

    this.light.position.set(this.el.position.x, this.el.position.y, this.el.position.z);
    this.light.rotation.set(this.el.rotation.x, this.el.rotation.y, this.el.rotation.z);

  }

}
