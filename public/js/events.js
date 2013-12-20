
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
		//setting word master
		setMaster(activePlayers[master]);
		//if player is the word master, choose master word
		if (localPlayer === wordMaster) chooseMasterWord();
	});

	socket.on('masterWordChosen', function(word){
		console.log('the master word is ' + word);
		wordMaster.word = word;
		//when master word is chosen, reveal the first letter
		revealLetter();
		chooseWord();
	});

	//listening for clue
	socket.on('clue', function(player) {	
		console.log(player.name + "'s clue is " + player.clue);
		activePlayers[player.name].el.find('.clue')
			.html(player.clue)
			.add(player.guesses.length)
		if (localPlayer !== wordMaster) showButton('contact', player.name);
		if (localPlayer === wordMaster) showButton('break', wordMaster.name);
	});

	socket.on('guess', function(player){
		if (localplayer.guess === player.word) {
			greyInput("Nice! " + localPlayer.guess)
			$('#'+localPlayer.name).addClass('challengeGroup')
		}
	}); 

	socket.on('challenge', function(player){
		console.log('wordmaster challenged!')
		//toggle opacity of players for those that are involved in contact
		$(".challengeGroup").find('.name').fadeOut( "slow", "linear" );
		//todo: remove player clues from DOM except cluegiver

		//todo: append 15 second countdown to DOM

		//reveal word to everyone except WM
		activePlayers[player.name].el.find('.clue').html('player.clue')
		hideButton('break', wordMaster.name);
	})

	socket.on('contact', function(success){
		console.log('Challenge over, wordMaster '+ (success? 'lost':'won'));
		setTimeout(revealLetter(), 4000);
		//todo: show button for everyone 
		//todo: append some notification that contact was successful 
	})

	socket.on('loseChallenge', function(){
		console.log 
		//todo: append some notification that contact was successful 
		$(".users").find('.name').fadeIn( "slow", "linear" );

	});

	socket.on('gameOver', function(){
		console.log('game over');
	});

};