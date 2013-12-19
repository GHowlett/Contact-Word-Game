// allows local player to emit a word
function chooseWord () {
	if (localPlayer !== wordMaster) {
		getInput("Type in a secret word that starts with" + 
			wordMaster.word.slice(0, masterWordIndex +1) + "...", 
			matchLetters)
		
		.done(function(word) {
			localPlayer.word = word;
			chooseClue();
		})
		//if word letters don't match, retry
		.fail(function(word) {
			this.css('background', '#FFDDDD')
			greyInput('First letters must match master word');
			setTimeout(chooseWord, 3000);
		})
	}
}

// player words must match master word letters
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