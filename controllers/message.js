var mongoose = require('mongoose');
var Message = mongoose.model('Message');

/**
 * create new chat message
 */
exports.addNewMessage = function (data) {
	// var data = req.body;
	Message.createChatMessage(data, function (err, data) {
		console.log('add new message~~~~~~!');
	});
}

/**
 * create new image message
 */
exports.addNewImgMessage = function (data) {
	Message.createImgMessage(data, function (err, data) {
		console.log('add img msg');
	});
}

/**
 * get messages record
 */
exports.getChatMsg = function (req, res) {
	var from_user = req.params.friendname;
	var to_user = req.user.username;
	Message.getChatMessages(from_user, to_user, function (err, messages) {
		if (err) {
			res.json(err);
		}
		res.json(messages);
	});
}