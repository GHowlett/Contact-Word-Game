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
var masterName = "";
var giverName = "";
var minPlayers = 3;
var hasStarted = false;
var masterWord = null;

function onJoined(player) {
    this.broadcast.emit('joined', player);
    playerDB[this.id] = player;

    playerCount += 1;
    if (playerCount == minPlayers) {
        this.broadcast.emit('resume');
        if (!hasStarted) startNewGame(); }
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

function startNewGame() {
    var filteredPlayers = _.reject(playerDB, function(player){
        return player.name === masterName; });

    masterName = _.sample(playerDB, 1)[0].name;
    hasStarted = true;

    io.sockets.emit('newGame', masterName);
}

// TODO: maybe don't give words or guesses to the client
//       since it could result in cheating
function onMasterWordChosen(word) {
    var filteredPlayers = _.reject(playerDB, function(player){
        return player.name === masterName || 
               player.name === giverName; });

    giverName = _.sample(filteredPlayers, 1)[0].name;
    masterWord = word;

    this.broadcast.emit('masterWordChosen', word);
    this.broadcast.emit('newRound', giverName);
}

function onGiverWordChosen(word) {
    giverWord = word;
    this.broadcast.emit('giverWordChosen', word);
}

function onClue(clue) {
    // TODO: refactor gamelogic so the giver doesn't 
    //       have any special rendering logic, and instead
    //       listens to its own events like everyone else
    this.broadcast.emit('clue', clue);
}

function onGuess(guess) {
    playerDB[this.id].guess = guess;
    this.broadcast.emit('guess', playerDB[this.id]);
}

io.sockets.on("connection", function(client) {
    for (player in playerDB)
        client.emit('joined', playerDB[player]);

    client.on("joined", onJoined);
    client.on("disconnect", onDisconnect);
    client.on("masterWordChosen", onMasterWordChosen);
    client.on("giverWordChosen", onGiverWordChosen);
    client.on("clue", onClue);
    client.on("guess", onGuess);
});

var port = process.env.PORT || 3000;
ioServer.listen(port);
console.log("Started server on port " + port);