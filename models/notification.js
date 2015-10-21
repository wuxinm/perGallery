var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * notification from user to friend
 */
var NotificationSchema = new Schema({
	category: { type: String, default: '' },
	img_comm_id: { type: String, default: ''},
	count: { type: Number, default: 1 },
	date: { type: String, default: '' },
	from_user: { type: String, default: '' },
	to_user: { type: String, default: '' },
	readed: { type: Boolean, default: false }
});

NotificationSchema.statics.createNotification = function (notif, callback) {
	var newNotification = new this();
	if (notif.category === 'feedback_notif') {
		newNotification.category = notif.category;
		newNotification.img_comm_id = notif.img_comm_id;
		newNotification.date = notif.date;
		newNotification.from_user = notif.from_user;
		newNotification.to_user = notif.to_user;
		newNotification.save();
	} else if (notif.category === 'chatMsg_notif') {
		newNotification.category = notif.category;
		newNotification.date = notif.date;
		newNotification.from_user = notif.from_user;
		newNotification.to_user = notif.to_user;
		newNotification.save();
	}
	return newNotification;
}

/**
 * get LoggedIn user unreaded notifications
 */
NotificationSchema.statics.getUserNotification = function(user, callback) {
	this.find({ to_user: user, readed: false }, callback);
}

/**
 * check this notification whether existed already
 */
NotificationSchema.statics.checkNotificationExisted = function(notif, callback) {
	if (notif.category === 'feedback_notif') {
		this.find({ img_comm_id: notif.img_comm_id, from_user: notif.from_user, readed: false }, callback);
	} else if (notif.category === 'chatMsg_notif') {
		console.log(notif.from_user);
		this.find({ from_user: notif.from_user, category: 'chatMsg_notif', readed: false }, callback);
	}
}

/**
 * add new notif on existed notif 
 */
NotificationSchema.statics.addCountOfExistedUnreadNotif = function(notif, callback) {
	this.update({ _id: notif._id }, {$inc: { count: 1}}, callback);
}

/**
 * set this notification as readed
 */
NotificationSchema.statics.readNotification = function(notif_id, from_user, to_user, callback) {
	if (from_user === null) {
		this.update({ _id: notif_id }, { $set: {readed: true}}, callback);
	} else {
		this.update({ from_user: from_user, to_user: to_user, category: 'chatMsg_notif' }, 
		{ $set: { readed: true }}, { multi: true }, callback);
	}
}

mongoose.model('Notification', NotificationSchema);