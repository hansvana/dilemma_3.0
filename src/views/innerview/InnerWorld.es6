const NavPath = require('./NavPath.es6').default;
const TriggerObject = require('./TriggerObject.es6').default;

export default class InnerWorld {
    constructor() {
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

    setRotateTo(which) {
        if (this.isBusy())
            return;

        this.props.vectorRotationTarget = new THREE.Vector3(this.props.vectorRotationCurrent.x,
            this.props.vectorRotationCurrent.y,
            this.props.vectorRotationCurrent.z);

        switch (which) {
            case 72: //H
                this.props.vectorRotationTarget.z = this.props.vectorRotationTarget.z + (Math.PI * .5);
                break;
            case 75: //K
                this.props.vectorRotationTarget.z = this.props.vectorRotationTarget.z - (Math.PI * .5);
                break;
            case 85: //U
                this.props.vectorRotationTarget.x = this.props.vectorRotationTarget.x - (Math.PI * .5);
                break;
            case 74: //J
                this.props.vectorRotationTarget.x = this.props.vectorRotationTarget.x + (Math.PI * .5);
                break;
        }

        this.props.isRotating = true;
    }

    setMoveTo(target) {
        const offset = new THREE.Vector3(target.x, target.y, target.z);
        this.props.vectorMoveTarget = new THREE.Vector3().subVectors(this.worldObject.obj.position, offset);
        this.props.isMoving = true;
    }

    rotate() {
        if (!this.props.isRotating)
            return;

        var delta = new THREE.Vector3();
        delta.subVectors(this.props.vectorRotationTarget, this.props.vectorRotationCurrent);

        if (delta.length() < this.props.rotationSpeed) {
            // rotation is very close to target
            // so set rotation to target and stop rotating
            this.props.vectorRotationCurrent = this.props.vectorRotationTarget;
            this.rotateOneTick();
            this.props.isRotating = false;
            this.props.rotationAsDegrees = this.fixDegrees([
                this.worldObject.obj.getWorldRotation().x,
                this.worldObject.obj.getWorldRotation().y,
                this.worldObject.obj.getWorldRotation().z
            ]);

            return true;

        } else {
            // rotation by rotationSpeed
            delta.setLength(this.props.rotationSpeed);
            this.props.vectorRotationCurrent.add(delta);
            this.rotateOneTick();
        }

        return false;
    }

    move() {
        if (!this.props.isMoving)
            return;

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

    update() {
        if (this.rotate() || this.move()) return true;
    }

    updateNodes() {
        this.worldObject.navPaths.forEach(function (navPath) {
            navPath.setVisible(this.worldObject.obj.position);
        }, this);
    };

    checkTriggers() {
        this.worldObject.triggers.forEach(trigger => {
            trigger.checkHit(this.position, name => {
                return name;
            })
        });

        return '';
    }

    get busy() {
        return this.isBusy();
    }

    get position() {
        return this.worldObject.obj.position;
    }

    /*
     *  'Private' methods
     */

    rotateOneTick() {
        this.pivotObject.rotation.x = this.props.vectorRotationCurrent.x;
        this.pivotObject.rotation.y = this.props.vectorRotationCurrent.y;
        this.pivotObject.rotation.z = this.props.vectorRotationCurrent.z;
        this.pivotObject.updateMatrixWorld();
    }

    isBusy() {
        return (this.props.isMoving || this.props.isRotating);
    }

    //turn radians into degrees, rounded to 0, 90, 180 or 270
    fixDegrees(radArray) {
        let r = [], d;
        for (let i = 0; i < radArray.length; i++) {
            d = (Math.round((radArray[i] * 180 / Math.PI) / 10) * 10);
            d = d === -90 ? 270 : d;
            r.push(Math.abs(d));
        }
        return r;
    }

    /*
     *  Init methods
     */

    getScene() {
        const scene = new THREE.Scene();
        scene.add(this.lights.playerLight);
        scene.add(this.lights.globalLight);
        scene.add(this.skybox);

        this.pivotObject.add(this.worldObject.obj);
        scene.add(this.pivotObject);

        return scene;
    }

    getLights() {
        const playerLight = new THREE.PointLight(0xffffff, 1, 20);
        const globalLight = new THREE.HemisphereLight(0xff0000, 0x89584B, 0.3);

        playerLight.position.set(0, 0, 0);

        return {
            playerLight,
            globalLight
        }
    }

    getSkybox() {
        const imagePrefix = "/assets/textures/images/skybox-innerView-";
        const directions = ["west", "east", "up", "down", "north", "south"];
        const imageSuffix = ".jpg";
        const skyGeometry = new THREE.BoxGeometry(100, 100, 100);

        const skyMaterialArray = [];
        for (var i = 0; i < 6; i++) {
            skyMaterialArray.push(new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
                side: THREE.BackSide,
            }));
        }
        const skyMaterial = new THREE.MeshFaceMaterial(skyMaterialArray);

        return new THREE.Mesh(skyGeometry, skyMaterial);
    }

    getWorldObject() {
        const loader = new THREE.ColladaLoader();

        const worldObject = new THREE.Object3D();
        const triggerObjects = [];
        const navPaths = [];
        const navNodesObject = new THREE.Object3D();

        const material = new THREE.MeshPhongMaterial({color: 0x333333});

        loader.load('/assets/models/prototypeMazeV4.dae', collada => {
            const dae = collada.scene;

            dae.scale.x = dae.scale.y = dae.scale.z = 0.01;

            dae.traverse(child => {
                child.material = material;

                // push Triggers to triggerObjects array;
                if (child.name !== null && child.name.indexOf("Trigger") === 0) {
                    const trigger = {
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
                    const path = {
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
                        },
                            {
                                x: Math.round(child.geometry.attributes.position.array[3] / 100),
                                y: Math.round(child.geometry.attributes.position.array[4] / 100),
                                z: Math.round(child.geometry.attributes.position.array[5] / 100)
                            }]
                    };
                    navPaths.push(new NavPath(path));
                    child.visible = false;
                }
            });

            navPaths.forEach(navPath => {
                navPath.nodes.forEach(node => {
                    navNodesObject.add(node);
                });
            });


            worldObject.add(navNodesObject);
            worldObject.add(dae);

            this.updateNodes();
        });

        return {
            obj: worldObject,
            triggers: triggerObjects,
            navPaths: navPaths,
            navNodes: navNodesObject
        }
    }
}
