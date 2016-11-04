const InnerWorld = require('./InnerWorld.es6').default;
const InnerView = require('./InnerView.es6').default;
const InnerGaze = require('./InnerGaze.es6').default;

document.addEventListener("DOMContentLoaded", () => {
    const inner = new InnerController();
});

class InnerController {

  constructor() {
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

   mainLoop() {

     if (!this.active)
         return;

     window.requestAnimationFrame(() => {
       this.mainLoop();
     });

     if (!this.world.busy) {
        const target = this.gaze.getGaze(this.view.camera, this.world.worldObject.navNodes.children, this.world.position);
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

   checkTriggers() {
      switch (this.world.checkTriggers()) {
          case 'Trigger_Finish' :
              console.log('mainGame -> won');
              this.stopSoundTrack();

              this.socket.emit('won', true);
              break;
      }
   }

   socketUpdate() {
      const newWorldPos = JSON.stringify({
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

   bindSocketEvents() {
     this.socket.on('rotate-h', () => { this.world.setRotateTo(this.world, 72); });
     this.socket.on('rotate-k', () => { this.world.setRotateTo(this.world, 75); });
     this.socket.on('rotate-u', () => { this.world.setRotateTo(this.world, 85); });
     this.socket.on('rotate-j', () => { this.world.setRotateTo(this.world, 74); });
   }
}
