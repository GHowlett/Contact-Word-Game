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

function successContact () {
	if (// number of required players are met && ALL player.guess matches clueGiver.secret)	{
		challenge ();
	}	else	{
		failContact();
	}
}

function failContact () {
	//todo: add big red X
	//todo: remove player connections (D3)
	//todo: reset if wordMaster.guess matches clueGiver.secret
}

function challenge () {
	socket.emit('challenge', challenge);
	//todo: toggle opacity (d3)
	//todo: append 15 second countdown to DOM
	//todo: reveal word to everyone except WM
	if (wordMaster.guess !== player.word) && (//15 seconds have passed) {
		revealLetter();
		//todo: append some congrats text  
	}	else failContact();	 
}