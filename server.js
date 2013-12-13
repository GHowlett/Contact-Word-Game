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
var playerCount = 0;
var isPlaying = false;

function startNewRound() {
    var pair = _.sample(playerDB, 2);
    pair = {
        master: pair[0].name,
        giver: pair[1].name }
    io.sockets.emit('newRound', pair);
    isPlaying = true;
}

io.sockets.on("connection", function(client) {
    console.log(client.id);

    for (player in playerDB)
        client.emit('joined', playerDB[player]);

    client.on("named", function(player) {
        client.broadcast.emit('joined', player);
        playerDB[client.id] = player;
        if ((++playerCount >2) && (!isPlaying)) 
            startNewRound();
    });

    client.on("disconnect", function() {
        // you can only leave if you've joined / have a name
        if (!playerDB[client.id]) return;
        client.broadcast.emit('left', playerDB[client.id].name);
        delete playerDB[client.id];
        playerCount -= 1;
        // TODO: handle too many users disconnecting during a game
        //       by setting isPlaying to false and sending a msg
    });
});

var port = process.env.PORT || 3000;
ioServer.listen(port);
console.log("Started server on port " + port);