
//////////////////////  DOM Manipluation  ///////////////////////

function renderPlayer (name) {
	var player = activePlayers[name];
	player.el.html(
		'<td class="name">' + player.name + '</td>' +
		'<td class="clue">' + player.clue + '</td>' );
}

function addPlayer (player) {
	// non-enumeriability prevents serialization
	Object.defineProperty(player, 'el', {
		value: $('<tr/>').appendTo('tbody'), 
		writable: true,
		enumerable: false
	});

	// TODO: move this out of the rendering logic
	return activePlayers[player.name] = player;
}

function removePlayer (name) {
	activePlayers[name].el.remove();
	// TODO: move this out of the rendering logic
	delete activePlayers[name];
}

function revealLetter () {
	$('.master-word-box').append(
		// TODO: move this out of the rendering logic
		wordMaster.word[++masterWordIndex] );
}

function appendModal(text) {
	$('body').append("<div class='modal'><div class='modal-inner'><p>" + text + "</p><div class='spinner'></div></div></div>");
}

function removeModal() {
	$('.modal').remove();
}

// greys out the input box with a placeholder msg
function greyInput (placeholder) {
	$("#input")
		.val('')
		.prop('disabled', true)
		.prop('placeholder', placeholder);
}

// returns a promise that binds function contexts to #input
function getInput (placeholder, validate) {
	var deferred = new $.Deferred();
	var input = $("#input")
		.val('')
		.prop('disabled', false)
		.attr('placeholder', placeholder);

	// clear out old handlers
	$('#gameForm').off('submit');
	$('#gameForm').submit(function(e) {
	 	e.preventDefault();
		(!validate || validate(input.val()))
	 		? deferred.resolveWith(input, [input.val()])
	 		: deferred.rejectWith(input, [input.val()]);
 	});

 	// clear/change status header
 	$('header .game-status').text('').text(placeholder);
	return deferred.promise()
}


function addContactButton (){
	//.action refers to 'action space' in DOM. where the contact button will live
	$('#'+player.name).children[2].append('<tr>#contactButton<tr>');
	$contactButton = $('<button></button>')
		.text('Contact! [' + player.contactCount + ']')
		.click(guess(player));
}

function addBreakButton(){
	$('#'+player.name).children[2].append('<tr>#contactButton<tr>');
	$breakButton = $('<button></button>')
		.text('Break! [' + player.contactCount + ']')
		.click(guess(player));
}
