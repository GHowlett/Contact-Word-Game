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
var contactCount = 0;

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
    contactCount = 0;

    io.sockets.emit('newGame', masterName);
}

// TODO: maybe don't give words or guesses to the client
//       since it could result in cheating
function onMasterWordChosen(word) {
    masterWord = word;
    this.broadcast.emit('masterWordChosen', word);
}

function onClue(player) {
    this.broadcast.emit('clue', player);
    _.extend(playerDB[this.id], player);
}

function onGuess(guess) {
    this.broadcast.emit('guess', guess);

    var player = _.findWhere(playerDB, {name:guess.to});

    // TODO: accomplish this with bitwise ops & switching 
    if (guess.word === player.word) {
        if (guess.from !== masterName) {
            player.guesses.push(_.pick(guess, 'guess','from'));
            if (player.guesses.length >= _.size(playerDB) /2) 
                startChallenge(player.name);
        }
        else endContact(player.name, false);
    } else if (guess.from !== masterName) 
        endContact(player.name, false);    
}

function startChallenge(name) {
    io.sockets.emit('challenge', name);
    // TODO: start countdown
}

function endContact(name, success) {
    io.sockets.emit('contact', {name:name, success:success});
    if (success && masterWord.length <= ++contactCount) 
        setTimeout(endGame, 5000);
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
