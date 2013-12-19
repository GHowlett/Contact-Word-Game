window.onload = function() {
	bindNetworkEvents();
	
	chooseName();
	
	newGame();

	chooseWord();
	
	//on click of contact, run guess function
	//TODO: add button to DOM w/ class '.contact'
	$('.contact').click(function (){
		guess(); });

	// if (// number of required players are met && ALL player.guess matches clueGiver.secret)	{
	// 	challenge ();
	// }	else  failContact();

}