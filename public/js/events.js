
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
		//setting word master
		setMaster(activePlayers[master]);
		//if player is the word master, choose master word
		if (localPlayer === wordMaster) chooseMasterWord();
	});

	socket.on('masterWordChosen', function(word){
		console.log('the master word is ' + word);
		//storing masterword
		wordMaster.word = word;
		//when master word is chosen, reveal the first letter
		revealLetter();
	});

	//listening for clue
	socket.on('clue', function(player) {	
		console.log(player.name + "'s clue is " + player.clue);
		//TODO: display clue to everyone
	});

	socket.on('guess', function(player){
		//TODO: create D3 node connection from local player to target player 
	}); 

	socket.on('challenge', function(){
		console.log('wordmaster challenged!')
		//todo: toggle opacity of player names
		//todo: append 15 second countdown to DOM
		//todo: reveal word to everyone except WM
	})

	socket.on('contact', function(success){
		console.log('Challenge over, wordMaster '+ (success? 'lost':'won'));
		//on a successful contact from challenge mode, reveal next letter
		setTimeout(revealLetter(), 4000);
		//todo: append some notification that contact was successful 
	})

	socket.on('loseChallenge', function(){
		console.log 
		//todo: append some notification that contact was successful 
	});

	socket.on('gameOver', function(){
		console.log('game over');
	});

};