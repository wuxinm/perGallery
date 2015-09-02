var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
var UserSchema = new Schema({
	name: { type: String, default: '' },
	displayName: { type: String, default: '' },
	location: { type: String, default: '' },
	description: { type: String, default: '' },
	profilePhotoUrl: { type: String, default: '' },
	likes: { type: Number, min: 0 },
	images: { type: Number, min: 0 },
	friends: { type: Array, default: [] }
});

// create new user
UserSchema.statics.createUser = function (profile, callback) {
	var newUser = new this();
	newUser.name = profile._json.screen_name;
	newUser.displayName = profile._json.name;
	newUser.location = profile._json.location;
	newUser.description = profile._json.description;
	newUser.profilePhotoUrl = profile.photos[0].value;
	newUser.likes = 0;
	newUser.images = 0;
	newUser.save();
	return newUser;
}

// find specific user
UserSchema.statics.checkUser = function (loginName, callback) {
	this.findOne({ name: loginName }, callback);
}

// serach user by input character
UserSchema.statics.searchUser = function (char, callback) {
	this.find({ name: new RegExp(char) }, 'name profilePhotoUrl', callback);
}

// add friend
UserSchema.statics.addFriend = function (loginName, friend, callback) {
	this.update({ name: loginName }, { $push: { friends: friend } }, callback);
}

// get friends

mongoose.model('User', UserSchema);