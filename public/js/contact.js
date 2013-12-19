function guess (player) {
	//redisplaying chosen player's clue in local player's input placeholder
	getInput(player.name + "says: " + player.clue) 
	.then(function(){
		//emitting guess 
		socket.emit('guess', guess);
		//TODO: change submit button to say 'contact!'

		//storing local player's guess
		localPlayer.guess = guess;
		//if wordMaster's guess doesn't equal to secret word, let him guess again
		if (wordMaster.guess !== player.word && localPlayer === wordMaster) guess();
		//for all other players 
		if (localPlayer !== wordMaster) {
			//disable input and redisplay local player's guess
			greyInput('You think ' + player.name "'s word is: " + guess) 
			//TODO: create "nevermind button 

			//clicking on 'nevermind' button 
			$(".nevermind").click(function (){
				//delete current guess
				delete localPlayer.guess
				//allow players to guess again
				guess();
			})
		}
	}	
}

function contactBroken (player) {
	//TODO: fix
	if ('all contacts !== player.word') {
		delete player.word
		delete player.clue
		//todo: add big red X
		//todo: remove player connections (D3)
}

function challenge (player) {
	//emit challenge event
	socket.emit('challenge', challenge);
	if (localPlayer !== wordmaster) greyInput('Word Master challenge!');
	//if wordmaster can't guess word after 15 seconds, emit contact success event
	if (wordMaster.guess !== player.word) && ('15 seconds have passed') {
		socket.emit('contact', contact)
	}	else loseChallenge();	 
}

function loseChallenge () {
	socket.emit('loseChallenge', loseChallenge);
	contactBroken();
	//TODO: reset D3 zoom and opacity
	//TODO: enable input for everyone else
}

