export default class InnerView {
  constructor() {
    this.camera   = this.getCamera();
    this.renderer = this.getRenderer();
    this.effect   = this.getEffect();
    this.controls = this.getControls();
    this.clock    = new THREE.Clock();

    window.addEventListener('resize', e => {
      this.resizeHandler(e.target.innerWidth, e.target.innerHeight);
    });
  }

  /*
   * 'Public' methods
   */

  render(scene) {
    this.renderer.render(scene, this.camera.obj);
    this.effect.render(scene,this.camera.obj);

    if (this.controls)
        this.controls.update( this.clock.getDelta() );
  }

  destroy() {
    document.body.removeChild( this.renderer.domElement );
  }

  rotate(rot) {
    if (!this.controls) // only used for desktop, no mobile orientation controls
      return;

    const cam = this.camera;

    cam.lon += rot.x;
    cam.lat = Math.max( - 85, Math.min( 85, cam.lat - rot.y) );

    var phi = ( 90 - cam.lat ) * Math.PI / 180;
    var theta = cam.lon * Math.PI / 180;
    cam.target.x = cam.obj.position.x + Math.sin( phi ) * Math.cos( theta );
    cam.target.y = cam.obj.position.y + Math.cos( phi );
    cam.target.z = cam.obj.position.z + Math.sin( phi ) * Math.sin( theta );

    cam.obj.lookAt(cam.target);
  }

  get rotation() {
    return this.camera.obj.rotation;
  }

  /*
   *  'Private' methods
   */

  resizeHandler(w,h) {
     this.camera.obj.aspect = w / h;
     this.camera.obj.updateProjectionMatrix();
     this.camera.obj.useQuaternions = true;

     this.renderer.setSize( w, h );
     this.effect.setSize( w, h );
   }

  /*
   *  Init methods
   */

  getCamera() {
    return {
      obj: new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 ),
      target: new THREE.Vector3(),
      lat: 0,
      lon: 0,
      phi: 0,
      theta: 0
    }
  }

  getRenderer() {
    const r = new THREE.WebGLRenderer();
    r.setClearColor(0x000000, 1);
    r.setSize( window.innerWidth, window.innerHeight );
    r.shadowMapEnabled = true;
    document.body.appendChild(r.domElement);
    return r;
  }

  getEffect() {
    const e = new THREE.StereoEffect(this.renderer);
    e.setSize( window.innerWidth, window.innerHeight );
    return e;
  }

  getControls() {
    if (!window.DeviceOrientationEvent)
      return false;

    const c = new THREE.DeviceOrientationControls(this.camera.obj);
    c.connect();
    c.update();
    return c;
  }
}
