"use strict";

class GameEngine {
  constructor( socket ) {
    this.state = {};
    this.reset();

    this.socket = socket;
    this.bindSocketEvents();
  }

  bindSocketEvents() {

    this.socket.on('connection', client => {

        console.log('connected!');

        // client.on('player-choice',        () => { this.handlePlayerChoice( client ) });
        // client.on('player-chosen-state',  () => { this.handlePlayerChosenState( client ) });
        //
        // client.on('player-coordinates',   () => { this.handlePlayerCoordinates( client ) });
        // client.on('pivot',                () => { this.handlePivot( client ) });
        // client.on('world-position',       () => { this.handleWorldPosition( client ) });
        //
        // client.on('rotate-u', () => { this.handleRotation()) });
        // client.on('rotate-h', () => { this.handleRotation()) });
        // client.on('rotate-j', () => { this.handleRotation()) });
        // client.on('rotate-k', () => { this.handleRotation()) });

        // client.on('intro-finished', this.handleIntroFinished.bind( this, client ) );
        // client.on('outro-finished', this.handleOutroFinished.bind( this, client ) );
        // client.on('reset', this.handleReset.bind( this ) );
        // client.on('won', this.handleWon.bind( this ) );
        // client.on('lost', this.handleLost.bind( this ) );

    });
  }

  reset() {
        this.state.lost = false;
        this.state.won = false;
        this.state.introFinished = false;
        this.state.outroFinished = false;
        this.state.innerViewChosen = false;
        this.state.outerViewChosen = false;
  }
}

module.exports = GameEngine;
