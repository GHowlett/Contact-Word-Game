
//////////////////////  DOM Manipluation  ///////////////////////

// creates, renders, and adds player to active players array.
function renderPlayer (player) {
	player.el.html(
		'<td class="name">' + player.name + '</td>' +
		'<td class="response">' + '' + '</td>');
}

function removePlayer (name) {
	activePlayers[name].el.remove();
	delete activePlayers[name];
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
