var clientID = undefined;
var userCount = undefined;
var socket = undefined;

var connectSocket = function () {
	socket = io.connect('/');

	socket.on('connected', function (data) {
		userCount = data.numUsers;
		console.log('No. users connected to the server --> ' + userCount);
		console.log('Connected to server.');
	});

	socket.on('gameJoined', function (data) {
		console.log('Game room joined --> ' + data.room);
		console.log('Number of players in the room --> ' + data.numPlayers);
		
		
		playButton.remove();
		helpButton.remove();
		playersText.setText('Players: ' + data.numPlayers);
		activeLayer.draw();
	});

	socket.on('playerJoined', function (data) {
		console.log('A player joined the game, number of players now --> ' + data.numPlayers);
		
		playersText.setText('Players: ' + data.numPlayers);
		activeLayer.draw();
	});

	socket.on('playerQuit', function (data) {
		console.log('A user quit the game, players remaining --> ' + data.numPlayers);
		
		playersText.setText('Players: ' + data.numPlayers);
		activeLayer.draw();
	});

	socket.on('overCapacity', function () {
		alert('The server is currently at max capacity, please try again soon!');
		console.log('Connection Refused --> At maximum capacity! : (');
	});
	
	socket.on('evaluatedExpr', function (data) {
		if (data.evaluated === 24) {
			showEvaluatedText('24', 'green');
		} else showEvaluatedText(data.evaluated.toString(), '#dd0000');
	});
	
	socket.on('timer', function (data) {
		timerText.setText('Timer: ' + data.time);
		activeLayer.draw();
	});
	
	var waiting = false;
	
	socket.on('gameCard', function (data) {
		var card = data.card;
	
		if (waiting) stopMainMessage(function () {
			waiting = false;
			initialSetup(card);
		});
		else initialSetup(card);
	});
	
	function initialSetup(card) {
		animateCardText(card);
		$('#evalInput').prop('disabled', false);
		$('#submitButton').removeClass('disabled');
		playersText.setVisible(true);
		timerText.setVisible(true);
	}
	
	socket.on('newCard', function (data) {
		resetCardText();
		animateCardText(data.card);
	});
	
	socket.on('waiting', function () {
		waiting = true;
		showMainMessage('Waiting for opponents');
	});
	
	socket.on('youLose', function (data) {
		console.log('You lose, correct expression was --> ' + data.expression);
		resetCardText();
		showEvaluatedText(data.expression, '#dd0000');
		showMainMessage('Sorry, you lose!');
		setTimeout(function () { stopMainMessage(); }, 5000);
	});
	
	socket.on('youWin', function () {
		console.log('You win!');
		resetCardText();
		showMainMessage('You win!');
		setTimeout(function () { stopMainMessage(); }, 5000);
	});
}