var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * message from user to friend 
 */
var MessageSchema = new Schema({
	message: { type: String, default: '' },
	date: { type: String, default: '' },
	user: { type: String, default: '' },
	friend: { type: String, default: '' }
});

/**
 * create new message
 */
MessageSchema.statics.createMessage = function (data, callback) {
	 var newMessage = new this();
	 newMessage.message = data.message;
	 newMessage.date = data.date;
	 newMessage.user = data.user;
	 newMessage.friend = data.friend;
	 newMessage.save();
	 return newMessage;
 }
 
 /**
  * get friend's message records
  */
 MessageSchema.statics.getFriendMessages = function (user, friend, callback) {
	 this.find({$or: [{user: user, friend: friend }, {user: friend, friend: user}]}, callback);
 }
 
 /**
  * clear friend's message records
  */
MessageSchema.statics.removeFriendMessages = function (user, friend, callback) {
	 this.remove({ user: user, friend: friend }, callback);
}
 
mongoose.model('Message', MessageSchema);