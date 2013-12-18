//global objects
// TODO: see if connect('/') works
var socket = io.connect('http://localhost');
var activePlayers = {};
var masterWordIndex = -1; //later incremented to 0 before render

// TODO: find a more semantic convention for type overloading
function Player (name, guess) {
	if (typeof name === "object")
		for (prop in name) this[prop] = name[prop];
	else {
		this.name = name || "";
		this.guess = guess || ""; }

	Object.defineProperty(this, 'el',
		{value: $('<tr/>').appendTo('tbody'), writable:true});

	activePlayers[this.name] = this;
}

function setMaster (player) {
	if (window.wordMaster) delete wordMaster.word;
	return wordMaster = player;
	localPlayer.el.find('.response').text(guess);
}

function setGiver (player) {
	if (window.clueGiver) {
		delete clueGiver.word;
		delete clueGiver.clueCount;
		string = localPlayer.el.find('.response') .replace('');
	}
	player.clueCount = 0;
	return clueGiver = player;
	localPlayer.el.find('.response').text(guess);
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
		 	$('header #game-status').text('Waiting for first clue...');
		});
	} else {
		greyInput('Waiting for master word');
		$('header #game-status').text('Hang tight! Waiting for master word');
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
	}	else {
			greyInput('Waiting for clue' );
			$('header #game-status').text('Hang tight! Waiting for clue from '+ clueGiver.name);
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
	$('#clue-box').append(
		'clue #' + ++clueGiver.clueCount + ': ' +clue+ '\n' );
	return clueGiver.clueCount;
}

