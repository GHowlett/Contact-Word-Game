var activePlayers = {};

function Player (name, guess) {
	if (typeof name === "object")
		for (prop in name) this[prop] = name[prop];
	else {
		this.name = name || "";
		this.guess = guess || ""
		//new: every player needs a clue property.
		this.word = word || ""; 
		this.clue = clue || "";
	}

	//replacing this some D3 code?
	Object.defineProperty(this, 'el',
		{value: $('<tr/>').appendTo('tbody'), writable:true});

	activePlayers[this.name] = this;
}

// creates, renders, and emits the local player upon name decision
function chooseName () {
	console.log('choosing name');

	getInput('Choose a Nickname', isDuplicateName)
	.done(function(name) {
		renderPlayer(localPlayer = new Player(name));
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