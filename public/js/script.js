/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	eval("__webpack_require__(1);\nmodule.exports = __webpack_require__(4);\n\n\n/*****************\n ** WEBPACK FOOTER\n ** multi main\n ** module id = 0\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///multi_main?");

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	eval("'use strict';\n\n// some features need the be polyfilled..\n// https://babeljs.io/docs/usage/polyfill/\n\n// import 'babel-core/polyfill';\n// or import specific polyfills\n\nvar _helpersMath = __webpack_require__(2);\n\nvar api = __webpack_require__(3);\nvar scene = undefined,\n    camera = undefined,\n    light = undefined,\n    renderer = undefined;\n\nvar cameraLong = 0,\n    cameraLat = 0;\nvar cameraSpeedLong = 0,\n    cameraSpeedLat = 0;\nvar cameraDirLong = false,\n    cameraDirLat = false;\n\nvar EARTH_RADIUS = 100;\nvar DOTTYPES = {\n  'NEWS': {\n    'color': 0xff0000,\n    'radius': 2\n  },\n  'USER': {\n    'color': 0x00ff00,\n    'radius': 1\n  },\n  'WEBCAM': {\n    'color': 0xff00ff,\n    'radius': 3\n  }\n};\n\nvar update = function update() {\n\n  requestAnimationFrame(update);\n\n  moveCamera();\n\n  light.position.set(camera.position.x, camera.position.y, camera.position.z);\n  light.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);\n\n  render();\n};\n\nvar render = function render() {\n  renderer.render(scene, camera);\n};\n\nvar moveCamera = function moveCamera() {\n\n  var newCamLong = undefined;\n  if (cameraDirLong) {\n    newCamLong = cameraLong + cameraSpeedLong;\n  } else {\n    newCamLong = cameraLong - cameraSpeedLong;\n  }\n\n  if (newCamLong > -90 && newCamLong < 100) {\n    cameraLong = newCamLong;\n  }\n\n  var newCamLat = undefined;\n  if (cameraDirLat) {\n    newCamLat = cameraLat + cameraSpeedLat;\n  } else {\n    newCamLat = cameraLat - cameraSpeedLat;\n  }\n\n  if (newCamLat > -45 && newCamLat < 45) {\n    cameraLat = newCamLat;\n  }\n\n  var pos = (0, _helpersMath.latLongToVector3)(cameraLat, cameraLong, 100, 100);\n  camera.position.set(pos.x, pos.y, pos.z);\n\n  camera.lookAt(new THREE.Vector3(0, 0, 0));\n};\n\nvar createGlobe = function createGlobe() {\n\n  return new Promise(function (resolve, reject) {\n\n    var textureLoader = new THREE.TextureLoader();\n\n    textureLoader.load('../assets/world_map.svg', function (texture) {\n      var geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);\n      var material = new THREE.MeshLambertMaterial({ color: 0xffffff });\n      material.map = texture;\n      material.transparent = false;\n\n      var earth = new THREE.Mesh(geometry, material);\n\n      scene.add(earth);\n      return resolve(true);\n    }, function (xhr) {\n      console.log(xhr.loaded / xhr.total * 100 + '% loaded');\n    }, function (xhr) {\n      console.log('An error happened');\n    });\n  });\n};\n\nvar createDot = function createDot(lat, long, dotType) {\n\n  var pos = (0, _helpersMath.latLongToVector3)(lat, long, EARTH_RADIUS, 0);\n  var geometry = new THREE.SphereGeometry(dotType.radius, 32, 32);\n  var material = new THREE.MeshLambertMaterial({ color: dotType.color });\n  var dot = new THREE.Mesh(geometry, material);\n\n  dot.position.set(pos.x, pos.y, pos.z);\n  scene.add(dot);\n};\n\nvar createNewsDots = function createNewsDots() {\n\n  api.getArticlesFromNYTimes().then(function (articles) {\n\n    $.each(articles, function (key, article) {\n      createDot(article.location.lat, article.location.lng, DOTTYPES.NEWS);\n    });\n\n    render();\n  })['catch'](function (err) {\n    console.log(err);\n  });\n};\n\nvar getUserLocation = function getUserLocation() {\n\n  if (\"geolocation\" in navigator) {\n\n    navigator.geolocation.getCurrentPosition(function (position) {\n      createDot(position.coords.latitude, position.coords.longitude, DOTTYPES.USER);\n    });\n  } else {\n    console.log('geen geolocatie');\n  }\n};\n\nvar setupInputEvents = function setupInputEvents() {\n\n  // document.addEventListener('keydown', function(e) {\n\n  //   switch (e.keyCode) {\n  //     case 37:\n  //       cameraDeg -= 1;\n  //       break;\n  //     case 39:\n  //       cameraDeg += 1;\n  //       break;\n  //   }\n\n  //   // document.addEventListener('keyup', function() {\n  //   //   robot.speed = 0;\n  //   // });\n\n  // });\n\n  window.addEventListener('mousemove', function (e) {\n\n    // long-rotatie\n\n    if (e.clientX < window.innerWidth / 3) {\n      cameraDirLong = false;\n      cameraSpeedLong = (window.innerWidth / 3 - e.clientX) / 1200;\n    } else if (e.clientX > 2 * window.innerWidth / 3) {\n      cameraDirLong = true;\n      cameraSpeedLong = (e.clientX - 2 * window.innerWidth / 3) / 1200;\n    } else {\n      cameraSpeedLong = 0;\n    }\n\n    // lat-rotatie\n\n    if (e.clientY < window.innerHeight / 3) {\n      cameraDirLat = true;\n      cameraSpeedLat = (window.innerHeight / 3 - e.clientY) / 1200;\n    } else if (e.clientY > 2 * window.innerHeight / 3) {\n      cameraDirLat = false;\n      cameraSpeedLat = (e.clientY - 2 * window.innerHeight / 3) / 1200;\n    } else {\n      cameraSpeedLat = 0;\n    }\n  });\n};\n\nvar init = function init() {\n\n  getUserLocation();\n  setupInputEvents();\n\n  scene = new THREE.Scene();\n  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);\n\n  camera.position.set(0, 0, 200);\n  camera.lookAt(new THREE.Vector3(0, 0, 0));\n\n  light = new THREE.SpotLight(0xffffff, 0.8);\n  light.position.set(camera.position.x, camera.position.y, camera.position.z);\n  scene.add(light);\n\n  renderer = new THREE.WebGLRenderer();\n\n  renderer.setSize(window.innerWidth, window.innerHeight);\n\n  document.querySelector('main').appendChild(renderer.domElement);\n\n  createGlobe().then(function () {\n    document.querySelector('.loading-div').classList.add('hide');\n    createNewsDots();\n    update();\n  });\n};\n\ninit();\n\n/*****************\n ** WEBPACK FOOTER\n ** ./_js/script.js\n ** module id = 1\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./_js/script.js?");

