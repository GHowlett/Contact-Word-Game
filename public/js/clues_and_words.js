// allows local player to emit a word
function chooseWord (context) {
	if (localPlayer !== wordMaster) {
		if (!context) 
			context = "Type in a secret word that starts with" + 
				wordMaster.word.slice(0, masterWordIndex +1) + "..."

		getInput(context, matchLetters)
		.done(function(word) {
			console.log(word)
			localPlayer.word = word;
			chooseClue();
		})
		//if word letters don't match, retry
		.fail(function(word){
			chooseWord('First letters must match master word');
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
		? 'Replace your clue if necessary'
		: 'Give a clue for your word';

	getInput(context).then(function(clue){
		localPlayer.clue = clue;
		// TODO: only emit the name, clue, & word
		socket.emit('clue', localPlayer);
		chooseClue();
	})
	//append local player 
	localPlayer.el.find('.clue').html(localPlayer.clue);
}