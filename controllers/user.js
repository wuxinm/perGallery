var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.getCurrentUser = function (req, res) {
	User.checkUser(req.user.username, function (err, user) {
		if (err) {
			res.json(err);
		}
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

exports.getFriendInfo = function (req, res) {
	var friendname = req.query.friendname;
	User.getFriendInfo(friendname, function (err, friend) {
		if (err) {
			res.json(err);
		}
		// console.log(friend);
		res.send(friend);
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