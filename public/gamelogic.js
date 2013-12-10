window.onload = function() {
	var socket = io.connect('http://localhost');
	socket.on('joined', addPlayer);

	// TODO: check if name already taken on the client side
	$('#name-input').focus().on('keydown', chooseName);

	// TODO: implement this
	function addPlayer (name) {
		console.log(name);
	}

	function chooseName (e) {
		if (e.which === 13) {
			socket.emit('named', this.value);
	}}
}