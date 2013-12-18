function guess (player) {
	getInput("What is " + player.name + "'s word?") 
	.then(function(){
		socket.emit('guess', guess);
		localPlayer.guess = guess;
		// replacing w/ D3 code
		//if wordMaster's guess doesn't equal to secret word, keep guessing
		if (wordMaster.guess !== player.word && localPlayer === wordMaster) guess();
		greyInput();
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