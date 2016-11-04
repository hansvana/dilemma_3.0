export default class TriggerObject {
  constructor(pars) {
    this.name = pars.name;
    this.position = new THREE.Vector3(pars.pos.x, pars.pos.y, pars.pos.z);
  }

  checkHit(position, callBack) {
    if (this.position.x === -(position.x) &&
        this.position.y === -(position.y) &&
        this.position.z === -(position.z)) {
        callback(this.name);
    }
  }
}
