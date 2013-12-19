function chooseWord (player) {
	if (localPlayer ==! wordMaster) {
		//capturing player word and running matchLetters check on revealed masterword letters
		getInput("Type in a secret word " + wordMaster.word.slice(0, masterWordIndex +1) + "...", matchLetters)
		
		.done(function(word) {
			player.word = word;
			//once complete, choose clue 
			chooseClue();
		})
		//if word doesn't match master word letters
		.fail(function(word) {
			//change input box color to pink
			this.css('background', '#FFDDDD')
			getInput('First letters must match master word');
			//after 3 seconds, allow player to choose word again
			setTimeout(chooseWord, 3000);
		})
	}
}

//player words must match master word letters
function matchLetters (word) {
	return word.slice(0, masterWordIndex +1) ===
		wordMaster.word.slice(0, masterWordIndex +1);
}

// allows local player to emit a clue
function chooseClue () {
	if (localPlayer === wordMaster) return;

	var context = localPlayer.clue
		? 'Give a clue for your word'
		: 'Replace your clue if necessary';

	getInput(context).then(function(clue){
		localPlayer.clue = clue;
		socket.emit('clue', localPlayer);
		chooseClue();
	})
}