function guess (player) {
	getInput("What is " + player.name + "'s word?") 
	.then(function(guessedWord){
		socket.emit('guess', {
			to: player.name,
			from: localPlayer.name, 
			word: guessedWord
		});

		if (localPlayer === wordMaster) {
			$('.word-master-guess-box').html(guessedWord);
			if (guessedWord === player.word)
				return greyInput('You Got It!!');
			else guess(player); // keep guessing
		}

		greyInput('You guessed: ' + guessedWord);
		setTimeout(function(){
			localPlayer.word? choosClue() : chooseWord();
		}, 1500);
	})
}

// function challenge () {
// 	//emit challenge event
// 	challenge = 'challenge word'
// 	socket.emit('challenge', challenge);
// 	//if (localPlayer !== wordmaster) greyInput('Word Master challenge!');
// 	//todo: griffin
// 	//if wordmaster can't guess word after 15 seconds, emit contact success event
// 	// if (wordMaster.guess !== player.word) && () {
// 	// 	socket.emit('contact', contact);
// 	// }	else loseChallenge();	 
// }

function loseChallenge () {
	socket.emit('loseChallenge', loseChallenge);
	//cleanup(player.name);
}