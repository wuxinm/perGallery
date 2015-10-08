var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EditedImgSchema = new Schema({
	name: { type: String, default: '' },
	from_user: { type: String, default: '' },
	to_user: { type: String, default: '' },
	path: { type: String, default: '' },
	uploadAt: { type: Date, default: '' },
	comments: { type: Array, default: [] }
});

// create new editedImg
EditedImgSchema.statics.createEditedImg = function (name, user, friend, path, callback) {
	var newEditedImg = new this();
	newEditedImg.name = name;
	newEditedImg.from_user = user;
	newEditedImg.to_user = friend;
	newEditedImg.path = path;
	newEditedImg.uploadAt = Date.now();
	newEditedImg.save(callback);
	// return newEditedImg;
}

// select all edited Img by corresponding user
EditedImgSchema.statics.getSentImgComments = function (username, callback) {
	this.find({ from_user: username }, callback);
}

// slect all edited Img by friend
EditedImgSchema.statics.getReceivedImgComments = function (username, callback) {
	this.find({ to_user: username }, callback);
}

mongoose.model('EditedImg', EditedImgSchema);