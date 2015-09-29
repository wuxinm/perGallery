var mongoose = require('mongoose');
var Notification = mongoose.model('Notification');

exports.addNewNotif = function(data) {
	Notification.createNotification(data, function (err, data) {
		console.log('added new notification~~~');
	});
}

exports.getUserNotif = function (req, res) {
	var user = req.user.username;
	Notification.getUserNotification(user, function (err, notif) {
		if (err) {
			res.json(err);
		}
		res.json(notif);
	});
}

exports.setNotifAsReaded = function (req, res) {
	// var id = req.body.id;
	var friend = req.body.friend;
	console.log(friend);
	var user = req.body.user;
	console.log(user);
	Notification.readNotification(friend, user, function (err, notif) {
		if (err) {
			res.json(err);
		}
		res.send('read this notification~~');
	});
}