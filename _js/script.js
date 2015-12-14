'use strict';

// some features need the be polyfilled..
// https://babeljs.io/docs/usage/polyfill/

// import 'babel-core/polyfill';
// or import specific polyfills

let api = require('../modules/api');

let Article = require('./modules/Article');
let Camera = require('./modules/Camera');
let Controls = require('./modules/Controls');
let Dot = require('./modules/Dot');

let scene, camera, renderer, controls;
let currentArticle;
let geoArticles = [], newsDots = [];

const EARTH_RADIUS = 100;
const DOTTYPES = {
  'NEWS': {
    'type': 'news',
    'color': 0xff0000,
    'radius': 0.5
  },
  'USER': {
    'type': 'user',
    'color': 0x00ff00,
    'radius': 1
  },
  'WEBCAM': {
    'type': 'webcam',
    'color': 0xff00ff,
    'radius': 3
  }
};

const update = () => {

  requestAnimationFrame(update);
  camera.update();
  render();

};

const render = () => {
  renderer.render(scene, camera.el);
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
        console.log(`${xhr.loaded / xhr.total * 100} % loaded`);
      }
    );

  });

};

const createNewsDots = () => {

  api.getArticlesFromURL('http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/30.json?api-key=ecc27eb06cf46f006dc3111d9c5b7824:1:73657688').then(articles => {

    $.each(articles, (key, article) => {

      setTimeout(() => {
        api.getGeolocationByAddress(article.geo_facet[0]).then(geocode => {

          if(geocode !== undefined) {
            article.location = geocode;
            geoArticles.push(article);
            let dot = new Dot(article.location.lat, article.location.lng, EARTH_RADIUS, DOTTYPES.NEWS, key);
            newsDots.push(dot);
            scene.add(dot.el);
          }

        });
      }, key * 200);

    });

    render();

  }).catch(err => {
    console.log(err);
  });

};

const mouseClickedHandler = (objects) => {

  let clickedNewsDot = false;

  for (let i = 0; i < objects.length; i++) {

    let obj = objects[i].object;

    for(let j = 0; j < newsDots.length; j++) {
      if(newsDots[j].el.uuid === obj.uuid) {
        clickedNewsDot = newsDots[j];
        break;
      }
    }

    if(clickedNewsDot) break;

  }

  if(clickedNewsDot) {
    currentArticle = new Article(geoArticles[clickedNewsDot.articleId]);
    currentArticle.render();
  }

};

const setupControls = () => {

  controls = new Controls(scene, camera.el);

  bean.on(controls, 'mouse_moved', v => {
    camera.setCameraValues(v);
  });

  bean.on(controls, 'mouse_clicked', o => {
    mouseClickedHandler(o);
  });

};

const getUserLocation = () => {

  if ('geolocation' in navigator) {

    navigator.geolocation.getCurrentPosition(position => {
      let dot = new Dot(position.coords.latitude, position.coords.longitude, EARTH_RADIUS, DOTTYPES.USER);
      scene.add(dot.el);
    });

  } else {
    console.log('geen geolocatie');
  }

};

const init = () => {

  getUserLocation();

  scene = new THREE.Scene();
  camera = new Camera();
  scene.add(camera.light);

  setupControls();

  renderer = new THREE.WebGLRenderer();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  document.querySelector('main').appendChild(renderer.domElement);

  createGlobe().then(() => {
    document.querySelector('.loading').classList.add('hide');
    createNewsDots();
    update();
  });

};

init();
