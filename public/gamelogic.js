//global objects
// TODO: see if connect('/') works
var socket = io.connect('http://localhost');
var masterWordVisibility = new WordsAndClues(true, false, false);
var secretWordVisibility = new WordsAndClues(false, true, false);
var clueVisibility = new WordsAndClues(true, true, true);
var activePlayers = {length:0};

// defines visibility of words and clues
function WordsAndClues (visibleToWordMaster, visibleToClueGiver, visibleToPlayer) {
	this.visibleToWordMaster = visibleToWordMaster;
	this.visibleToClueGiver = visibleToClueGiver;
	this.visibleToPlayer = visibleToPlayer;
}

// creates, renders, and adds player to active players array.
function renderPlayer (player) {
	$('tbody').append(
		'<tr>' +
			'<td>' + player.name + '</td>' +
			'<td>' + 'response placeholder' + '</td>' +
		'</tr>' );
}

function removePlayer (name) {
	delete activePlayers[name];
	activePlayers.length--;

	$('tr:contains(' + name + ')')
		.remove() // remove player name
		.next()
		.remove() // remove player status
		.next()
		.remove(); // remove player response
}

// TODO: find a more semantic convention for type overloading
function Player (name, guess) {
	if (typeof name === "object")
		for (prop in name) this[prop] = name[prop];
	else {
		this.name = name || "";
		this.guess = guess || ""; }
	activePlayers[this.name] = this;
	activePlayers.length++;
}

// sets new wordMaster. if applicable, reset previous wordMaster to regular player.
function setMaster (player) {
	if (window.wordMaster) delete wordMaster.wmWord;
	return wordMaster = player;
}

// sets new clueGiver. if applicable, reset previous clueGiver to regular player.
// TODO change property 'secret' to something else
function setGiver (player) {
	if (window.clueGiver) {
		delete clueGiver.secret;
		delete clueGiver.clues; }
	player.clues = [];
	return clueGiver = player;
}

///////////////////   Stages    ///////////////////////////

// creates, renders, and emits the local player upon name decision
function chooseName () {
	console.log('choosing name');

	getInput('Choose a Nickname', isDuplicateName)
	.done(function(name) {
		renderPlayer(localPlayer = new Player(name));
		socket.emit('joined', localPlayer);
		$("td:empty").parent().remove(); })
	.fail(function() {
		this.css('background', '#FFDDDD') // TODO: change this back after timeout
			.val('')
			.prop('placeholder', 'Name already taken, please choose another');
		setTimeout(chooseName, 4000); // show error message for 2 seconds
	})
}

function isDuplicateName(playerName) {
	for (name in activePlayers)
		if (playerName === name) return false;
	return true;
}

function matchLetters(word) {
	var masterLetter = wordMaster.word.split('');
	var giversLetter = word.split('');
	var indexMatch = masterWordIndex;

	if(masterLetter[indexMatch] !== giversLetter[indexMatch]) {
		return false;
	} else {
		return true;
	}
}

function chooseMasterWord () {
	console.log("choosing master word");

	if (localPlayer === wordMaster) {
		//capturing user input
		getInput('Type in your secret word')
		.then(function(wmWord) {
			//disabling input
			greyInput('Your secret word is ' + wmWord);
			socket.emit('masterWordChosen', wmWord);
			masterWordChosen(wmWord);
		})
	} else {
		// for everyone else, keep input disabled and replace placeholder text with status
		greyInput('waiting for master word');
		}
	}

function masterWordChosen (wmWord) {
	wordMaster.word = wmWord;
	$('.master-word-box').append(wordMaster.word.split('')[0]);
	masterWordIndex = 0;
}

function chooseGiverWord () {
	if (localPlayer === clueGiver) {
		getInput('Type in a secret word', matchLetters)
		.done(function(secret) {
			clueGiver.secret = secret;
			socket.emit('giverWordChosen', secret);
			chooseGiverClue();
		})
		.fail(function(secret) {
			clueGiver.secret = secret;
			this.css('background', '#FFDDDD')
			.val('')
			.prop('placeholder', 'First letters of your word do not match master word');
			setTimeout(chooseGiverWord, 4000);
		})
	}
}

function chooseGiverClue () {
	if (localPlayer === clueGiver) {
		getInput("Now type a clue.")
		.then(function(clue){})
	}
	// appending string into clue box- visible to everyone.
	$('.clue-box').append('#1: ' + clue);
	//limiting 3 submits
	if (clue.clues.length >= 3) {
		greyInput('3 clues is all you get!');
	}
	socket.emit('enteredClue', clue);
}

function guessWord () {
	if (localPlayer !== clueGiver && localPlayer !== wordMaster) {
		//get input from players
		getInput('What is ' + clueGiver + " 's word?")
		.then(function(guess){
			socket.emit('guess', guess); })
		//lock input on submit
		greyInput ('Waiting for other guesses');
	}

	if (localPlayer === wordMaster) {
		getInput("Guess the clue and break the contact!")
		.then(function(WMguess){
			socket.emit('wmGuessed', WMguess); })
	}
}

