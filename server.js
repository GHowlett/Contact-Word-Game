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
var hasStarted = false;

function startNewRound() {
    hasStarted = true;
    var sample = _.sample(playerDB, 2);
    var pair = {
        master: sample[0].name,
        giver: sample[1].name }
    io.sockets.emit('newRound', pair);
}

io.sockets.on("connection", function(client) {
    console.log(client.id);

    for (player in playerDB)
        client.emit('joined', playerDB[player]);

    client.on("named", function(player) {
        client.broadcast.emit('joined', player);
        playerDB[client.id] = player;

        playerCount += 1;
        if (playerCount == 3) {
            client.broadcast.emit('resume');
            if (!hasStarted) startNewRound(); }
        if (playerCount < 3)
            client.emit('pause', 'Waiting for Players');
    });

    client.on("disconnect", function() {
        // you can only leave if you've joined / have a name
        if (!playerDB[client.id]) return;
        client.broadcast.emit('left', playerDB[client.id].name);
        delete playerDB[client.id];

        if (--playerCount < 3) 
            client.broadcast.emit('pause', 'Waiting for Players');
    });
});

var port = process.env.PORT || 3000;
ioServer.listen(port);
console.log("Started server on port " + port);