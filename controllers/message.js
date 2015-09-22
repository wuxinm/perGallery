var mongoose = require('mongoose');
var Message = mongoose.model('Message');

/**
 * create new message
 */
exports.addNewMessage = function (data) {
	// var data = req.body;
	Message.createMessage(data, function (err, data) {
		console.log('add new message~~~~~~!');
	});
}

/**
 * get messages record
 */
exports.getMessages = function (req, res) {
	var user  = req.user.username;
	var friend = req.params.friendname;
	Message.getFriendMessages(user, friend, function (err, messages) {
		if (err) {
			res.json(err);
		}
		res.json(messages);
	});
}