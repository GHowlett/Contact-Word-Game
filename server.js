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
var isPaused = false;

function startNewRound() {
    if (isPaused) resume();
    var sample = _.sample(playerDB, 2);
    var pair = {
        master: sample[0].name,
        giver: sample[1].name }
    io.sockets.emit('newRound', pair);
}

function resume() {
    io.sockets.emit('resume');
    isPaused = false;
}

function pause(msg) {
    io.sockets.emit('pause', msg);
    isPaused = true;
}

io.sockets.on("connection", function(client) {
    console.log(client.id);

    for (player in playerDB)
        client.emit('joined', playerDB[player]);

    client.on("named", function(player) {
        client.broadcast.emit('joined', player);
        playerDB[client.id] = player;

        if (++playerCount == 3) 
            isPaused? resume() : startNewRound();
        if (playerCount < 3) 
            client.emit('pause', 'Waiting for Players');
    });

    client.on("disconnect", function() {
        // you can only leave if you've joined / have a name
        if (!playerDB[client.id]) return;
        client.broadcast.emit('left', playerDB[client.id].name);
        delete playerDB[client.id];

        if (--playerCount < 3) pause('Waiting for Players');
    });
});

var port = process.env.PORT || 3000;
ioServer.listen(port);
console.log("Started server on port " + port);