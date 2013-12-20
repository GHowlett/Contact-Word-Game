function guess (clueGiverPlayer) {
	getInput("What is " + clueGiverPlayer.name + "'s word?") 
	.then(function(playerGuess){
		socket.emit('guess', {
			to: clueGiverPlayer.name,
			from: localPlayer.name, 
			guess: playerGuess
		});
		console.log(clueGiverPlayer.name)
		console.log(localclueGiverPlayer.name)
		if (localPlayer === wordMaster) 
			if (playerGuess === clueGiverPlayer.word) greyInput('You Got It!')
			else guess(); // keep guessing
		else greyInput('You guessed: ' + playerGuess);
	})
}

function onContactBroken (clueGiverPlayer) {
	delete clueGiverPlayer.word;
	delete clueGiverPlayer.clue;
}

function challenge (clueGiverPlayer) {
	//emit challenge event
	socket.emit('challenge', challenge);
	if (localPlayer !== wordmaster) greyInput('Word Master challenge!');
	//todo: griffin
	//if wordmaster can't guess word after 15 seconds, emit contact success event
	// if (wordMaster.guess !== clueGiverPlayer.word) && () {
	// 	socket.emit('contact', contact);
	// }	else loseChallenge();	 
}

function loseChallenge () {
	socket.emit('loseChallenge', loseChallenge);
	contactBroken();
}
