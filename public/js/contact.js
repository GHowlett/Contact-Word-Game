function guess (player) {
	getInput("What is " + player.name + "'s word?") 
	.then(function(playerGuess){
		socket.emit('guess', {
			to: player.name,
			from: localPlayer.name, 
			word: playerGuess,
			guess: localPlayer.guess
		});
		if (localPlayer === wordMaster) 
			if (playerGuess === player.word){
				breakContact();
			} 
			else guess(); // keep guessing
		else greyInput('You guessed: ' + playerGuess);
	})
}

function challenge (player) {
	//emit challenge event
	socket.emit('challenge', challenge);
	if (localPlayer !== wordmaster) greyInput('Word Master challenge!');
	//todo: griffin
	//if wordmaster can't guess word after 15 seconds, emit contact success event
	// if (wordMaster.guess !== player.word) && () {
	// 	socket.emit('contact', contact);
	// }	else loseChallenge();	 
}

function loseChallenge () {
	socket.emit('loseChallenge', loseChallenge);
	contactBroken();
}
