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
let currentArticle, currentVideoChat;
let geoArticles = [], newsDots = [], webcamDots = [];
let socket, peer, videochat;

const MAPWIDTH = 4096;
const MAPHEIGHT = 2048;
const EARTH_RADIUS = 100;
const DOTTYPES = {
  'NEWS': {
    'type': 'news',
    'color': 0x65EBFF,
    'radius': 1.2
  },
  'USER': {
    'type': 'user',
    'color': 0x00ff00,
    'radius': 0.5
  },
  'WEBCAM': {
    'type': 'webcam',
    'color': 0x0000ff,
    'radius': 1.2
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

  api.getArticlesFromURL(`https://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/30.json?api-key=ecc27eb06cf46f006dc3111d9c5b7824:1:73657688&offset=${NYTimesOffset}`).then(articles => {

    $.each(articles, (key, article) => {

      if(article.url.indexOf('interactive') == -1) {

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

      }

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

const checkTargets = () => {

  let foundNews = [];
  let foundCams = [];

  if(newsDots.length > 0) {
    foundNews = searchDotInLatAndLongRange(newsDots);
  }

  if(webcamDots.length > 0) {
    foundCams = searchDotInLatAndLongRange(webcamDots);
  }

  let closest = [];

  if(foundNews.length > 0) {
    closest.push(findClosestLatAndLong(foundNews));
  }
  if(foundCams.length > 0) {
    closest.push(findClosestLatAndLong(foundCams));
  }

  if(closest.length > 0) {
    let foundDot = findClosestLatAndLong(closest);
    showDotButton(foundDot);
  } else {
    hideDotButton();
  }

};

const showDotButton = (dot) => {

  $('.hud-instruction').addClass('hide');

  if(dot instanceof NewsDot) {
    $('.dot-title').text(geoArticles[dot.articleId].title);
    $('.read-button').text('READ MORE');
    $('.read-button').on('click', e => {
      e.preventDefault();
      handleClickedNewsDot(dot)
    });
  }
  if(dot instanceof WebcamDot) {
    $('.dot-title').text('User available for videochat');
    $('.read-button').text('OPEN');
    $('.read-button').on('click', e => {
      e.preventDefault();
      handleClickedWebcamDot(dot)
    });
  }

  $('.dot-title').removeClass('hide');
  $('.read-button').removeClass('hide');

};

const hideDotButton = () => {
  $('.hud-instruction').removeClass('hide');
  $('.dot-title').addClass('hide');
  $('.read-button').addClass('hide');
};

const searchDotInLatAndLongRange = (arr) => {

  let found = [];

  for(let i = 0; i < arr.length; i++) {
    if(arr[i].lat > camera.lat - 0.4
      && arr[i].lat < camera.lat + 2.6
      && arr[i].long > camera.long - 1.8
      && arr[i].long < camera.long + 1.8)
    {
      found.push(arr[i]);
    }
  }

  return found;

};

const findClosestLatAndLong = (arr, lat, long) => {

  let curr = arr[0];
  let latDiff = Math.abs(lat - curr.lat);
  let longDiff = Math.abs(long - curr.long);

  arr.forEach((dot, index) => {

    let newlatDiff = Math.abs(lat - dot.lat);
    let newlongDiff = Math.abs(long - dot.long);

    if(newlatDiff < latDiff && newlongDiff < longDiff) {
      curr = arr[index];
      latDiff = newlatDiff;
      longDiff = newlongDiff;
    }

  });

  return curr;

};

const handleClickedNewsDot = dot => {

  if(currentArticle == undefined || currentArticle.data.id !== geoArticles[dot.articleId].id) {

    console.log('handling news dot');
    currentArticle = new Article(geoArticles[dot.articleId]);
    currentArticle.render();

  }

};

const handleClickedWebcamDot = dot => {

  if(currentVideoChat == undefined || currentVideoChat !== dot.socketid) {
    currentVideoChat = dot.socketid;
    socket.emit('try_calling', dot.socketid);
  }

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
      videochat.onStream(stream, call);
    });

    call.on('close', () => {
      videochat.onClose;
      currentVideoChat = undefined;
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
    let el = videochat.renderWaitingCall({country: 'Belgium'});

    call.on('stream', stream => {
      videochat.onStream(stream, call);
    });

    call.on('close', () => {
      videochat.onClose();
      socket.emit('call_ended', peerid);
      currentVideoChat = undefined;
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

  bean.on(camera, 'check_targets', checkTargets);

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
