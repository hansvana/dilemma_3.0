class InnerGaze {
  constructor() {
    this.rayCaster = new THREE.Raycaster();
    this.rayVector = new THREE.Vector3();

    this.lookingAt = {id: 0, timer: 0, delay: 1000, cooldown: 0};
  }

  getGaze(camera, navNodes, position) {
    if (Date.now() - this.lookingAt.cooldown < this.lookingAt.delay)
        return;

    navNodes.forEach( n => {
        n.material.color.set(0xffffff);
    });

    this.rayCaster.setFromCamera( this.rayVector, camera.obj );

    let intersects = this.rayCaster.intersectObjects(navNodes, true)
      .filter( int => {
        return int.object.visible;
      });

    if (intersects.length > 0 && intersects[0].object.name.indexOf("NavPath") === 0) {

        if (this.lookingAt.id === intersects[0].object.id) {

            const realPosition = new THREE.Vector3().setFromMatrixPosition(intersects[0].object.matrixWorld);

            if (Math.abs(realPosition.y) > 2) {

                intersects[0].object.material.color.set(0xff0000);

            } else {

                intersects[0].object.material.color.set(0x00ff00);

                if (Date.now() - this.lookingAt.timer > this.lookingAt.delay) {

                    this.lookingAt.cooldown = Date.now();

                    return new THREE.Vector3(
                        (position.x) + intersects[0].object.position.x,
                        (position.y) + intersects[0].object.position.y,
                        (position.z) + intersects[0].object.position.z
                    );
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
}

export default InnerGaze;
