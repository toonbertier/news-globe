'use strict';

import {latLongToVector3} from '../helpers/math';

export class Dot {

  constructor(lat, long, earthRadius, dotType, articleId) {

    this.lat = lat;
    this.long = long;

    let pos = latLongToVector3(lat, long, earthRadius, 0);

    let geometry = new THREE.SphereGeometry(dotType.radius, 32, 32);
    let material = new THREE.MeshLambertMaterial({color: dotType.color});
    this.el = new THREE.Mesh(geometry, material);

    this.dotType = dotType;
    this.el.position.set(pos.x, pos.y, pos.z);

  }

}

export class WebcamDot extends Dot {

  constructor(lat, long, earthRadius, dotType, socketid) {
    super(lat, long, earthRadius, dotType);
    this.socketid = socketid;
  }

}

export class NewsDot extends Dot {

  constructor(lat, long, earthRadius, dotType, articleId) {
    super(lat, long, earthRadius, dotType);
    this.articleId = articleId;
  }

}
