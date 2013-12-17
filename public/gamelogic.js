//global objects
// TODO: see if connect('/') works
var socket = io.connect('http://localhost');
var activePlayers = {};
var masterWordIndex = -1; //later incremented to 0 before render


function Player (name, guess) {
	if (typeof name === "object")
		for (prop in name) this[prop] = name[prop];
	else {
		this.name = name || "";
		this.guess = guess || ""
		//new: every player needs a clue property.
		this.clue = clue || ""; }

	//replacing this some D3 code?
	Object.defineProperty(this, 'el',
		{value: $('<tr/>').appendTo('tbody'), writable:true});

	activePlayers[this.name] = this;
}

function setMaster (player) {
	if (window.wordMaster) delete wordMaster.word;
	return wordMaster = player;
	//replacing with D3 code
	//localPlayer.el.find('.response').text(guess);
}

function setGiver (player) {
	if (window.clueGiver) {
		delete clueGiver.word;
		delete clueGiver.clueCount;
		
	}
	player.clueCount = 0;
	return clueGiver = player;
	//replacing with D3 code
	// localPlayer.el.find('.response').text(guess);
}

///////////////////   Stages    ///////////////////////////

// creates, renders, and emits the local player upon name decision
function chooseName () {
	console.log('choosing name');

	getInput('Choose a Nickname', isDuplicateName)
	.done(function(name) {
		renderPlayer(localPlayer = new Player(name));
		socket.emit('joined', localPlayer); })
	.fail(function() {
		this.css('background', '#FFDDDD')
			.val('')
			.prop('placeholder', 'Name already taken, please choose another');
		setTimeout(function() {
			chooseName();
			$('#input').css('background', '#FFFFFF')
				.prop('placeholder', 'Choose a Nickname');
			}, 2000); // show error message for 2 seconds
	})
}

function isDuplicateName(playerName) {
	for (name in activePlayers)
		if (playerName === name) return false;
	return true;
}

function chooseMasterWord () {
	console.log("choosing master word");

	if (localPlayer === wordMaster) {
		getInput('You are the Word Master. Type in your word!')
		.then(function(word) {
			greyInput('The Master Word is ' + word);
			socket.emit('masterWordChosen', word);
			wordMaster.word = word;
			revealLetter();
		});
	} else {
		greyInput('Waiting for master word');
	}
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
	//event listener: 
	//todo: toggle opacity (d3)
	//todo: append 15 second countdown to DOM
	//todo: reveal word to everyone except WM
	if (wordMaster.guess !== clueGiver.secret) && (//15 seconds have passed) {
		revealLetter();
		//todo: append some congrats text  
	}	else failContact();	 
}

//////////////////////  DOM Manipluation  ///////////////////////

// creates, renders, and adds player to active players array.
function renderPlayer (player) {
	player.el.html(
		'<td class="name">' + player.name + '</td>' +
		'<td class="response">' + '' + '</td>');
}

function removePlayer (name) {
	activePlayers[name].el.remove();
	delete activePlayers[name];
}

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


////////////////////////  Event Listeners  ///////////////////////

window.onload = function() {
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
	socket.on('newGame', function(master){
		console.log(master + ' is the new master');
		setMaster(activePlayers[master]);
		if (localPlayer) chooseMasterWord();
		//wordMaster.el.find('.name').append(' [WordMaster]');
	});

	socket.on('masterWordChosen', function(word){
		console.log('the master word is ' + word);
		wordMaster.word = word;
		revealLetter();
	});

	//Still need this?
	socket.on('newRound', function(giver){
		$('.clue-box').text('');
		console.log(giver + ' is the new giver');

		for (player in activePlayers)
			activePlayers[player].guess = null;

		setGiver(activePlayers[giver]);
		if (localPlayer) chooseGiverWord();
		if (clueGiver) {
			clueGiver.el.find('.name').append(' [Clue Giver]');
		};
		chooseGiverWord();
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
		if (player.name !== wordMaster.name) {
			//what do i want to do from server when guess event is emitted? 
		}
		if (player.name === wordMaster.name) {
			//todo: replace this code to work with D3 
			wordMaster.el.find('.response').append('...' + player.guess);
		};
	});

	socket.on('contact', function(){
		console.log(player.name +' has guessed '+ player.guess);
		activePlayers[player.name].guess = player.guess;
		// update the DOM to show that the player has guessed
		activePlayers[player.name].el.find('.guess').text('Guess Submitted!');
	})

	socket.on('challenge', function(){
		
	})

	socket.on('contactBroken', function(){

	})

	socket.on('')

	//originally 'roundOver'
	socket.on('challengeOver', function(success){
		console.log('Challenge <Ov></Ov>er, wordMaster '+ (success? 'lost':'won'));
		if (success) {
			playersWin();
			setTimeout(revealLetter(), 4000);
		}	else{
				wordMasterWins();
		}
	});

	socket.on('gameOver', function(){
		console.log('game over');
		gameOver();
	});

	chooseName();
	};





