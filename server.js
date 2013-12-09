var path = require("path"),
    express = require("express"),
    socketIO = require("socket.io"),
    http = require("http"),
    server = express();

server.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 3000;
server.listen(port);
console.log("Started server on port " + port);