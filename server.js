var path = require("path"),
    express = require("express"),
    socketIO = require("socket.io"),
    http = require("http"),
    _ = require("underscore"),
    server = express();

server.use(express.static(__dirname + '/public'))
      .use(express.static(__dirname + '/bower_components'));

var ioServer = http.createServer(server);
var io = socketIO.listen(ioServer);

var playerDB = {};
var playerCount = 0; // TODO: get rid of this
var minPlayers = 3;
var hasStarted = false;

function startNewRound() {
    hasStarted = true;
    var sample = _.sample(playerDB, 2);
    var pair = {
        master: sample[0].name,
        giver: sample[1].name }
    io.sockets.emit('newRound', pair);
}

function onJoined(player) {
    this.broadcast.emit('joined', player);
    playerDB[this.id] = player;

    playerCount += 1;
    if (playerCount == minPlayers) {
        this.broadcast.emit('resume');
        if (!hasStarted) startNewRound(); }
    if (playerCount < minPlayers)
        this.emit('pause', 'Waiting for Players');
}

function onDisconnect() {
    // you can only leave if you've joined / have a name
    if (!playerDB[this.id]) return;
    this.broadcast.emit('left', playerDB[this.id].name);
    delete playerDB[this.id];

    if (--playerCount +1 == minPlayers) 
        this.broadcast.emit('pause', 'Waiting for Players');
}

io.sockets.on("connection", function(client) {
    for (player in playerDB)
        client.emit('joined', playerDB[player]);

    client.on("joined", onJoined);
    client.on("disconnect", onDisconnect);
});

var port = process.env.PORT || 3000;
ioServer.listen(port);
console.log("Started server on port " + port);