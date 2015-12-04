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

	eval("__webpack_require__(1);\nmodule.exports = __webpack_require__(3);\n\n\n/*****************\n ** WEBPACK FOOTER\n ** multi main\n ** module id = 0\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///multi_main?");

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	eval("'use strict';\n\n// some features need the be polyfilled..\n// https://babeljs.io/docs/usage/polyfill/\n\n// import 'babel-core/polyfill';\n// or import specific polyfills\n\nvar _helpersMath = __webpack_require__(2);\n\nvar scene = undefined,\n    camera = undefined,\n    light = undefined,\n    renderer = undefined;\nvar controls = undefined;\n\nfunction animate() {\n  requestAnimationFrame(animate);\n  controls.update();\n  light.position.set(camera.position.x, camera.position.y, camera.position.z);\n  light.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);\n}\n\nfunction render() {\n  renderer.render(scene, camera);\n}\n\nvar createGlobe = function createGlobe() {\n\n  return new Promise(function (resolve, reject) {\n\n    var textureLoader = new THREE.TextureLoader();\n\n    textureLoader.load('../assets/world_map.png', function (texture) {\n      var geometry = new THREE.SphereGeometry(100, 64, 64);\n      var material = new THREE.MeshLambertMaterial({ color: 0xffffff });\n      material.map = texture;\n\n      var earth = new THREE.Mesh(geometry, material);\n\n      scene.add(earth);\n      return resolve(true);\n    }, function (xhr) {\n      console.log(xhr.loaded / xhr.total * 100 + '% loaded');\n    }, function (xhr) {\n      console.log('An error happened');\n    });\n  });\n};\n\nvar createTestDots = function createTestDots() {\n\n  for (var i = 0; i < 100; i++) {\n\n    var lat = Math.random() * 180 - 90;\n    var long = Math.random() * 360 - 180;\n\n    var pos = (0, _helpersMath.latLongToVector3)(lat, long, 100, 0);\n\n    var geometry = new THREE.SphereGeometry(2, 32, 32);\n    var material = new THREE.MeshLambertMaterial({ color: 0xff0000 });\n\n    var sphere = new THREE.Mesh(geometry, material);\n    sphere.position.set(pos.x, pos.y, pos.z);\n\n    scene.add(sphere);\n  }\n};\n\nvar init = function init() {\n\n  scene = new THREE.Scene();\n  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);\n\n  camera.position.set(0, 0, 500);\n  camera.lookAt(new THREE.Vector3(0, 0, 0));\n\n  light = new THREE.SpotLight(0xffffff, 0.8);\n  light.position.set(camera.position.x, camera.position.y, camera.position.z);\n  scene.add(light);\n\n  controls = new THREE.OrbitControls(camera);\n  controls.addEventListener('change', render);\n\n  renderer = new THREE.WebGLRenderer();\n\n  renderer.setSize(window.innerWidth, window.innerHeight);\n\n  document.querySelector('main').appendChild(renderer.domElement);\n\n  createGlobe().then(function () {\n    document.querySelector('.loading-div').classList.add('hide');\n    createTestDots();\n    animate();\n    render();\n  });\n};\n\ninit();\n\n/*****************\n ** WEBPACK FOOTER\n ** ./_js/script.js\n ** module id = 1\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./_js/script.js?");

/***/ },
/* 2 */
/***/ function(module, exports) {

	eval("'use strict';\n\nObject.defineProperty(exports, '__esModule', {\n  value: true\n});\nvar latLongToVector3 = function latLongToVector3(lat, lon, radius, heigth) {\n\n  var phi = lat * Math.PI / 180;\n  var theta = (lon - 180) * Math.PI / 180;\n\n  var x = -(radius + heigth) * Math.cos(phi) * Math.cos(theta);\n  var y = (radius + heigth) * Math.sin(phi);\n  var z = (radius + heigth) * Math.cos(phi) * Math.sin(theta);\n\n  return new THREE.Vector3(x, y, z);\n};\nexports.latLongToVector3 = latLongToVector3;\n\n/*****************\n ** WEBPACK FOOTER\n ** ./_js/helpers/math.js\n ** module id = 2\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./_js/helpers/math.js?");

/***/ },
/* 3 */
/***/ function(module, exports) {

	eval("// removed by extract-text-webpack-plugin\n\n/*****************\n ** WEBPACK FOOTER\n ** ./_scss/style.scss\n ** module id = 3\n ** module chunks = 0\n **/\n//# sourceURL=webpack:///./_scss/style.scss?");

/***/ }
/******/ ]);