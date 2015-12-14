'use strict';

import {latLongToVector3} from '../helpers/math';

export default class Dot {

  constructor(lat, long, earthRadius, dotType, articleId) {

    let pos = latLongToVector3(lat, long, earthRadius, 0);

    let geometry = new THREE.SphereGeometry(dotType.radius, 32, 32);
    let material = new THREE.MeshLambertMaterial({color: dotType.color});
    this.el = new THREE.Mesh(geometry, material);

    this.clickable = true;
    this.dotType = dotType;

    if(dotType.type === 'news') {
      this.articleId = articleId;
    }

    this.el.position.set(pos.x, pos.y, pos.z);
  }


}