function nextMasterWordLetter () {
	for (var i= 0; masterWord[i] >= masterWordIndex; i++) {
		//append letter to master word box
		$('.master-word-box').append(masterWord[i]);
		//increment associative index by 1
		masterWordIndex++;
    }
}

// function checkAnswers ()
// 	//TODO: set up success condition to reveal next letter of masterword
// 		//if playerGuesses === secretWord, reveal next letter in masterWord and force next round.

// 	if (localPlayer !== clueGiver && localPlayer !== wordMaster) {
// 		getInput('') //in-progress
// 			.then(function(success) {
// 		//reveal the next letter of m
// 	}	else	{
// 			//move cluegiver to the next player in array
// 			//start the gameflow overloading
// 		}
// 	}

// 	//TODO: if wordMaster guess === secretWord, force next round
// 	if

// 	//
// }

/////////////////////////////////////////////////////////

function appendModal(text) {
	$('body').append("<div class='modal'><div class='modal-inner'><p>" + text + "</p><div class='spinner'></div></div></div>");
}

function removeModal() {
	$('.modal').remove();
}

// greys out the input box with a placeholder msg
function greyInput (placeholder) {
	$("#input")
		.val('')
		.prop('disabled', true)
		.prop('placeholder', placeholder);
}

// returns a promise that binds function contexts to #input
function getInput (placeholder, validate) {
	var deferred = new $.Deferred();
	var input = $("#input")
		.prop('disabled', false)
		.attr('placeholder', placeholder);

	// clear out old handlers
	$('#gameForm').off('submit');
	$('#gameForm').submit(function(e) {
	 	e.preventDefault();
		(!validate || validate(input.val()))
	 		? deferred.resolveWith(input, [input.val()])
	 		: deferred.rejectWith(input, [input.val()]);
 	});

 	// clear/change status header
 	$('header .game-status').text('').text(placeholder);

	return deferred.promise()
}

window.onload = function() {
	// TODO: make sure all emitions are being captured
	// 		 even though we don't listen until now
	socket.on('joined', function(playerData){
		renderPlayer(new Player(playerData));
	});

	socket.on('left', function(name){
		console.log(name + ' left');
		removePlayer(name);
	});

	socket.on('pause', function(reason){
		if (localPlayer) {
			console.log('paused');
			appendModal(reason);
		}
	});

	socket.on('resume', function(){
		if (localPlayer) {
			console.log('resumed');
			removeModal();
		}
	});

	// Game Loop (runs if name has been chosen)
	// TODO: make unnamed players be able to spectate
	socket.on('newRound', function(pair){
		setMaster(activePlayers[pair.master]);
		setGiver(activePlayers[pair.giver]);
		if (localPlayer) chooseMasterWord();
	});

	socket.on('masterWordChosen', function(word){
		console.log('the master word is ' + word);
		// TODO: split up and append part of the word to the dom
		masterWordChosen(word);
		chooseGiverWord();
	});

	socket.on('giverWordChosen', function(word){
		console.log('the giver word is ' + word);
		clueGiver.secret = word;
		// TODO: change status to waiting for clue
	});

	socket.on('clue', function(clue){
		// TODO: append clue to DOM
		if (clueGiver.clues.push(clue) === 1) guessWord();
	});

	socket.on('guess', function(player){
		console.log(player.name +' has guessed '+ player.guess);
		activePlayers[player.name].guess = player.guess;
		// TODO: update the DOM to show that the player has guessed
		//       if it's the WordMaster, don't overwrite the old one

		for (player in activePlayers) 
			if (!player.guess) return;
		console.log('all player have guessed');
		// TODO: reveal the giver's word and all the guesses
		//		 increment the index if contact is made
		// 		 if all letters are captured, declare victory
		//		 else choose a new clueGiver and loop around
	});

	chooseName();


//Jason TODOs------------------
	//add property enable input to getInput. DONE
	//create giverWordChosen function to emit data. DONE.
	//rename chooseGiverWord and break out chooseGiveClue into separate fn. REMOVE.
	//set up checkAnswers function


//Tim TODOs-----------------
	//increase size of modals
	//change status header to update


//Griffin TODOs-----------
	//everything




//Remaining TODOs---------
// Then the chosen player types in a clue. The input has a label called:
// choose clue for secret word. On submit the clue box is populated with
// clue.

// The other players who did not choose a master secret word start
// guessing words by typing. Their input is labeled with: "Start
// guessing what the word is", and on submit their response is stored
// and their input is locked up. Status becomes clue submitted, and
// response field in table is populated with their guess, which is currently
// hidden from everyone except them.

// The word master's guess, however, is visible to everyone playing.

// The input field of the player who chose the word/clue is locked for
// this round.

// Compare user inputs with secret word. If the players have the same guesses and
// their guess is the same as the secret word AND they do all this before the word
// master, reveal the first obscured character of the master secret word.
// else, failure and the character remains obscured.

// If player secret word is equal to master secret word, and the master secret
// word is correctly chosen by the players, the players win and the word
// master loses.

// The player who chose the secret word wins the game and becomes the next
// word master.

// If the master secret word is not guessed at the end of the round,
// select next player in user column and begin again.


};