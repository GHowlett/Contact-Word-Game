window.onload = function() {
	bindNetworkEvents();
	
	chooseName();
	
	newGame();

	chooseWord();
	
	//TODO: add player node reference
	//on click of a player node, run guess function
	$(insert D3 player node).click(function (){
		guess(); });

	if (// number of required players are met && ALL player.guess matches clueGiver.secret)	{
		challenge ();
	}	else  failContact();


}