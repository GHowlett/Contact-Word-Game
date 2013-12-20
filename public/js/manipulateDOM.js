
//////////////////////  DOM Manipluation  ///////////////////////

function renderPlayer (player) {
	player.el.html(
		'<td class="name">' + player.name + '</td>' +
		'<td class="clue">' + player.clue + '</td>' +
		'<td><button class="hidden">' +
			'<span class="action">Contact</span> ' +
			'(<span class="count">0</span>)' +
		'</button></td>' );
}

function addPlayer (player) {
	// non-enumeriability prevents serialization
	Object.defineProperty(player, 'el', {
		value: $('<tr/>').appendTo('tbody'), 
		writable: true,
		enumerable: false
	});

	// TODO: move this out of the rendering logic
	activePlayers[player.name] = player;
	return player;
}

function toggleHighlights(name) {
	activePlayers[name].el.find('.clue').addClass("highlighted");
	$('.word-master-guess-box').addClass('highlighted');
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

	deferred.fail(function(){ this.addClass('error'); });
	deferred.done(function(){ this.removeClass('error'); });

	return deferred.promise()
}

// shows a player's button given a guessCount, action, or both
// eg. usages:  - showButton('bobby', 'Break')	
//				- showButton('bobby', 5)
//				- showButton('bobby', 'Contact', 7)
function showButton(name, p1, p2) {
	var action = (typeof p1 === 'string')? p1:p2;
	var guessCount = (typeof p1 === 'number')? p1:p2;
	var button = activePlayers[name].el.find('button')
		.removeClass('hidden')

	if (action) button.find('.action').text(action);
	if (guessCount) button.find('.count').text(guessCount);
	
	return button;
}

function hideButton(name){
	return activePlayers[name].el.find('button').addClass('hidden');
}
