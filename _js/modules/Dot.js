'use strict';

import {latLongToVector3} from '../helpers/math';

export class Dot {

  constructor(lat, long, earthRadius, dotType, articleId) {

    this.lat = lat;
    this.long = long;
    this.earthRadius = earthRadius

    let pos = latLongToVector3(lat, long, earthRadius, 5);

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

    let lineMaterial = new THREE.LineBasicMaterial({color: 0x444444, linewidth: 0.08});
    let lineGeometry = new THREE.Geometry();

    let beginpos = latLongToVector3(this.lat, this.long, this.earthRadius, 0)
    lineGeometry.vertices.push(new THREE.Vector3(beginpos.x, beginpos.y, beginpos.z));
    let endpos = latLongToVector3(this.lat, this.long, this.earthRadius, 5);
    lineGeometry.vertices.push(new THREE.Vector3(endpos.x, endpos.y, endpos.z));

    this.line = new THREE.Line(lineGeometry, lineMaterial);
  }

}
