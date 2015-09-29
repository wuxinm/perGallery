var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * notification from user to friend
 */
var NotificationSchema = new Schema({
	category: { type: String, default: '' },
	message: { type: String, default: '' },
	date: { type: String, default: '' },
	user: { type: String, default: '' },
	friend: { type: String, default: '' },
	readed: { type: Boolean, default: false }
});

NotificationSchema.statics.createNotification = function (data, callback) {
	var newNotification = new this();
	newNotification.category = data.category;
	newNotification.message = data.message;
	newNotification.date = data.date;
	newNotification.user = data.user;
	newNotification.friend = data.friend;
	newNotification.save();
	return newNotification;
}

/**
 * get LoggedIn user notifications
 */
NotificationSchema.statics.getUserNotification = function(user, callback) {
	this.find({ friend: user }, callback);
}

/**
 * set this notification as readed
 */
NotificationSchema.statics.readNotification = function(friend, user, callback) {
	this.update({$or: [{user: friend, friend: user }, { user: user, friend: friend }]}, { $set: { readed: true }}, { multi: true }, callback);
}

mongoose.model('Notification', NotificationSchema);