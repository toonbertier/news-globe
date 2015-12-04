'use strict';

// some features need the be polyfilled..
// https://babeljs.io/docs/usage/polyfill/

// import 'babel-core/polyfill';
// or import specific polyfills

import {latLongToVector3} from './helpers/math';

let scene, camera, light, renderer;
let controls;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
}

function render() {
  renderer.render(scene, camera);
}

const createGlobe = () => {

  return new Promise((resolve, reject) => {

    let textureLoader = new THREE.TextureLoader();

    textureLoader.load('../assets/world_map.png',
      texture => {
        let geometry = new THREE.SphereGeometry(100, 64, 64);
        let material = new THREE.MeshLambertMaterial({color: 0xffffff});
        material.map = texture;

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

const createTestDots = () => {

  for(let i = 0; i < 100; i++) {

    let lat = Math.random() * 180 - 90;
    let long = Math.random() * 360 - 180;

    let pos = latLongToVector3(lat, long, 100, 0);

    let geometry = new THREE.SphereGeometry(2, 32, 32);
    let material = new THREE.MeshLambertMaterial({color: 0xff0000});

    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(pos.x, pos.y, pos.z);

    scene.add(sphere);

  }

};

const init = () => {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight,
    1, 10000
  );

  camera.position.set(0, 0, 500);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  light = new THREE.DirectionalLight(0xffffff, 0.8);
  light.position.set(0, 1, 1);
  scene.add(light);

  controls = new THREE.OrbitControls(camera);
  controls.addEventListener('change', render);

  renderer = new THREE.WebGLRenderer();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  document.querySelector('main').appendChild(renderer.domElement);

  createGlobe().then(() => {
    document.querySelector('.loading-div').classList.add('hide');
    createTestDots();
    animate();
    render();
  });

};

init();
