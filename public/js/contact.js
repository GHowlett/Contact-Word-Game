function guess (player) {
	getInput("What is " + player.name + "'s word?") 
	.then(function(guess){
		socket.emit('guess', {
			to: player.name,
			from: localPlayer.name, 
			guess: guess
		});
		
		if (localPlayer === wordMaster) 
			if (guess === player.word) greInput('You Got It!')
			else guess(); // keep guessing
		else greyInput('You think ' + player.name + "'s word is: " + guess);
	})
}

function onContactBroken (player) {
	delete player.word;
	delete player.clue;
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
