var path = require("path"),
    express = require("express"),
    socketIO = require("socket.io"),
    http = require("http"),
    server = express();

server.use(express.static(__dirname + '/public'))
      .use(express.static(__dirname + '/bower_components'));

var ioServer = http.createServer(server);
var io = socketIO.listen(ioServer);

var playerDB = []; // connected players

io.sockets.on("connection", function(client) {
    playerDB.forEach(function(name) {
        client.emit('joined', name);
    });

    client.on("named", function(name) {
        client.broadcast.emit('joined', name);
        playerDB.push(name);
    });
});

var port = process.env.PORT || 3000;
ioServer.listen(port);
console.log("Started server on port " + port);