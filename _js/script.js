'use strict';

// some features need the be polyfilled..
// https://babeljs.io/docs/usage/polyfill/

// import 'babel-core/polyfill';
// or import specific polyfills

import {latLongToVector3} from './helpers/math';

let api = require('../modules/api');
let scene, camera, light, renderer;

let cameraLong = 0, cameraLat = 0
let cameraSpeedLong = 0, cameraSpeedLat = 0
let cameraDirLong = false, cameraDirLat = false;

const EARTH_RADIUS = 100;
const DOTTYPES =
{
  'NEWS': {
    'color': 0xff0000,
    'radius': 0.5
  },
  'USER': {
    'color': 0x00ff00,
    'radius': 1
  },
  'WEBCAM': {
    'color': 0xff00ff,
    'radius': 3
  }
}

const update = () => {

  requestAnimationFrame(update);

  moveCamera();

  light.position.set(camera.position.x, camera.position.y, camera.position.z);
  light.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);

  render();

};

const render = () => {
  renderer.render(scene, camera);
};

const moveCamera = () => {

  let newCamLong;
  if(cameraDirLong) {
    newCamLong = cameraLong + cameraSpeedLong;
  } else {
    newCamLong = cameraLong - cameraSpeedLong;
  }

  if(newCamLong > -90 && newCamLong < 100) {
    cameraLong = newCamLong;
  }

  let newCamLat;
  if(cameraDirLat) {
    newCamLat = cameraLat + cameraSpeedLat;
  } else {
    newCamLat = cameraLat - cameraSpeedLat;
  }

  if(newCamLat > -45 && newCamLat < 45) {
    cameraLat = newCamLat;
  }

  let pos = latLongToVector3(cameraLat, cameraLong, 100, 100);
  camera.position.set(pos.x, pos.y, pos.z);

  camera.lookAt(new THREE.Vector3(0, 0, 0));

};

const createGlobe = () => {

  return new Promise((resolve, reject) => {

    let textureLoader = new THREE.TextureLoader();

    textureLoader.load('../assets/world_map.svg',
      texture => {
        let geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
        let material = new THREE.MeshLambertMaterial({color: 0xffffff});
        material.map = texture;
        material.transparent = false;

        let earth = new THREE.Mesh(geometry, material);

        scene.add(earth);
        return resolve(true);
      },
      xhr => {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
      xhr => {
        console.log( 'An error happened' );
      }
    );

  });

};

const createDot = (lat, long, dotType) => {

  let pos = latLongToVector3(lat, long, EARTH_RADIUS, 0);
  let geometry = new THREE.SphereGeometry(dotType.radius, 32, 32);
  let material = new THREE.MeshLambertMaterial({color: dotType.color});
  let dot = new THREE.Mesh(geometry, material);

  dot.position.set(pos.x, pos.y, pos.z);
  scene.add(dot);

};

const createNewsDots = () => {

  api.getArticlesFromNYTimes().then(articles => {

    $.each(articles, (key, article) => {
      createDot(article.location.lat, article.location.lng, DOTTYPES.NEWS);
    });

    render();

  }).catch(err => {
    console.log(err);
  });

};

const getUserLocation = () => {

  if ("geolocation" in navigator) {

    navigator.geolocation.getCurrentPosition(position => {
      createDot(position.coords.latitude, position.coords.longitude, DOTTYPES.USER);
    });

  } else {
    console.log('geen geolocatie');
  }

};

const setupInputEvents = () => {

  // document.addEventListener('keydown', function(e) {

  //   switch (e.keyCode) {
  //     case 37:
  //       cameraDeg -= 1;
  //       break;
  //     case 39:
  //       cameraDeg += 1;
  //       break;
  //   }

  //   // document.addEventListener('keyup', function() {
  //   //   robot.speed = 0;
  //   // });

  // });

  window.addEventListener('mousemove', function(e) {

    // long-rotatie

    if(e.clientX < window.innerWidth/3) {
      cameraDirLong = false;
      cameraSpeedLong = (window.innerWidth/3 - e.clientX) / 800;
    } else if(e.clientX > 2 * window.innerWidth/3) {
      cameraDirLong = true;
      cameraSpeedLong = (e.clientX - 2 * window.innerWidth/3) / 800;
    } else {
      cameraSpeedLong = 0;
    }

    // lat-rotatie

    if(e.clientY < window.innerHeight/3) {
      cameraDirLat = true;
      cameraSpeedLat = (window.innerHeight/3 - e.clientY) / 800;
    } else if(e.clientY > 2 * window.innerHeight/3) {
      cameraDirLat = false;
      cameraSpeedLat = (e.clientY - 2 * window.innerHeight/3) / 800;
    } else {
      cameraSpeedLat = 0;
    }

  });

};

const init = () => {

  getUserLocation();
  setupInputEvents();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight,
    1, 10000
  );

  camera.position.set(0, 0, 200);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  light = new THREE.SpotLight(0xffffff, 0.8);
  light.position.set(camera.position.x, camera.position.y, camera.position.z);
  scene.add(light);

  renderer = new THREE.WebGLRenderer();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  document.querySelector('main').appendChild(renderer.domElement);

  createGlobe().then(() => {
    document.querySelector('.loading-div').classList.add('hide');
    createNewsDots();
    update();
  });

};

init();
