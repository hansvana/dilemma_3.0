export default class OuterWorld {
  constructor() {
    this.worldObject = this.getWorldObject();
  }

  /*
   *  Init methods
   */

  getPlayerIndicator() {
    return new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 2.2, 2.2),
      new THREE.MeshBasicMaterial( {color: 0x00ff00} )
    );
  }

  getWorldObject() {
    const loader = new THREE.ColladaLoader();

    const worldObject = new THREE.Object3D();
    const material = new THREE.MeshPhongMaterial({color: 0x333333});
    const finishMaterial = new THREE.MeshPhongMaterial({color: 0x000FFF});

    loader.load('/assets/models/prototypeMazeV4.dae', collada => {
        const dae = collada.scene;

        dae.scale.x = dae.scale.y = dae.scale.z = 0.01;

        dae.traverse(child => {
            child.material = material;

            if (child.name !== null && child.name.indexOf("Trigger") === 0) {
                child.scale.x = child.scale.y = child.scale.z = 1.1;
                child.material = finishMaterial;
            }

            if (child.name !== null && child.name.indexOf("NavPath") === 0) {
                child.visible = false;
            }
        }

        worldObject.add(dae);
    });

    return worldObject;

  }
}
