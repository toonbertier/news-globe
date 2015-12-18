'use strict';

import {latLongToVector3} from '../helpers/math';

export class Dot {

  constructor(lat, long, earthRadius, dotType) {

    this.lat = lat;
    this.long = long;
    this.earthRadius = earthRadius;
    this.dotType = dotType;
    this.pos = latLongToVector3(lat, long, earthRadius, 5);

  }

  render() {

    let geometry = new THREE.SphereGeometry(this.dotType.radius, 32, 32);
    let material = new THREE.MeshLambertMaterial( { color: this.dotType.color } );
    this.el = new THREE.Mesh( geometry, material );
    this.el.position.set(this.pos.x, this.pos.y, this.pos.z);

    // let spriteMaterial = new THREE.SpriteMaterial({
    //   map: new THREE.ImageUtils.loadTexture('../assets/glow.png'),
    //   color: this.dotType.color,
    //   transparent: false,
    //   blending: THREE.AdditiveBlending
    // });
    // this.sprite = new THREE.Sprite(spriteMaterial);
    // this.sprite.scale.set(this.dotType.radius + 2, this.dotType.radius + 2, 1.0);
    // this.el.add(this.sprite);



    return this.el;

  }

  renderLine() {

    let lineMaterial = new THREE.LineBasicMaterial({color: 0x444444, linewidth: 0.08});
    let lineGeometry = new THREE.Geometry();

    let beginpos = latLongToVector3(this.lat, this.long, this.earthRadius, 0);
    lineGeometry.vertices.push(new THREE.Vector3(beginpos.x, beginpos.y, beginpos.z));
    let endpos = latLongToVector3(this.lat, this.long, this.earthRadius, 5);
    lineGeometry.vertices.push(new THREE.Vector3(endpos.x, endpos.y, endpos.z));

    this.line = new THREE.Line(lineGeometry, lineMaterial);

    return this.line;

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
