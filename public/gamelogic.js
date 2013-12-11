function Player(name, guess) {
	this.name = name || "";
	this.guess = guess || "";
}

// sets new global master and and resets old one to a regular player 
function setMaster (player) {
	if (wordMaster) delete wordMaster.secret;
	wordMaster = player;
}

// sets new global clueGiver and resets old one to regular player
function setGiver (player) {
	if (clueGiver) {
		delete clueGiver.secret;
		delete clueGiver.clue; }
	clueGiver = player;
}

function WordsAndClues(visibleToWordMaster, visibleToClueGiver, visibleToPlayer) {
	this.visibleToWordMaster = visibleToWordMaster;
	this.visibleToClueGiver = visibleToClueGiver;
	this.visibleToPlayer = visibleToPlayer;
}

var MasterWord = new WordsAndClues(true, false, false);

var secretWord = new WordsAndClues(false, true, false);

var clue = new WordsAndClues(true, true, true);


// Input Context Functions

function addPlayer (player) {
	$('table tr:last').after(
		'<tr><td>' + player.name + '</td></tr>' );
}

// creates and emits a player upon name decision
function nameChosen (e) {
	if (e.which === 13) {
		var player = new Player(this.value);
		socket.emit('named', player); 
	}
}

function chooseMasterWord () {

}

function choosesecretWord () {

}

function choosePlayerSecretClue () {

}

function guesssecretWord () {

}

// Enable input

// when user enters game, input has label prompting using to
// enter a username. They type in a username and then hit submit.



window.onload = function() {

	var socket = io.connect('http://localhost');
	socket.on('joined', addPlayer);

	// Naming Stage
	// TODO: check if name already taken on the client side
	$('#input').attr('placeholder', 'Choose a Nickname');
	$('#input').on('keydown', nameChosen);

// Disable input

// Once 4 players have joined, then the game begins:

// choose random word master

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