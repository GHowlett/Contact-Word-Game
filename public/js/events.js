
////////////////////////  Event Listeners  ///////////////////////

function bindNetworkEvents() {
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

	socket.on('newGame', function(master){
		console.log(master + ' is the new master');
		setMaster(activePlayers[master]);
		if (localPlayer) chooseMasterWord();
	});

	socket.on('masterWordChosen', function(word){
		console.log('the master word is ' + word);
		wordMaster.word = word;
		revealLetter();
	});

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
	

	socket.on('clue', function(giver) {	
		console.log(giver.name + "'s clue is " + giver.clue);
	});

	socket.on('guess', function(player){
		
		//todo: replace this code to work with D3 
		};
	});

	socket.on('challenge', function(){
		console.log('wordmaster challenged!')
		challenge();
		//on failure
		failContact();
	})

	socket.on('contact', function(success){
		console.log('Challenge over, wordMaster '+ (success? 'lost':'won'));
		//success
		playersWin();
		setTimeout(revealLetter(), 4000);
		//only in challenge mode
	})

	socket.on('contactBroken', function(){
		//can happen in and out of challenge mode
		//must check whether in challenge mode

	if (wordMaster.guess === player.secret) || (//ALL player.guess does not match clueGiver.secret) {
		failContact()
	})
	});

	socket.on('gameOver', function(){
		console.log('game over');
		gameOver();
	});

};