const express = require('express'); // Docs http://expressjs.com/
const socketIo = require('socket.io'); // Docs http://socket.io/

const GameEngine = require('./GameEngine.js');

const app = express();
const server = require('http').Server( app );
const io = socketIo( server );

// binding to 0.0.0.0 allows connections from any other computer in the network
// to your ip address
const ipAddress = process.env.IP || '0.0.0.0';
const port = process.env.PORT || 8000;

app.use( express.static( __dirname +'/../../' ) );
app.use( '/global', express.static( __dirname +'/../../global' ) );
app.use( '/admin', express.static( __dirname +'/admin' ) );

server.listen( port, ipAddress, function () {
    console.log('game server started on localhost:'+ port );

    const g = new GameEngine( io );
} );
