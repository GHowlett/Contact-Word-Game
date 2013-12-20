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
var masterName = "";
var masterWord = null;
var minPlayers = 3;
var hasStarted = false;
var wonRounds = 0;

function getFilteredPlayers() {
    return _.reject(playerDB, function(player){
        return player.name === masterName;
    });
}

// TODO: store player data with this.set() instead of playerDB
function onJoined(player) {
    this.broadcast.emit('joined', player);
    playerDB[this.id] = player;

    if (_.size(playerDB) === minPlayers) {
        this.broadcast.emit('resume');
        if (!hasStarted) startNewGame(); }
    if (_.size(playerDB) < minPlayers)
        this.emit('pause', 'Waiting for Players');
}

function onDisconnect() {
    // you can only leave if you've joined / have a name
    if (!playerDB[this.id]) return;

    this.broadcast.emit('left', playerDB[this.id].name);
    if (_.size(playerDB) === minPlayers)
        this.broadcast.emit('pause', 'Waiting for Players');

    delete playerDB[this.id];
}

function startNewGame() {
    var filteredPlayers = getFilteredPlayers();

    masterName = _.sample(filteredPlayers, 1)[0].name;
    hasStarted = true;
    wonRounds = 0;

    io.sockets.emit('newGame', masterName);
}

// TODO: maybe don't give words or guesses to the client
//       since it could result in cheating
function onMasterWordChosen(word) {
    masterWord = word;
    this.broadcast.emit('masterWordChosen', word);
    startNewRound();
}

// TODO: change this to challengeOver
function startNewRound() {
    io.sockets.emit('newRound');
}

function onClue(player) {
    this.broadcast.emit('clue', player);
    _.extend(playerDB[this.id], player);
}

function onGuess(guess) {
    var player = playerDB[this.id];
    player.guess = guess;
    this.broadcast.emit('guess', player);

    // round over if master guesses right
    if (player.name === masterName)
        endRound(false);

    // round over if all players have guessed
    var guesses = _.unique(_.pluck(getFilteredPlayers(),'guess'));
    if (_.all(guesses, _.identity)) {
        if (guesses.length === 1)
             endRound(true);
        else endRound(false);
    }
}

function endRound(success) {
    io.sockets.emit('roundOver', success);
    if (success) wonRounds++;
    if (wonRounds >= masterWord.length) setTimeout(endGame, 15000);
    else setTimeout(startNewRound, 15000);
}

function endGame() {
    io.sockets.emit('gameOver');
    setTimeout(startNewGame, 5000);
}

io.sockets.on("connection", function(client) {
    for (player in playerDB)
        client.emit('joined', playerDB[player]);

    client.on("joined", onJoined);
    client.on("disconnect", onDisconnect);
    client.on("masterWordChosen", onMasterWordChosen);
    client.on("clue", onClue);
    client.on("guess", onGuess);
});

var port = process.env.PORT || 3000;
ioServer.listen(port);
console.log("Started server on port " + port);
