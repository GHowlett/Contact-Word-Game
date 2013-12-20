function guess (player) {
	getInput("What is " + player.name + "'s word?") 
	.then(function(guessedWord){
		socket.emit('guess', {
			to: player.name,
			from: localPlayer.name, 
			word: guessedWord
		});

		if (localPlayer === wordMaster) {
			if (guesssword === player.word)
				return greyInput('You Got It!!')
			else guess(); // keep guessing
		}

		greyInput('You guessed: ' + guessedWord);
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