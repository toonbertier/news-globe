'use strict';

// some features need the be polyfilled..
// https://babeljs.io/docs/usage/polyfill/

// import 'babel-core/polyfill';
// or import specific polyfills

let api = require('../modules/api');

let Article = require('./modules/Article');
let Camera = require('./modules/Camera');
let Controls = require('./modules/Controls');
let VideoChat = require('./modules/VideoChat');

import {Dot, NewsDot, WebcamDot} from './modules/Dot';

let scene, camera, renderer, controls;
let currentArticle;
let geoArticles = [], newsDots = [], webcamDots = [];
let socket, peer, videochat;

const EARTH_RADIUS = 100;
const DOTTYPES = {
  'NEWS': {
    'type': 'news',
    'color': 0xff0000,
    'radius': 0.7
  },
  'USER': {
    'type': 'user',
    'color': 0x00ff00,
    'radius': 0.3
  },
  'WEBCAM': {
    'type': 'webcam',
    'color': 0x0000ff,
    'radius': 0.5
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
            let dot = new NewsDot(article.location.lat, article.location.lng, EARTH_RADIUS, DOTTYPES.NEWS, key);
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

const createWebcamDot = user => {

  let dot = new WebcamDot(user.lat, user.long, EARTH_RADIUS, DOTTYPES.WEBCAM, user.socketid);
  webcamDots.push(dot);
  scene.add(dot.el);

};

const removeWebcamDot = user => {

  let dot = webcamDots.find(w => w.lat === user.lat && w.long === user.long);
  scene.remove(dot.el);
  webcamDots = webcamDots.filter(w => w.el.uuid !== dot.el.uuid);

};

const mouseClickedHandler = intersects => {

  let clickedDot = false;

  for(let i = 0; i < intersects.length; i++) {

    let intersect = intersects[i];

    clickedDot = searchDotInArray(newsDots, intersect);
    if(!clickedDot) clickedDot = searchDotInArray(webcamDots, intersect);
    if(clickedDot) break;

  }

  if(clickedDot) {
    if(clickedDot instanceof NewsDot) {
      handleClickedNewsDot(clickedDot);
    }
    if(clickedDot instanceof WebcamDot) {
      handleClickedWebcamDot(clickedDot);
    }
  }

};

const searchDotInArray = (arr, intersect) => {

  for(let i = 0; i < arr.length; i++) {
    if(arr[i].el.uuid === intersect.object.uuid) {
      return arr[i];
    }
  }

  return false;

};

const handleClickedNewsDot = dot => {
  currentArticle = new Article(geoArticles[dot.articleId]);
  currentArticle.render();
};

const handleClickedWebcamDot = dot => {
  socket.emit('try_calling', dot.socketid);
};

const getUserLocation = () => {

  return new Promise((resolve, reject) => {

     if ('geolocation' in navigator) {

      navigator.geolocation.getCurrentPosition(position => {

        let dot = new Dot(position.coords.latitude, position.coords.longitude, EARTH_RADIUS, DOTTYPES.USER);
        scene.add(dot.el);

        resolve(position);

      });

    }

  });

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

const setupPeer = () => {

  peer = new Peer({
    key: 'hsios35yqzi79zfr'
  });

  peer.on('open', peerid => {
    socket.emit('peerid', peerid);
  });

  peer.on('call', call => {
    let el = videochat.renderAcceptCall({country: 'testlocatie'});

    el.querySelector('.accept').addEventListener('click', e => {
      call.answer(videochat.userStream);
      el = videochat.renderCall();
    });

    el.querySelector('.deny').addEventListener('click', e => {
      document.querySelector('.videochat').innerHTML = '';
      socket.emit('call_denied', call.peer);
      call.close()
    });

    call.on('stream', stream => {
      el.querySelector('.user-video-el').src = window.URL.createObjectURL(videochat.userStream);
      el.querySelector('.stranger-video-el').src = window.URL.createObjectURL(stream);

      el.querySelector('.end-call').addEventListener('click', e => {
        call.close();
      });
    });

    call.on('close', () => {
      document.querySelector('.videochat').innerHTML = '';
    });

  });

}

const setupSocket = (pos) => {

  socket = io('http://localhost:3000', {query: `long=${pos.coords.longitude}&lat=${pos.coords.latitude}`});
  socket.on('connect', setupPeer);

  socket.on('init', users => {
    users.forEach(user => {
      createWebcamDot(user);
    });
  });

  socket.on('new_user', user => {
    createWebcamDot(user);
  });

  socket.on('user_left', user => {
    removeWebcamDot(user);
  });

  socket.on('user_already_in_call', socketid => {
    videochat.renderAlreadyInCall();
  });

  socket.on('call_was_denied', socketid => {
    videochat.renderDeniedCall();
  });

  socket.on('ready_to_call_peer', peerid => {
    let call = peer.call(peerid, videochat.userStream);

    let el = videochat.renderWaitingCall({country: 'testlocatie'});
    el.querySelector('.end').addEventListener('click', e => {
      console.log('end call');
      call.close();
    });

    call.on('stream', stream => {
      let el = videochat.renderCall();
      el.querySelector('.user-video-el').src = window.URL.createObjectURL(videochat.userStream);
      el.querySelector('.stranger-video-el').src = window.URL.createObjectURL(stream);

      el.querySelector('.end-call').addEventListener('click', e => {
        call.close();
      });

    });

    call.on('close', () => {
      document.querySelector('.videochat').innerHTML = '';
      socket.emit('call_ended', peerid);
    });
  });

};

const init = () => {

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

  createGlobe()
  .then(() => {
    document.querySelector('.loading').classList.add('hide');
    createNewsDots();
    update();
  });

  getUserLocation()
  .then(userPos => {
    videochat = new VideoChat();
    videochat.init();
    setupSocket(userPos);
  });

};

init();
