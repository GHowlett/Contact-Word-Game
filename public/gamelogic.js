//global objects
// TODO: see if connect('/') works
var socket = io.connect('http://localhost');
var masterWordVisibility = new WordsAndClues(true, false, false);
var secretWordVisibility = new WordsAndClues(false, true, false);
var clueVisibility = new WordsAndClues(true, true, true);
var activePlayers = {};
var masterWordIndex = -1; //later incremented to 0 before render

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
}

function setMaster (player) {
	if (window.wordMaster) delete wordMaster.word;
	return wordMaster = player;
}

function setGiver (player) {
	if (window.clueGiver) {
		delete clueGiver.word;
		delete clueGiver.clueCount;
	}
	player.clueCount = 0;
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
	return word.slice(0, masterWordIndex +1) === 
		wordMaster.word.slice(0, masterWordIndex +1);
}

function chooseMasterWord () {
	console.log("choosing master word");

	if (localPlayer === wordMaster) {
		getInput('Type in your secret word')
		.then(function(word) {
			greyInput('Your secret word is ' + word);
			socket.emit('masterWordChosen', word);
			wordMaster.word = word;
			revealLetter();
		});
	} else greyInput('waiting for wordMaster to give a word');
}

function revealLetter () {
	$('.master-word-box').append(
		wordMaster.word[++masterWordIndex] );
}

function chooseGiverWord () {
	if (localPlayer === clueGiver) {
		getInput('Type in a secret word', matchLetters)
		.done(function(word) {
			clueGiver.word = word;
			socket.emit('giverWordChosen', word);
			chooseGiverClue();
		})
		.fail(function(word) {
			this.css('background', '#FFDDDD')
			getInput('First letters must match master word');
			setTimeout(chooseGiverWord, 4000);
		})
	}
}

function chooseGiverClue () {
	if (localPlayer === clueGiver) {
		var msg = (clueGiver.clueCount < 1)
			? "Now give a clue"
			: "You can give up to three";

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
		getInput("Guess " +clueGiver.name+ "'s word and break the contact!")
		.then(function(guess){
			socket.emit('guess', guess); 
			$("td:contains(" + localPlayer.name + ")").next().text(guess);
			// TODO: let wordMaster try again
		});
	}
	else if (localPlayer !== clueGiver) {
		getInput('What is ' + clueGiver.name + "'s word?")
		.then(function(guess){
			socket.emit('guess', guess); 
			$("td:contains(" + localPlayer.name + ")").next().text(guess);
			greyInput ("Waiting for other players' guesses");
		});
	}
}

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
		.val('')
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
	socket.on('newGame', function(master){
		console.log(master + ' is the new master');
		setMaster(activePlayers[master]);
		if (localPlayer) chooseMasterWord();
	});

	socket.on('masterWordChosen', function(word){
		console.log('the master word is ' + word);
		wordMaster.word = word;
		revealLetter();
		// TODO: change status to waiting for giver
	});

	socket.on('newRound', function(giver){
		console.log(giver + ' is the new giver');
		
		// reset player guesses
		// is this necessary?
		for (player in activePlayers)
			activePlayers[player].guess = null;

		setGiver(activePlayers[giver]);
		if (localPlayer) chooseGiverWord();
	});

	socket.on('giverWordChosen', function(word){
		console.log('the giver word is ' + word);
		clueGiver.word = word;
		greyInput('Waiting for a clue');
	});

	socket.on('clue', function(clue){
		if (addClue(clue) === 1) guessWord();
	});

	socket.on('guess', function(player){
		console.log(player.name +' has guessed '+ player.guess);
		activePlayers[player.name].guess = player.guess;
		// TODO: update the DOM to show that the player has guessed
		//       if it's the WordMaster, don't overwrite the old one
	});

	socket.on('roundOver', function(success){

		console.log('round over, wordMaster '+ (success? 'lost':'won'));
		// TODO: reveal the giver's word and all the guesses
		// TODO: reset any variables as are necessary
		if (success) revealLetter();
	});

	socket.on('gameOver', function(){
		console.log('game over');
		// TODO: append to the DOM
		// TODO: reset any variables as are necessary
	});

	chooseName();
};


//Jason TODOs------------------
	//set up checkAnswers function


//Tim TODOs-----------------
	//personalize the placeholder messages


//Griffin TODOs-----------
	//everything


//Remaining TODOs--------
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
