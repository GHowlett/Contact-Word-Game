var path = require("path"),
    express = require("express"),
    socketIO = require("socket.io"),
    http = require("http"),
    server = express();

server.use(express.static(__dirname + '/public'))
      .use(express.static(__dirname + '/bower_components'));

var ioServer = http.createServer(server);
var io = socketIO.listen(server);

io.sockets.on("connection", function(client) {
    client.on("named", function(name) {
        client.broadcast.emit('joined', name);
    });
});

var port = process.env.PORT || 3000;
ioServer.listen(port);
console.log("Started server on port " + port);