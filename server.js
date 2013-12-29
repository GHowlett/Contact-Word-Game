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
var masterWord = "";
var minPlayers = 3;
var hasStarted = false;
var contactCount = 0;
var history = [];
var isChallenge = false;

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

    // TODO: start new game if master leaves

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
    masterWord = "";
    history = [];

    io.sockets.emit('newGame', masterName);
    history.push(['newGame', masterName]);
}

// TODO: maybe don't give words or guesses to the client
//       since it could result in cheating
function onMasterWordChosen(word) {
    this.broadcast.emit('masterWordChosen', word);
    history.push(['masterWordChosen', word]);
    masterWord = word;
}

function onClue(player) {
    this.broadcast.emit('clue', player);
    history.push(['clue', player]);
    _.extend(playerDB[this.id], player);
}

function onGuess(guess) {
    this.broadcast.emit('guess', guess);
    history.push(['guess', guess]);

    var player = _.findWhere(playerDB, {name:guess.to});

    // TODO: accomplish this with bitwise ops & switching 
    if (guess.word === player.word) {
        if (guess.from !== masterName) {
            player.guesses.push(_.pick(guess, 'guess','from'));
            if (player.guesses.length >= Math.floor(_.size(playerDB)/2))
                startChallenge(player.name);
        }
        else endContact(player.name, false);
    } else {
        if (guess.from === masterName && player.guesses.length >= Math.floor(_.size(playerDB)/2))
            endContact(player.name, true);
        else endContact(player.name, false);
    }
}

function startChallenge(name) {
    io.sockets.emit('challenge', name);
    history.push(['challenge', name]);
    isChallenge = true;
    // TODO: start countdown
}

function endContact(name, success) {
    var contact = {name:name, success:success}
    io.sockets.emit('contact', contact);
    history.push(['contact', contact]);

    if (success && masterWord.length <= ++contactCount) 
        setTimeout(endGame, 5000);
}

function endGame() {
    io.sockets.emit('gameOver');
    // TODO: do something about players who join in these 5 secs
    setTimeout(startNewGame, 5000);
}

io.sockets.on("connection", function(client) {
    // TODO: only emit essential properties of ea. player
    for (player in playerDB)
        client.emit('joined', playerDB[player]);

    //history.forEach(client.emit.apply.bind(client));
    history.forEach(function(event){
        client.emit(event[0], event[1]); });

    client.on("joined", onJoined);
    client.on("disconnect", onDisconnect);
    client.on("masterWordChosen", onMasterWordChosen);
    client.on("clue", onClue);
    client.on("guess", onGuess);
});

var port = process.env.PORT || 3000;
ioServer.listen(port);
console.log("Started server on port " + port);
