//global objects
// TODO: see if connect('/') works
var socket = io.connect('http://localhost');
var MasterWord = new WordsAndClues(true, false, false);
var secretWord = new WordsAndClues(false, true, false);
var clue = new WordsAndClues(true, true, true);
var activePlayers = {length:0};

// defines visibility of words and clues
function WordsAndClues (visibleToWordMaster, visibleToClueGiver, visibleToPlayer) {
	this.visibleToWordMaster = visibleToWordMaster;
	this.visibleToClueGiver = visibleToClueGiver;
	this.visibleToPlayer = visibleToPlayer;
}

// creates, renders, and adds player to active players array.
function renderPlayer (player) {
	$('table tr:last')
		.after('<tr> <td>' + player.name + '</td> <td>' +
			'status placeholder' + '</td>  <td>' +
			'response placeholder' + '</td> </tr>' );
}

// TODO: find a more semantic convention for type overloading
function Player (name, guess) {
	if (typeof name === "object")
		for (prop in name) this[prop] = name[prop];
	else {
		this.name = name || "";
		this.guess = guess || ""; }
	activePlayers[name] = this;
	activePlayers.length++;
}

// sets new wordMaster. if applicable, reset previous wordMaster to regular player.
function setMaster (player) {
	if (wordMaster) delete wordMaster.secret;
	return wordMaster = player;
}

// sets new clueGiver. if applicable, reset previous clueGiver to regular player.
function setGiver (player) {
	if (clueGiver) {
		delete clueGiver.secret;
		delete clueGiver.clue; }
	return clueGiver = player;
}

///////////////////   Stages    ///////////////////////////

// creates, renders, and emits the local player upon name decision
function chooseName (callback) {
	getInput('Choose a Nickname')
	.then(function(name) {
		if(!activePlayers.length) {
			renderPlayer(localPlayer = new Player(name));
			socket.emit('named', localPlayer);
		} else {
			$.each(activePlayers, function(key, value) {
				if(name = value.name) {
					$("#input")
						.css("background", "#FF8566")
						.val('')
						.prop('placeholder', 'Name already taken, please choose another');
				} else {
					getInput('Choose a Nickname')
						.then(function(name) {
							renderPlayer(localPlayer = new Player(name));
							socket.emit('named', localPlayer);
						})
						.then(callback);
				}
			});
		}
	})
	.then(callback);
}

function waitForPlayers (callback) {
	if (activePlayers.length < 4) {
		greyInput('waiting for players');
		setTimeout(waitForPlayers, 2000, callback);
	} else callback();
}

function chooseMasterSecret (callback) {

	console.log('choosing secret');
	// TODO: if first to join, set self as wordMaster
	//		 if second to join, set as clueGiver

	//		 if second+ to join, gray the input with a
	//		     placeholder of 'waiting for wordMaster'
	//		 if wordMaster request a secret word
}

function choosePlayerSecretClue (callback) {

}

function guesssecretWord (callback) {

}

/////////////////////////////////////////////////////////

// greys out the input box with a placeholder msg
function greyInput (placeholder) {
	$("#input")
		.val('')
		.prop('disabled', true)
		.prop('placeholder', placeholder);
}

// returns a promise that binds function contexts to #input
function getInput (placeholder) {
	var deferred = new $.Deferred();
	$('#input') // remove previous click handler
		.off('keydown').focus()
	  	.attr('placeholder', placeholder)
	  	.on('keydown', function(e) {
	 		if (e.which === 13)
	 			deferred.resolveWith(this, [this.value]);
	}); return deferred.promise()
}

function series () { // runs function as a waterfall
    var context = this;
    return [].reduceRight.call(arguments, function(next,current) {
		return current.bind(context, next);
	});
}

window.onload = function() {
	socket.on('joined', function(playerData){
		renderPlayer(new Player(playerData));
	});

	chooseName(function(){
		// Game Loop
		// TODO: accomplish infinite loop with cyclical
		// 		 callback wiring if this doesn't work
		// while (true){ series(
		// 	waitForPlayers,
		// 	chooseMasterSecret

		// 	// TODO: add the rest of the stages
		// )()}
	});


// Set the input placeholder of players to 'waiting for wordmaster'

// Enable input for word master

// word master's input is labeled with "Choose master word",
// when user enters in master word it is populated into the master
// word box, but this is hidden from everyone except the word master.

// Disable input for wordmaster

// Enable input for word/clue chooser

// Select first person in the user column, prompt him or her to enter
// a word -- the input field has a label choose secret word. The chosen
// user's status is populated with the secret word they chose.

// Then the chosen player types in a clue. The input has a label called:
// choose clue for secret word. On submit the clue box is populated with
// clue.

// Disable input for word/clue chooser

// Enable input for other players and wordmaster

// The other players who did not choose a master secret word start
// guessing words by typing. Their input is labeled with: "Start
// guessing what the word is", and on submit their response is stored
// and their input is locked up. Status becomes clue submitted, and
// response field in table is populated with their guess, which is currently
// hidden from everyone except them.

// Once a player has guessed, disable input

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