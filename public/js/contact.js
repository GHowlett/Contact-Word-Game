function guess (player) {
	getInput("What is " + player.name "'s word?") 
	.then(function(guess){
		guessObj = {name:player.name, guess:guess};
		localPlayer.guesses.push(guessObj);
		socket.emit('guess', guessObj);
		
		if (localPlayer === wordMaster) 
			if (guess === player.word) greInput('You Got It!')
			else guess(); // keep guessing
		else greyInput('You think ' + player.name + "'s word is: " + guess);
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
