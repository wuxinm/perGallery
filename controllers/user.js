var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.getCurrentUser = function (req, res) {
	User.checkUser(req.user.username, function (err, user) {
		if (err) {
			res.json(err);
		}
		// console.log(user);
		res.render('layout', { user: user });
	});
}

exports.searchUser = function (req, res) {
	var char = req.query.char;
	User.searchUser(char, function (err, users) {
		if (err) res.json(err);
		res.json(users);
	});
}

exports.addFriendtoDB = function (req, res) {
	var username = req.user.username;
	var friend = req.body;
	User.addFriend(username, friend, function (err, user) {
		if (err) {
			res.json(err);
		}
		res.send('add friend');
	});
}