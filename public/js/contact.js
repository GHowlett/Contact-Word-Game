function playerGuess () {
	if (localPlayer !== wordMaster) {
		getInput('What is ' + clueGiver.name + "'s word?")
		.then(function(guess){
			socket.emit('guess', guess);
			localPlayer.guess = guess;
			localPlayer.el.find('.response').text(guess);
		});
	}
}

function wordMasterGuess () {
	if (localPlayer === wordMaster) {
		getInput("")
		.then(function(guess){
			socket.emit('guess', guess);
			localPlayer.guess = guess;
			// replacing w/ D3 code
			// localPlayer.el.find('.response').append('...' + guess);
			if (wordMaster.guess !== clueGiver.secret) {
				wordMasterGuess();
			}
		});
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
	if (wordMaster.guess === clueGiver.secret) || (//ALL player.guess does not match clueGiver.secret) {
 
	//todo: add big red X
	//todo: remove player connections (D3)
	//todo: reset if wordMaster.guess matches clueGiver.secret
}

function challenge () {
	socket.emit('challenge', challenge);
	//todo: toggle opacity (d3)
	//todo: append 15 second countdown to DOM
	//todo: reveal word to everyone except WM
	if (wordMaster.guess !== clueGiver.secret) && (//15 seconds have passed) {
		revealLetter();
		//todo: append some congrats text  
	}	else failContact();	 
}