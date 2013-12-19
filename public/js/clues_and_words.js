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
function matchLetters(word) {
	return word.slice(0, masterWordIndex +1) ===
		wordMaster.word.slice(0, masterWordIndex +1);
}

function chooseClue (player) {
	if (localPlayer ==! wordMaster) {
		console.log(localPlayer.name + 'entered secret clue of: ' + player.clue)
		//capturing player clue
		getInput('Type in a clue that matches your word')
		.then(function(clue){
			//emit clue event
			socket.emit('clue', clue);
			//if players have not entered 3 clues, give them the option to add clues.
			if (addClue(clue) < 3) chooseClue();
			//prevent more than 3 clues
			else greyInput('3 clues is all you get!');
		})
	}
}

function addClue (clue) {
	console.log('new clue: ' + clue);
	$('.clue-box').append(
		"..." + clue + '\n');
	return player.clueCount;
}