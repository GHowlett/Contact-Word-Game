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
function chooseName () {
	console.log('choosing name');

	getInput('Choose a Nickname', isDuplicateName)
	.done(function(name) {
		renderPlayer(localPlayer = addPlayer(new Player(name)));
		socket.emit('joined', localPlayer); })
	.fail(function() {
		this.css('background', '#FFDDDD')
			.val('')
			.prop('placeholder', 'Name already taken, please choose another');
		setTimeout(function() {
			chooseName();
			$('#input').css('background', '#FFFFFF')
				.prop('placeholder', 'Choose a Nickname');
			}, 2000); // show error message for 2 seconds
	})
}

function isDuplicateName(playerName) {
	for (name in activePlayers)
		if (playerName === name) return false;
	return true;
}