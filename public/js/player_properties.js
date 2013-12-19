var activePlayers = {};

// TODO: find a more semantic way of overloading this
// TODO: maybe allow multiple clues at once
function Player (name) {
	if (typeof name === "object")
		for (prop in name) this[prop] = name[prop];
	else this.name = name || "";

	if (!this.word) this.word = ""; 
	if (!this.clue) this.clue = "";
	if (!this.guesses) this.guesses = [];
}

// creates, renders, and emits the local player upon name decision
function chooseName (context) {
	console.log('choosing name');

	if (!context) context = 'Choose a Nickname';

	getInput(context, isDuplicateName)
	.done(function(name) {
		localPlayer = addPlayer(new Player(name));
		renderPlayer(localPlayer);
		socket.emit('joined', localPlayer); 
	})
	// if name taken, ask for different one
	.fail(function() { chooseName('Name already taken'); })
}

function isDuplicateName(playerName) {
	for (name in activePlayers)
		if (playerName === name) return false;
	return true;
}