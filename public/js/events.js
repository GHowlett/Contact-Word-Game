
////////////////////////  Event Listeners  ///////////////////////
var socket = io.connect('http://localhost');

function bindNetworkEvents() {
	socket.on('joined', function(playerData){
		renderPlayer(addPlayer(new Player(playerData)));
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

	socket.on('newGame', function(master){
		console.log(master + ' is the new master');
		setMaster(activePlayers[master]);
		if (localPlayer === wordMaster) chooseMasterWord();
	});

	socket.on('masterWordChosen', function(word){
		console.log('the master word is ' + word);
		wordMaster.word = word;
		revealLetter();
		chooseWord();
	});

	socket.on('clue', function(player) {	
		console.log(player.name + "'s clue is " + player.clue);
		
		activePlayers[player.name].el.find('.clue').html(player.clue);

		var button = (localPlayer !== wordMaster)
			? showButton(player.name, 'Contact')
			: showButton(player.name, 'Break');
		button.click(function(){ 
			guess(activePlayers[player.name]); 
		});
	});

	socket.on('guess', function(guess){
		if (guess.word === activePlayers[guess.to].word) {

		}
	}); 

	socket.on('contact', function(contact){
		console.log(contact.name + "'s contact was " +
			(contact.success? 'successful':'broken'));

		// TODO: end challenge if in challenge mode

		if (contact.success) revealLetter();
		else {
			// TOOD: render failure
			cleanup(contact.name);
		}

		//todo: append some notification that contact was successful 
	})

	function endChallenge(success) {
		$(".users").find('.name').fadeIn( "slow", "linear" );
	}

	// TODO: move this to an appropriate place
	// resets properties / DOM elements after contact 
	function cleanup(name) {
		var player = activePlayers[name];

		player.el.find('.clue').text('');
		hideButton(name);

		player.guesses = [];
		player.clue = "";
		player.word = "";
	}

	socket.on('challenge', function(name){
		//todo: add .challengeGroup class to related players
		console.log('wordmaster challenged!')
		//toggle opacity of players for those that are involved in contact
		$(".challengeGroup").find('.name').fadeOut( "slow", "linear" );
		//todo: remove player clues from DOM except cluegiver

		//todo: append 15 second countdown to DOM

		//reveal word to everyone except WM
		activePlayers[player.name].el.find('.clue').html('player.clue')
		hideButton(player.name, 'break');
	})

	socket.on('gameOver', function(){
		console.log('game over');
	});

};