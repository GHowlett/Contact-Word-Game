var path = require("path"),
    express = require("express"),
    socketIO = require("socket.io"),
    http = require("http"),
    server = express();

server.use(express.static(__dirname + '/public'))
      .use(express.static(__dirname + '/bower_components'));

var ioServer = http.createServer(server);
var io = socketIO.listen(ioServer);

var playerDB = {}; // connected players

io.sockets.on("connection", function(client) {
    console.log(client.id);

    for (player in playerDB)
        client.emit('joined', playerDB[player]);

    client.on("named", function(player) {
        client.broadcast.emit('joined', player);
        playerDB[client.id] = player;
    });

    client.on("disconnect", function() {
        // you can only leave if you've joined / have a name
        if (!playerDB[client.id]) return;
        client.broadcast.emit('left', playerDB[client.id].name);
    })
});

var port = process.env.PORT || 3000;
ioServer.listen(port);
console.log("Started server on port " + port);