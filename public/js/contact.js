function guess (player) {
	//redisplaying chosen player's clue in local player's input placeholder
	getInput("Guess clue: " + player.clue) 
	.then(function(guess){
		socket.emit('guess', guess);
		localPlayer.guess = guess
		if (wordMaster.guess !== player.word && localPlayer === wordMaster) guess();
		if (localPlayer !== wordMaster) {
			greyInput('You think ' + player.name + "'s word is: " + guess); 
		}
	})	
}

function contactBroken (player) {
		delete player.word
		delete player.clue
		player.contactCount = 0
	}

function challenge (player) {
	//emit challenge event
	socket.emit('challenge', challenge);
	if (localPlayer !== wordmaster) greyInput('Word Master challenge!');
	//if wordmaster can't guess word after 15 seconds, emit contact success event
	if (wordMaster.guess !== player.word) && ('15 seconds have passed') {
		socket.emit('contact', contact);
	}	else loseChallenge();	 
}

function loseChallenge () {
	socket.emit('loseChallenge', loseChallenge);
	contactBroken();
	//TODO: reset D3 zoom and opacity
	//TODO: enable input for everyone else
}
