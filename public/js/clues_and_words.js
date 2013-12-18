function setGiver (player) {
	if (window.clueGiver) {
		delete clueGiver.word;
		delete clueGiver.clueCount;
	}
	player.clueCount = 0;
	return clueGiver = player;
	//replacing with D3 code
}

function chooseGiverWord () {
	if (localPlayer === clueGiver) {
		getInput("Type in your own secret word that starts with the letter(s): " + wordMaster.word.slice(0, masterWordIndex +1) + "...", matchLetters)
		.done(function(word) {
			clueGiver.word = word;
			socket.emit('giverWordChosen', word);
			chooseGiverClue();
		})
		.fail(function(word) {
			this.css('background', '#FFDDDD')
			getInput('First letters must match master word');
			setTimeout(function() {
				chooseGiverWord();
				$('#input').css('background', '#FFFFFF')
				.prop('placeholder', 'Type in your secret word');
			}, 4000);
		})
	}	
}

//clueGiver's word must match revealed letters of master word.
function matchLetters(word) {
	return word.slice(0, masterWordIndex +1) ===
		wordMaster.word.slice(0, masterWordIndex +1);
}

function chooseGiverClue () {
	if (localPlayer === clueGiver) {
		var msg = (clueGiver.clueCount < 1)
			? "Your word is: " + clueGiver.word + ". Give other players a clue of your word."
			: "Optional: add another clue"

		getInput(msg)
		.then(function(clue){
			socket.emit('clue', clue);
			if (addClue(clue) < 3) chooseGiverClue();
			else greyInput('3 clues is all you get!');
		})
	}
}

function addClue (clue) {
	console.log('new clue: ' + clue);
	$('.clue-box').append(
		'clue #' + ++clueGiver.clueCount + ': ' +clue+ '\n' );
	return clueGiver.clueCount;
}