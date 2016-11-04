/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var InnerWorld = __webpack_require__(1).default;
	var InnerView = __webpack_require__(4).default;
	var InnerGaze = __webpack_require__(5).default;
	
	document.addEventListener("DOMContentLoaded", function () {
	   var inner = new InnerController();
	});
	
	var InnerController = function () {
	   function InnerController() {
	      _classCallCheck(this, InnerController);
	
	      this.world = new InnerWorld();
	      this.view = new InnerView();
	      this.gaze = new InnerGaze(this.world.scene);
	      this.input = new DesktopControls();
	
	      this.socket = io(document.location.origin);
	      this.lastMessage = { pivot: '', pos: '' };
	
	      this.bindSocketEvents();
	      this.socketUpdate();
	
	      this.active = true;
	      this.mainLoop();
	   }
	
	   /*
	    *  'Private' methods
	    */
	
	   _createClass(InnerController, [{
	      key: 'mainLoop',
	      value: function mainLoop() {
	         var _this = this;
	
	         if (!this.active) return;
	
	         window.requestAnimationFrame(function () {
	            _this.mainLoop();
	         });
	
	         if (!this.world.busy) {
	            var target = this.gaze.getGaze(this.view.camera, this.world.worldObject.navNodes.children, this.world.position);
	            if (target != null) this.world.setMoveTo(target);
	
	            //this.world.setJumpBy(this.input.getMovement(),this.view.getRotation());
	         }
	
	         if (this.world.update()) {
	            this.socketUpdate();
	            this.checkTriggers();
	         }
	
	         //this.view.rotate(this.input.getMouse());
	
	         this.view.render(this.world.scene);
	      }
	   }, {
	      key: 'checkTriggers',
	      value: function checkTriggers() {
	         switch (this.world.checkTriggers()) {
	            case 'Trigger_Finish':
	               console.log('mainGame -> won');
	               this.stopSoundTrack();
	
	               this.socket.emit('won', true);
	               break;
	         }
	      }
	   }, {
	      key: 'socketUpdate',
	      value: function socketUpdate() {
	         var newWorldPos = JSON.stringify({
	            x: this.world.position.x,
	            y: this.world.position.y,
	            z: this.world.position.z
	         });
	
	         if (newWorldPos !== this.lastMessage.pos) {
	            this.socket.emit('world-position', newWorldPos);
	            this.lastMessage.pos = newWorldPos;
	            console.log('mainGame -> worldpos', newWorldPos);
	         }
	      }
	   }, {
	      key: 'bindSocketEvents',
	      value: function bindSocketEvents() {
	         var _this2 = this;
	
	         this.socket.on('rotate-h', function () {
	            _this2.world.setRotateTo(_this2.world, 72);
	         });
	         this.socket.on('rotate-k', function () {
	            _this2.world.setRotateTo(_this2.world, 75);
	         });
	         this.socket.on('rotate-u', function () {
	            _this2.world.setRotateTo(_this2.world, 85);
	         });
	         this.socket.on('rotate-j', function () {
	            _this2.world.setRotateTo(_this2.world, 74);
	         });
	      }
	   }]);

	   return InnerController;
	}();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var NavPath = __webpack_require__(2).default;
	var TriggerObject = __webpack_require__(3).default;
	
	var InnerWorld = function () {
	    function InnerWorld() {
	        _classCallCheck(this, InnerWorld);
	
	        this.props = {
	            rotationSpeed: 0.03,
	            moveSpeed: 0.2,
	            isRotating: false,
	            isMoving: false,
	            vectorRotationCurrent: new THREE.Vector3(0, 0, 0),
	            vectorRotationTarget: new THREE.Vector3(0, 0, 0),
	            vectorMoveTarget: new THREE.Vector3(0, 0, 0),
	            rotationAsDegrees: []
	        };
	
	        this.worldObject = this.getWorldObject();
	        this.lights = this.getLights();
	        this.skybox = this.getSkybox();
	        this.pivotObject = new THREE.Object3D();
	        this.scene = this.getScene();
	    }
	
	    /*
	     *  'Public' methods
	     */
	
	    _createClass(InnerWorld, [{
	        key: 'setRotateTo',
	        value: function setRotateTo(which) {
	            if (this.isBusy()) return;
	
	            this.props.vectorRotationTarget = new THREE.Vector3(this.props.vectorRotationCurrent.x, this.props.vectorRotationCurrent.y, this.props.vectorRotationCurrent.z);
	
	            switch (which) {
	                case 72:
	                    //H
	                    this.props.vectorRotationTarget.z = this.props.vectorRotationTarget.z + Math.PI * .5;
	                    break;
	                case 75:
	                    //K
	                    this.props.vectorRotationTarget.z = this.props.vectorRotationTarget.z - Math.PI * .5;
	                    break;
	                case 85:
	                    //U
	                    this.props.vectorRotationTarget.x = this.props.vectorRotationTarget.x - Math.PI * .5;
	                    break;
	                case 74:
	                    //J
	                    this.props.vectorRotationTarget.x = this.props.vectorRotationTarget.x + Math.PI * .5;
	                    break;
	            }
	
	            this.props.isRotating = true;
	        }
	    }, {
	        key: 'setMoveTo',
	        value: function setMoveTo(target) {
	            var offset = new THREE.Vector3(target.x, target.y, target.z);
	            this.props.vectorMoveTarget = new THREE.Vector3().subVectors(this.worldObject.obj.position, offset);
	            this.props.isMoving = true;
	        }
	    }, {
	        key: 'rotate',
	        value: function rotate() {
	            if (!this.props.isRotating) return;
	
	            var delta = new THREE.Vector3();
	            delta.subVectors(this.props.vectorRotationTarget, this.props.vectorRotationCurrent);
	
	            if (delta.length() < this.props.rotationSpeed) {
	                // rotation is very close to target
	                // so set rotation to target and stop rotating
	                this.props.vectorRotationCurrent = this.props.vectorRotationTarget;
	                this.rotateOneTick();
	                this.props.isRotating = false;
	                this.props.rotationAsDegrees = this.fixDegrees([this.worldObject.obj.getWorldRotation().x, this.worldObject.obj.getWorldRotation().y, this.worldObject.obj.getWorldRotation().z]);
	
	                return true;
	            } else {
	                // rotation by rotationSpeed
	                delta.setLength(this.props.rotationSpeed);
	                this.props.vectorRotationCurrent.add(delta);
	                this.rotateOneTick();
	            }
	
	            return false;
	        }
	    }, {
	        key: 'move',
	        value: function move() {
	            if (!this.props.isMoving) return;
	
	            var delta = new THREE.Vector3();
	            delta.subVectors(this.props.vectorMoveTarget, this.worldObject.obj.position);
	
	            if (delta.length() < this.props.moveSpeed) {
	                // move is very close to target
	                // so set position to target and stop moving
	                this.worldObject.obj.position.x = this.props.vectorMoveTarget.x;
	                this.worldObject.obj.position.y = this.props.vectorMoveTarget.y;
	                this.worldObject.obj.position.z = this.props.vectorMoveTarget.z;
	                this.props.isMoving = false;
	                this.updateNodes();
	                return true;
	            } else {
	                // move by moveSpeed
	                delta.setLength(this.props.moveSpeed);
	                this.worldObject.obj.position.add(delta);
	            }
	            return false;
	        }
	    }, {
	        key: 'update',
	        value: function update() {
	            if (this.rotate() || this.move()) return true;
	        }
	    }, {
	        key: 'updateNodes',
	        value: function updateNodes() {
	            this.worldObject.navPaths.forEach(function (navPath) {
	                navPath.setVisible(this.worldObject.obj.position);
	            }, this);
	        }
	    }, {
	        key: 'checkTriggers',
	        value: function checkTriggers() {
	            var _this = this;
	
	            this.worldObject.triggers.forEach(function (trigger) {
	                trigger.checkHit(_this.position, function (name) {
	                    return name;
	                });
	            });
	
	            return '';
	        }
	    }, {
	        key: 'rotateOneTick',
	
	
	        /*
	         *  'Private' methods
	         */
	
	        value: function rotateOneTick() {
	            this.pivotObject.rotation.x = this.props.vectorRotationCurrent.x;
	            this.pivotObject.rotation.y = this.props.vectorRotationCurrent.y;
	            this.pivotObject.rotation.z = this.props.vectorRotationCurrent.z;
	            this.pivotObject.updateMatrixWorld();
	        }
	    }, {
	        key: 'isBusy',
	        value: function isBusy() {
	            return this.props.isMoving || this.props.isRotating;
	        }
	
	        //turn radians into degrees, rounded to 0, 90, 180 or 270
	
	    }, {
	        key: 'fixDegrees',
	        value: function fixDegrees(radArray) {
	            var r = [],
	                d = void 0;
	            for (var i = 0; i < radArray.length; i++) {
	                d = Math.round(radArray[i] * 180 / Math.PI / 10) * 10;
	                d = d === -90 ? 270 : d;
	                r.push(Math.abs(d));
	            }
	            return r;
	        }
	
	        /*
	         *  Init methods
	         */
	
	    }, {
	        key: 'getScene',
	        value: function getScene() {
	            var scene = new THREE.Scene();
	            scene.add(this.lights.playerLight);
	            scene.add(this.lights.globalLight);
	            scene.add(this.skybox);
	
	            this.pivotObject.add(this.worldObject.obj);
	            scene.add(this.pivotObject);
	
	            return scene;
	        }
	    }, {
	        key: 'getLights',
	        value: function getLights() {
	            var playerLight = new THREE.PointLight(0xffffff, 1, 20);
	            var globalLight = new THREE.HemisphereLight(0xff0000, 0x89584B, 0.3);
	
	            playerLight.position.set(0, 0, 0);
	
	            return {
	                playerLight: playerLight,
	                globalLight: globalLight
	            };
	        }
	    }, {
	        key: 'getSkybox',
	        value: function getSkybox() {
	            var imagePrefix = "/assets/textures/images/skybox-innerView-";
	            var directions = ["west", "east", "up", "down", "north", "south"];
	            var imageSuffix = ".jpg";
	            var skyGeometry = new THREE.BoxGeometry(100, 100, 100);
	
	            var skyMaterialArray = [];
	            for (var i = 0; i < 6; i++) {
	                skyMaterialArray.push(new THREE.MeshBasicMaterial({
	                    map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
	                    side: THREE.BackSide
	                }));
	            }
	            var skyMaterial = new THREE.MeshFaceMaterial(skyMaterialArray);
	
	            return new THREE.Mesh(skyGeometry, skyMaterial);
	        }
	    }, {
	        key: 'getWorldObject',
	        value: function getWorldObject() {
	            var _this2 = this;
	
	            var loader = new THREE.ColladaLoader();
	
	            var worldObject = new THREE.Object3D();
	            var triggerObjects = [];
	            var navPaths = [];
	            var navNodesObject = new THREE.Object3D();
	
	            var material = new THREE.MeshPhongMaterial({ color: 0x333333 });
	
	            loader.load('/assets/models/prototypeMazeV4.dae', function (collada) {
	                var dae = collada.scene;
	
	                dae.scale.x = dae.scale.y = dae.scale.z = 0.01;
	
	                dae.traverse(function (child) {
	                    child.material = material;
	
	                    // push Triggers to triggerObjects array;
	                    if (child.name !== null && child.name.indexOf("Trigger") === 0) {
	                        var trigger = {
	                            name: child.name,
	                            pos: {
	                                x: Math.round(child.position.x / 100),
	                                y: Math.round(child.position.y / 100),
	                                z: Math.round(child.position.z / 100)
	                            }
	                        };
	                        triggerObjects.push(new TriggerObject(trigger));
	                        child.visible = false;
	                    }
	
	                    // push NavPaths to NavPaths array;
	                    if (child.name !== null && child.name.indexOf("NavPath") === 0) {
	                        var path = {
	                            name: child.name,
	                            pos: {
	                                x: Math.round(child.position.x / 100),
	                                y: Math.round(child.position.y / 100),
	                                z: Math.round(child.position.z / 100)
	                            },
	                            points: [{
	                                x: Math.round(child.geometry.attributes.position.array[0] / 100),
	                                y: Math.round(child.geometry.attributes.position.array[1] / 100),
	                                z: Math.round(child.geometry.attributes.position.array[2] / 100)
	                            }, {
	                                x: Math.round(child.geometry.attributes.position.array[3] / 100),
	                                y: Math.round(child.geometry.attributes.position.array[4] / 100),
	                                z: Math.round(child.geometry.attributes.position.array[5] / 100)
	                            }]
	                        };
	                        navPaths.push(new NavPath(path));
	                        child.visible = false;
	                    }
	                });
	
	                navPaths.forEach(function (navPath) {
	                    navPath.nodes.forEach(function (node) {
	                        navNodesObject.add(node);
	                    });
	                });
	
	                worldObject.add(navNodesObject);
	                worldObject.add(dae);
	
	                _this2.updateNodes();
	            });
	
	            return {
	                obj: worldObject,
	                triggers: triggerObjects,
	                navPaths: navPaths,
	                navNodes: navNodesObject
	            };
	        }
	    }, {
	        key: 'busy',
	        get: function get() {
	            return this.isBusy();
	        }
	    }, {
	        key: 'position',
	        get: function get() {
	            return this.worldObject.obj.position;
	        }
	    }]);
	
	    return InnerWorld;
	}();
	
	exports.default = InnerWorld;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var NavPath = function () {
	    function NavPath(pars) {
	        _classCallCheck(this, NavPath);
	
	        this.name = pars.name;
	        this.position = new THREE.Vector3(pars.pos.x, pars.pos.y, pars.pos.z);
	        this.nodes = this.initNodes(pars.points);
	    }
	
	    _createClass(NavPath, [{
	        key: "initNodes",
	        value: function initNodes(points) {
	            var _this = this;
	
	            var geometry = new THREE.BoxGeometry(1, 1, 1);
	            var material = new THREE.MeshBasicMaterial({
	                map: new THREE.ImageUtils.loadTexture("/assets/textures/crosshair.png"),
	                transparent: true
	            });
	
	            return points.map(function (point, i) {
	                var cube = new THREE.Mesh(geometry, material);
	                cube.position.x = point.x;
	                cube.position.y = point.y;
	                cube.position.z = point.z;
	                cube.name = _this.name + "_" + i;
	                cube.visible = false;
	                return cube;
	            });
	        }
	    }, {
	        key: "setVisible",
	        value: function setVisible(position) {
	            var found = -1;
	
	            this.nodes.forEach(function (node, i) {
	                node.visible = false;
	                if (node.position.x === -position.x && node.position.y === -position.y && node.position.z === -position.z) {
	                    found = i;
	                }
	            });
	
	            if (found > -1) {
	                this.nodes.forEach(function (node, j) {
	                    if (j !== found) node.visible = true;
	                });
	            }
	        }
	    }]);
	
	    return NavPath;
	}();
	
	exports.default = NavPath;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var TriggerObject = function () {
	  function TriggerObject(pars) {
	    _classCallCheck(this, TriggerObject);
	
	    this.name = pars.name;
	    this.position = new THREE.Vector3(pars.pos.x, pars.pos.y, pars.pos.z);
	  }
	
	  _createClass(TriggerObject, [{
	    key: "checkHit",
	    value: function checkHit(position, callBack) {
	      if (this.position.x === -position.x && this.position.y === -position.y && this.position.z === -position.z) {
	        callback(this.name);
	      }
	    }
	  }]);
	
	  return TriggerObject;
	}();
	
	exports.default = TriggerObject;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var InnerView = function () {
	  function InnerView() {
	    var _this = this;
	
	    _classCallCheck(this, InnerView);
	
	    this.camera = this.getCamera();
	    this.renderer = this.getRenderer();
	    this.effect = this.getEffect();
	    this.controls = this.getControls();
	    this.clock = new THREE.Clock();
	
	    window.addEventListener('resize', function (e) {
	      _this.resizeHandler(e.target.innerWidth, e.target.innerHeight);
	    });
	  }
	
	  /*
	   * 'Public' methods
	   */
	
	  _createClass(InnerView, [{
	    key: 'render',
	    value: function render(scene) {
	      this.renderer.render(scene, this.camera.obj);
	      this.effect.render(scene, this.camera.obj);
	
	      if (this.controls) this.controls.update(this.clock.getDelta());
	    }
	  }, {
	    key: 'destroy',
	    value: function destroy() {
	      document.body.removeChild(this.renderer.domElement);
	    }
	  }, {
	    key: 'rotate',
	    value: function rotate(rot) {
	      if (!this.controls) // only used for desktop, no mobile orientation controls
	        return;
	
	      var cam = this.camera;
	
	      cam.lon += rot.x;
	      cam.lat = Math.max(-85, Math.min(85, cam.lat - rot.y));
	
	      var phi = (90 - cam.lat) * Math.PI / 180;
	      var theta = cam.lon * Math.PI / 180;
	      cam.target.x = cam.obj.position.x + Math.sin(phi) * Math.cos(theta);
	      cam.target.y = cam.obj.position.y + Math.cos(phi);
	      cam.target.z = cam.obj.position.z + Math.sin(phi) * Math.sin(theta);
	
	      cam.obj.lookAt(cam.target);
	    }
	  }, {
	    key: 'resizeHandler',
	
	
	    /*
	     *  'Private' methods
	     */
	
	    value: function resizeHandler(w, h) {
	      this.camera.obj.aspect = w / h;
	      this.camera.obj.updateProjectionMatrix();
	      this.camera.obj.useQuaternions = true;
	
	      this.renderer.setSize(w, h);
	      this.effect.setSize(w, h);
	    }
	
	    /*
	     *  Init methods
	     */
	
	  }, {
	    key: 'getCamera',
	    value: function getCamera() {
	      return {
	        obj: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
	        target: new THREE.Vector3(),
	        lat: 0,
	        lon: 0,
	        phi: 0,
	        theta: 0
	      };
	    }
	  }, {
	    key: 'getRenderer',
	    value: function getRenderer() {
	      var r = new THREE.WebGLRenderer();
	      r.setClearColor(0x000000, 1);
	      r.setSize(window.innerWidth, window.innerHeight);
	      r.shadowMapEnabled = true;
	      document.body.appendChild(r.domElement);
	      return r;
	    }
	  }, {
	    key: 'getEffect',
	    value: function getEffect() {
	      var e = new THREE.StereoEffect(this.renderer);
	      e.setSize(window.innerWidth, window.innerHeight);
	      return e;
	    }
	  }, {
	    key: 'getControls',
	    value: function getControls() {
	      if (!window.DeviceOrientationEvent) return false;
	
	      var c = new THREE.DeviceOrientationControls(this.camera.obj);
	      c.connect();
	      c.update();
	      return c;
	    }
	  }, {
	    key: 'rotation',
	    get: function get() {
	      return this.camera.obj.rotation;
	    }
	  }]);
	
	  return InnerView;
	}();
	
	exports.default = InnerView;

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var InnerGaze = function () {
	    function InnerGaze() {
	        _classCallCheck(this, InnerGaze);
	
	        this.rayCaster = new THREE.Raycaster();
	        this.rayVector = new THREE.Vector3();
	
	        this.lookingAt = { id: 0, timer: 0, delay: 1000, cooldown: 0 };
	    }
	
	    _createClass(InnerGaze, [{
	        key: "getGaze",
	        value: function getGaze(camera, navNodes, position) {
	            if (Date.now() - this.lookingAt.cooldown < this.lookingAt.delay) return;
	
	            navNodes.forEach(function (n) {
	                n.material.color.set(0xffffff);
	            });
	
	            this.rayCaster.setFromCamera(this.rayVector, camera.obj);
	
	            var intersects = this.rayCaster.intersectObjects(navNodes, true).filter(function (int) {
	                return int.object.visible;
	            });
	
	            if (intersects.length > 0 && intersects[0].object.name.indexOf("NavPath") === 0) {
	
	                if (this.lookingAt.id === intersects[0].object.id) {
	
	                    var realPosition = new THREE.Vector3().setFromMatrixPosition(intersects[0].object.matrixWorld);
	
	                    if (Math.abs(realPosition.y) > 2) {
	
	                        intersects[0].object.material.color.set(0xff0000);
	                    } else {
	
	                        intersects[0].object.material.color.set(0x00ff00);
	
	                        if (Date.now() - this.lookingAt.timer > this.lookingAt.delay) {
	
	                            this.lookingAt.cooldown = Date.now();
	
	                            return new THREE.Vector3(position.x + intersects[0].object.position.x, position.y + intersects[0].object.position.y, position.z + intersects[0].object.position.z);
	                        }
	                    }
	                } else {
	                    this.lookingAt.id = intersects[0].object.id;
	                    this.lookingAt.timer = Date.now();
	                }
	            } else {
	                this.lookingAt.id = 0;
	            }
	        }
	    }]);
	
	    return InnerGaze;
	}();
	
	exports.default = InnerGaze;

/***/ }
/******/ ]);
//# sourceMappingURL=inner.bundle.js.map