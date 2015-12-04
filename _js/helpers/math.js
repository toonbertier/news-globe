'use strict';

export const latLongToVector3 = (lat, lon, radius, heigth) => {

  let phi = (lat) * Math.PI/180;
  let theta = (lon-180) * Math.PI/180;

  let x = -(radius+heigth) * Math.cos(phi) * Math.cos(theta);
  let y = (radius+heigth) * Math.sin(phi);
  let z = (radius+heigth) * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3(x,y,z);

};
