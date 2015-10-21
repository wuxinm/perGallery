var mongoose = require('mongoose');
var Notification = mongoose.model('Notification');

exports.addNewNotif = function(data) {
	Notification.createNotification(data, function (err, notif) {
		console.log('added new notification~~~');
	});
}

exports.checkNotifExisted = function (data, cb) {
	Notification.checkNotificationExisted(data, function (err, notif) {
		if (err) {
			console.log(err)
		}
		cb(notif);
	});
}

exports.addCount = function (data) {
	Notification.addCountOfExistedUnreadNotif(data, function (err, notif) {
		if (err) {
			console.log(err);
		}
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
	var notif_id = null;
	var from_user = null;
	var to_user = null;
	// set specific notif as readed
	if (req.body.to_user === undefined) {
		notif_id = req.body.id;
		setNotifRead(notif_id, from_user, to_user, res);
	}
	else {
		// if open chat dialog direactly, set corresponding chat notif as readed
		from_user = req.body.from_user;
		to_user = req.body.to_user;
		setNotifRead(notif_id, from_user, to_user, res);
	}
}

function setNotifRead(notif_id, from_user, to_user, res) {
		Notification.readNotification(notif_id, from_user, to_user, function (err, notif) {
			if (err) {
				res.json(err);
			}
			console.log('done');
			res.send('read this notification~~');
		});
}