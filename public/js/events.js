
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
			//what do i want to do when guess event is emitted? 
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
		console.log('Challenge over, wordMaster '+ (success? 'lost':'won'));
		if (success) {
			playersWin();
			setTimeout(revealLetter(), 4000);
		}	else{
				
		}
	});

	socket.on('gameOver', function(){
		console.log('game over');
		gameOver();
	});

	chooseName();
	};