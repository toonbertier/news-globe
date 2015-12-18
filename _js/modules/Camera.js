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

    this.el.lookAt(new THREE.Vector3(0, 0, 0));

    this.light = new THREE.SpotLight(0xffffff, 1);
    this.light.exponent = 5;

    setInterval(() => {
      this.showCameraValues();
    }, 200);

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

    if(newCamLong < -180) {
      newCamLong = Math.abs(this.long % -180);
    }
    if(newCamLong > 180) {
      newCamLong = -(this.long % 180);
    }

    this.long = newCamLong;

    let newCamLat;
    if(this.latDir) {
      newCamLat = this.lat + this.latSpeed;
    } else {
      newCamLat = this.lat - this.latSpeed;
    }

    if(newCamLat > -70 && newCamLat < 70) {
      this.lat = newCamLat;
    }

    let pos = latLongToVector3(this.lat, this.long, 100, 250);
    this.el.position.set(pos.x, pos.y, pos.z);

    this.el.lookAt(new THREE.Vector3(0, 0, 0));

  }

  showCameraValues() {

    let latSuffix;
    let longSuffix;

    if(this.lat > 0) {
      latSuffix = '°N';
    } else {
      latSuffix = '°S';
    }

    if(this.long > 0) {
      longSuffix = '°E';
    } else {
      longSuffix = '°W';
    }

    $('.camera-values').text(`${this.lat.toFixed(2)}${latSuffix} - ${this.long.toFixed(2)}${longSuffix}`);

  }

  update() {

    this.moveCamera();

    this.light.position.set(this.el.position.x, this.el.position.y, this.el.position.z);
    this.light.rotation.set(this.el.rotation.x, this.el.rotation.y, this.el.rotation.z);

    if(this.latSpeed < 0.8 && this.longSpeed < 0.8) {
      if(this.latSpeed === 0 && this.longSpeed === 0) return;
      bean.fire(this, 'check_targets');
    }

  }

}
