function setGiver (player) {
	if (window.clueGiver) {
		delete clueGiver.word;
		delete clueGiver.clueCount;
	}
	player.clueCount = 0;
	return clueGiver = player;
	//replacing with D3 code
}

//removing all instances of clueGiver and replacing with player
//questions:
	//as a normal player, how do you refer to yourself using player.word, player.cluecount, etc?


function chooseWord (player) {
	if (localPlayer ==! wordMaster) {
		//capturing player word and running matchLetters check on revealed masterword letters
		getInput("Type in a secret word " + wordMaster.word.slice(0, masterWordIndex +1) + "...", matchLetters)
		
		.done(function(word) {
			//? why not localplayer.word = word?
			player.word = word;
			//when word is chosen, emit event
			socket.emit('chooseWord', word);
			//move on to choosing clue 
			chooseClue();
		})
		//if word doesn't match master word letters
		.fail(function(word) {
			//change input box color to pink
			this.css('background', '#FFDDDD')
			getInput('First letters must match master word');
			setTimeout(function() {
				//after 3 seconds, run choose word again
				chooseWord();
				//reset input box back to black
				$('#input').css('background', '#FFFFFF')
				//reset placeholder text
				.prop('placeholder', 'Type in your secret word');
			}, 3000);
		})
	}	
}

//player words must match master word letters
function matchLetters(word) {
	return word.slice(0, masterWordIndex +1) ===
		wordMaster.word.slice(0, masterWordIndex +1);
}

function chooseClue () {
	if (localPlayer ==! wordMaster) {
		console.log(localPlayer.name + 'entered secret clue of: ' + player.clue)
		//capturing player clue
		getInput('Type in a clue that matches your word')
		.then(function(clue){
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