function guessWord () {
	if (localPlayer === wordMaster) {
		getInput("Guess " +clueGiver.name+ "'s word and break the contact!")
		.then(function(guess){
			socket.emit('guess', guess);
			localPlayer.guess = guess;
			localPlayer.el.find('.response').append('...' + guess);
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
	$('#master-word-box').append(
		wordMaster.word[++masterWordIndex] );
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
	$('#game-form').off('submit');
	$('#game-form').submit(function(e) {
	 	e.preventDefault();
		(!validate || validate(input.val()))
	 		? deferred.resolveWith(input, [input.val()])
	 		: deferred.rejectWith(input, [input.val()]);
 	});


 	// clear/change status header
 	$('header #game-status').text('').text(placeholder);
	return deferred.promise()
}

function playersWin () {
	if (localPlayer === clueGiver) {
		$('header #game-status').text('Success! Revealing the next letter...');
	}
	else if (localPlayer === wordMaster) {
		$('header #game-status').text('Fail! The word was [' + clueGiver.word +']. Revealing next letter..');
	}
	else if (localPlayer !== clueGiver && localPlayer !== wordMaster) {
		$('header #game-status').text("Success! [" + clueGiver.word + "] was correct! Revealing next letter...");
	 }
}

function wordMasterWins () {
	if (localPlayer === clueGiver) {
		$('header #game-status').text('Failed contact!');
	}
	else if (localPlayer === wordMaster) {
		$('header #game-status').text('Too Easy! You successfully denied a contact attempt!');
	}
	else if (localPlayer !== clueGiver && localPlayer !== wordMaster) {
		$('header #game-status').text('Fail! The word was [' + clueGiver.word +'].');
	}
}


function gameOver () {
	if (localPlayer === clueGiver) {
		$('header #game-status').text('The master word ['+ wordMaster.word + '] was revealed! You are now the new Word Master.');
	}
	else if (localPlayer === wordMaster) {
		$('header #game-status').text('Game over. Your master word was revealed!');
	}
	else if (localPlayer !== clueGiver && localPlayer !== wordMaster) {
		$('header #game-status').text('The master word ['+ wordMaster.word + '] was revealed!');
	}
}

////////////////////////  Event Listeners  ///////////////////////

window.onload = function() {

	var gameArea = $('#game-area');
	var width = gameArea.width();
	var height = gameArea.height();

	var players = [
		// Wordmaster
		{name: 'Bob', x: width/2, y: height/2, fixed:true},
		{name: 'Eithan'},
		{name: 'Jenny'},
		{name: 'Ralph'},
		{name: 'Ferb'},
		{name: 'Mary'},
		{name: 'Jake'},
		{name: 'Tarzan'},
		{name: 'Trayvon'}
	];

	var contacts = [
		{source: players[3], target: players[6]},
		{source: players[3], target: players[2]}
	]

	var force = d3.layout.force()
		.size([width,height])
		.nodes(players)
		.links(contacts)
		.linkStrength(0)
		.theta(0.3)
		.charge(function(d){ 
			return d.fixed? -2000 : -1000 })
		.gravity(0.15)

	var svg = d3.select(gameArea[0]).append('svg')
		.attr('width', width)
		.attr('height', height)

	var nodes = svg.selectAll('.player')
		.data(force.nodes()).enter()
		.append('circle')
			.attr('class', 'player')
			.attr('r', 15)
			.style('fill', 'gray')

	var links = svg.selectAll('.contact')
		.data(force.links()).enter()
		.insert('line', '.player')
			.style('stroke', 'blue')
			.style('stroke-width', '3')

	console.log(contacts);

	force.on('tick', function(){
		links
			.attr("x1", function(d) { return d.source.x; })
	    	.attr("y1", function(d) { return d.source.y; })
	    	.attr("x2", function(d) { return d.target.x; })
	    	.attr("y2", function(d) { return d.target.y; })

	  	nodes
	  		.attr("cx", function(d) { return d.x; })
	      	.attr("cy", function(d) { return d.y; })
	});

	force.start();


	// // TODO: make sure all emitions are being captured
	// // 		 even though we don't listen until now
	// socket.on('joined', function(playerData){
	// 	renderPlayer(new Player(playerData));
	// });

	// socket.on('left', function(name){
	// 	console.log(name + ' left');
	// 	removePlayer(name);
	// });

	// socket.on('pause', function(reason){
	// 	if (localPlayer) {
	// 		console.log('paused');
	// 		appendModal(reason);
	// 	}
	// });

	// socket.on('resume', function(){
	// 	if (localPlayer) {
	// 		console.log('resumed');
	// 		removeModal();
	// 	}
	// });

	// // Game Loop (runs if name has been chosen)
	// // TODO: make unnamed players be able to spectate. Low pri.
	// socket.on('newGame', function(master){
	// 	console.log(master + ' is the new master');
	// 	setMaster(activePlayers[master]);
	// 	if (localPlayer) chooseMasterWord();
	// 	wordMaster.el.find('.name').append(' [WordMaster]');
	// });

	// socket.on('masterWordChosen', function(word){
	// 	console.log('the master word is ' + word);
	// 	wordMaster.word = word;
	// 	revealLetter();
	// });

	// socket.on('newRound', function(giver){
	// 	$('.clue-box').text('');
	// 	console.log(giver + ' is the new giver');

	// 	for (player in activePlayers)
	// 		activePlayers[player].guess = null;

	// 	setGiver(activePlayers[giver]);
	// 	if (localPlayer) chooseGiverWord();
	// 	if (clueGiver) {
	// 		clueGiver.el.find('.name').append(' [Clue Giver]');
	// 	};
	// 	chooseGiverWord();
	// });

	// socket.on('giverWordChosen', function(word){
	// 	console.log('the giver word is ' + word);
	// 	clueGiver.word = word;
	// 	greyInput('Waiting for a clue');
	// });

	// socket.on('clue', function(clue){
	// 	if (addClue(clue) === 1) guessWord();
	// });

	// socket.on('guess', function(player){
	// 	console.log(player.name +' has guessed '+ player.guess);
	// 	activePlayers[player.name].guess = player.guess;
	// 	// update the DOM to show that the player has guessed
	// 	activePlayers[player.name].el.find('.guess').text('Guess Submitted!');

	// 	//append wordMaster guess
	// 	if (player.name === wordMaster.name) {
	// 		wordMaster.el.find('.response').append('...' + player.guess);
	// 	};
	// });

	// socket.on('roundOver', function(success){
	// 	console.log('round over, wordMaster '+ (success? 'lost':'won'));
	// 	if (success) {
	// 		playersWin();
	// 		setTimeout(revealLetter(), 4000);
	// 	}	else{
	// 			wordMasterWins();
	// 	}
	// });

	// socket.on('gameOver', function(){
	// 	console.log('game over');
	// 	gameOver();
	// 	// TODO: reset any variables as are necessary
	// });

	// chooseName();
};

