//global objects
// TODO: see if connect('/') works
var socket = io.connect('http://localhost');

///////////////////   Stages    ///////////////////////////


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

function guessWord () {
	if (localPlayer === wordMaster) {
		getInput("")
		.then(function(guess){
			socket.emit('guess', guess);
			localPlayer.guess = guess;
			// replacing w/ D3 code
			// localPlayer.el.find('.response').append('...' + guess);
			if (wordMaster.guess !== clueGiver.secret) {
				guessWord();
			}
		});
	}
	else if (localPlayer !== clueGiver) {
		getInput('What is ' + clueGiver.name + "'s word?")
		.then(function(guess){
			socket.emit('guess', guess);
			localPlayer.guess = guess;
			localPlayer.el.find('.response').text(guess);
			greyInput ("Waiting for other players' guesses");
		});
	}
}

function revealLetter () {
	$('.master-word-box').append(
		wordMaster.word[++masterWordIndex] );
}

function successContact () {
	if (// number of required players are met && ALL player.guess matches clueGiver.secret)	{
		challenge ();
	}	else	{
		failContact();
	}
}

function failContact () {
	if (wordMaster.guess === clueGiver.secret) || (//ALL player.guess does not match clueGiver.secret) {
 
	//todo: add big red X
	//todo: remove player connections (D3)
	//todo: reset if wordMaster.guess matches clueGiver.secret
}

function challenge () {
	socket.emit('challenge', challenge);
	//todo: toggle opacity (d3)
	//todo: append 15 second countdown to DOM
	//todo: reveal word to everyone except WM
	if (wordMaster.guess !== clueGiver.secret) && (//15 seconds have passed) {
		revealLetter();
		//todo: append some congrats text  
	}	else failContact();	 
}








