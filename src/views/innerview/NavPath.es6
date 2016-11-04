export default class NavPath {
  constructor(pars) {
    this.name = pars.name;
    this.position = new THREE.Vector3(pars.pos.x, pars.pos.y, pars.pos.z);
    this.nodes = this.initNodes(pars.points);
  }

  initNodes(points) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
        map: new THREE.ImageUtils.loadTexture("/assets/textures/crosshair.png"),
        transparent: true
    });

    return points.map( (point, i) => {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = point.x;
      cube.position.y = point.y;
      cube.position.z = point.z;
      cube.name = this.name + "_" + i;
      cube.visible = false;
      return cube;
    });
  }

  setVisible(position) {
    let found = -1;

    this.nodes.forEach((node, i) => {
        node.visible = false;
        if (node.position.x === -(position.x) &&
            node.position.y === -(position.y) &&
            node.position.z === -(position.z)) {
            found = i;
        }
    });

    if (found > -1) {
        this.nodes.forEach((node, j) => {
            if (j !== found)
                node.visible = true;
        });
    }
  }
}
