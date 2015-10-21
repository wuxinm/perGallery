var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * message from user to friend 
 */
var MessageSchema = new Schema({
	message: { type: String, default: '' },
	date: { type: String, default: '' },
	from_user: { type: String, default: '' },
	to_user: { type: String, default: '' },
	imgMsg_path: { type: String, default: '' }
});

/**
 * create new chat message
 */
MessageSchema.statics.createChatMessage = function (data, callback) {
	 var newMessage = new this();
	 newMessage.message = data.message;
	 newMessage.date = data.date;
	 newMessage.from_user = data.from_user;
	 newMessage.to_user = data.to_user;
	 newMessage.save();
	 return newMessage;
}

/**
 * create new img message
 */
MessageSchema.statics.createImgMessage = function (data, callback) {
	 var newMessage = new this();
	 newMessage.imgMsg_path = data.img_path;
	 newMessage.date = data.date;
	 newMessage.from_user = data.from_user;
	 newMessage.to_user = data.to_user;
	 newMessage.save();
	 return newMessage;
}

/**
	* get friend's message records
	*/
MessageSchema.statics.getChatMessages = function (from_user, to_user, callback) {
	this.find({$or: [{from_user: from_user, to_user: to_user }, {from_user: to_user, to_user: from_user}]}, callback);
}
 
/**
	* clear friend's message records
	*/
MessageSchema.statics.removeFriendMessages = function (user, friend, callback) {
	 this.remove({ user: user, friend: friend }, callback);
}
 
mongoose.model('Message', MessageSchema);