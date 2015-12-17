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

const MAPWIDTH = 4096;
const MAPHEIGHT = 2048;
const EARTH_RADIUS = 100;
const DOTTYPES = {
  'NEWS': {
    'type': 'news',
    'color': 0x65EBFF,
    'radius': 1
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

const createNewsDots = (NYTimesOffset) => {

  api.getArticlesFromURL(`http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/30.json?api-key=ecc27eb06cf46f006dc3111d9c5b7824:1:73657688&offset=${NYTimesOffset}`).then(articles => {

    $.each(articles, (key, article) => {

      setTimeout(() => {
        api.getGeolocationByAddress(article.geo_facet[0]).then(geocode => {

          if(geocode !== undefined) {

            article.location = geocode;
            let length = geoArticles.push(article);
            let articleKey = length - 1;
            let dot = new NewsDot(article.location.lat, article.location.lng, EARTH_RADIUS, DOTTYPES.NEWS, articleKey);
            newsDots.push(dot);
            scene.add(dot.render());
            scene.add(dot.renderLine());
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
  scene.add(dot.render());
  scene.add(dot.renderLine());

};

const removeWebcamDot = user => {

  let dot = webcamDots.find(w => w.lat === user.lat && w.long === user.long);
  scene.remove(dot.el);
  webcamDots = webcamDots.filter(w => w.el.uuid !== dot.el.uuid);

};

const mouseClickedHandler = intersects => {

  let clickedDots = [];

  for(let i = 0; i < intersects.length; i++) {

    let intersect = intersects[i];

    let clickedDot = searchDotInArray(newsDots, intersect);
    if(!clickedDot) clickedDot = searchDotInArray(webcamDots, intersect);

    if(clickedDot) {
      clickedDots.push(clickedDot);
    }

  }

  if(clickedDots.length > 0) {

    let curr = clickedDots[0];
    let latDiff = Math.abs(camera.lat - curr.lat);
    let longDiff = Math.abs(camera.long - curr.long);

    clickedDots.forEach((dot, index) => {

      let newLatDiff = Math.abs(camera.lat - dot.lat);
      let newLongDiff = Math.abs(camera.long - dot.long);

      if(newLatDiff < latDiff && newLongDiff < longDiff) {
        curr = clickedDots[index];
        latDiff = newLatDiff;
        longDiff = newLongDiff;
      }

    });

    if(curr instanceof NewsDot) {
      handleClickedNewsDot(curr);
    }
    if(curr instanceof WebcamDot) {
      handleClickedWebcamDot(curr);
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
        scene.add(dot.render());
        scene.add(dot.renderLine());

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

const onStream = (stream, call) => {

  let el = videochat.renderCall();

  videochat.displayCallTime(el.querySelector('.stranger-time p'));

  el.querySelector('.user-video-el').src = window.URL.createObjectURL(videochat.userStream);
  el.querySelector('.stranger-video-el').src = window.URL.createObjectURL(stream);
  el.querySelector('.stranger-status p').innerText = 'Connected';

  el.querySelector('.end-call').addEventListener('click', e => {
    call.close();
  });

};

const onClose = () => {
  document.querySelector('.videochat').innerHTML = '';
};

const setupPeer = () => {

  peer = new Peer({
    key: 'hsios35yqzi79zfr'
  });

  peer.on('open', peerid => {
    socket.emit('peerid', peerid);
  });

  peer.on('call', call => {

    let el = videochat.renderAcceptCall({country: 'Belgium'});

    el.querySelector('.accept').addEventListener('click', e => {
      call.answer(videochat.userStream);
    });

    el.querySelector('.deny').addEventListener('click', e => {
      document.querySelector('.videochat').innerHTML = '';
      socket.emit('call_denied', call.peer);
      call.close()
    });

    call.on('stream', stream => {
      el.remove();
      onStream(stream, call);
    });

    call.on('close', onClose);

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
    let el = videochat.renderWaitingCall({country: 'Belgium'});

    call.on('stream', stream => {
      onStream(stream, call);
    });

    call.on('close', () => {
      onClose();
      socket.emit('call_ended', peerid);
    });

  });

};

const createGlobe = () => {

  let projection = d3.geo.equirectangular().translate([MAPWIDTH/2, MAPHEIGHT/2]).scale(652);

  d3.json('../data/world.json', (err, data) => {

    let countries = topojson.feature(data, data.objects.countries);
    let canvas = d3.select("body").append("canvas").style("display", "none").attr({width: MAPWIDTH, height: MAPHEIGHT});
    let context = canvas.node().getContext("2d");
    let path = d3.geo.path().projection(projection).context(context);

    context.beginPath();

    path(countries);

    context.fillStyle = '#03021C';
    context.strokeStyle = '#192E65';
    context.lineWidth = 0.25;
    context.shadowColor = '#57B4E4';
    context.shadowBlur = 5;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;

    context.fill();
    context.stroke();

    let earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);

    let seaMaterial = new THREE.MeshLambertMaterial({color: 0x010303});
    let seaMesh = new THREE.Mesh(earthGeometry, seaMaterial);

    let mapTexture = new THREE.Texture(canvas.node());
    mapTexture.needsUpdate = true;

    let mapMaterial = new THREE.MeshLambertMaterial({map: mapTexture, transparent: true});
    let mapMesh = new THREE.Mesh(earthGeometry, mapMaterial);

    let earth = new THREE.Object3D();
    earth.add(seaMesh);
    earth.add(mapMesh);
    scene.add(earth);

    canvas.remove();

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

  createGlobe();
  document.querySelector('.loading').classList.add('hide');
  for(let i = 0; i < 3; i++) {
    let NYTimesOffset = i * 20;
    createNewsDots(NYTimesOffset);
  }
  update();

  getUserLocation()
  .then(userPos => {
    videochat = new VideoChat();
    videochat.init();
    setupSocket(userPos);
  });

};

init();
