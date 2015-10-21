var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EditedImgSchema = new Schema({
	name: { type: String, default: '' },
	from_user: { type: String, default: '' },
	to_user: { type: String, default: '' },
	path: { type: String, default: '' },
	like_user: { type: Array, default: [] },
	uploadAt: { type: Date, default: '' },
	comments: { type: Array, default: [] }
});

// create new editedImg
EditedImgSchema.statics.createEditedImg = function (name, from_user, to_user, path, callback) {
	var newEditedImg = new this();
	newEditedImg.name = name;
	newEditedImg.from_user = from_user;
	newEditedImg.to_user = to_user;
	newEditedImg.path = path;
	newEditedImg.uploadAt = Date.now();
	newEditedImg.save(callback);
	// return newEditedImg;
}

// select edited Img by ID
EditedImgSchema.statics.getEditedImg = function (id, callback) {
	this.find({ _id: id }, callback);
}

// select all edited Img by corresponding user
EditedImgSchema.statics.getSentImgComments = function (username, callback) {
	this.find({ from_user: username }).sort({ uploadAt: -1 }).exec(callback);
}

// select all edited Img by friend
EditedImgSchema.statics.getReceivedImgComments = function (username, callback) {
	this.find({ to_user: username }, callback);
}

// add text comment to Img comment by id
EditedImgSchema.statics.addComment = function (img_comm_id, comm_content, callback) {
	this.update({ _id: img_comm_id }, { $push: { comments: comm_content }}, callback);
}

// check whether loggin user already liked this image
EditedImgSchema.statics.checkLikeUser = function (id, user, callback) {
	this.find({ _id: id, like_user: {$in: [user]}}, callback);
}


// add liked user
EditedImgSchema.statics.addLikeUser = function (id, user, callback) {
	this.update({ _id: id }, { $push: { like_user: user }}, callback);
}

mongoose.model('EditedImg', EditedImgSchema);