/***/ },
/* 2 */
/***/ function(module, exports) {

	eval("'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\nvar latLongToVector3 = function latLongToVector3(lat, lon, radius, heigth) {\n\n  var phi = lat * Math.PI / 180;\n  var theta = (lon - 180) * Math.PI / 180;\n\n  var x = -(radius + heigth) * Math.cos(phi) * Math.cos(theta);\n  var y = (radius + heigth) * Math.sin(phi);\n  var z = (radius + heigth) * Math.cos(phi) * Math.sin(theta);\n\n  return new THREE.Vector3(x, y, z);\n};\nexports.latLongToVector3 = latLongToVector3;\n\n/*****************\n ** WEBPACK FOOTER\n ** ./_js/helpers/math.js\n ** module id = 2\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./_js/helpers/math.js?");

/***/ },
/* 3 */
/***/ function(module, exports) {

	eval("'use strict';\n\nvar getArticlesFromNYTimes = function getArticlesFromNYTimes() {\n\n  return new Promise(function (resolve, reject) {\n\n    var articles = [];\n    var acceptedArticleCount = 0;\n\n    $.getJSON('http://api.nytimes.com/svc/topstories/v1/world.json?api-key=35b802b79eac0b383a75cee4e82e605c:17:73657688', function (data) {\n\n      $.each(data.results, function (key, article) {\n\n        if (!article.geo_facet) return;\n        acceptedArticleCount++;\n\n        setTimeout(function () {\n          $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + article.geo_facet[0], function (geocode) {\n            article.location = geocode.results[0].geometry.location;\n            articles.push(article);\n            // console.log(article.geo_facet[0], '>', geocode.results[0].geometry.location.lat, geocode.results[0].geometry.location.lng);\n            if (articles.length === acceptedArticleCount) return resolve(articles);\n          }).fail(function (err) {\n            return reject(err);\n          });\n        }, key * 200);\n      });\n    });\n  });\n};\n\nmodule.exports = {\n  getArticlesFromNYTimes: getArticlesFromNYTimes\n};\n\n/*****************\n ** WEBPACK FOOTER\n ** ./modules/api.js\n ** module id = 3\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./modules/api.js?");

/***/ },
/* 4 */
/***/ function(module, exports) {

	eval("// removed by extract-text-webpack-plugin\n\n/*****************\n ** WEBPACK FOOTER\n ** ./_scss/style.scss\n ** module id = 4\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./_scss/style.scss?");

/***/ }
/******/ ]);