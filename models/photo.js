var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Getters
 */

var getTags = function (tags) {
  return tags.join(',')
}

/**
 * Setters
 */

var setTags = function (tags) {
  return tags.split(',')
}

var PhotoSchema = new Schema({
	name: { type: String, default: ''},
	username: { type: String, default: '' },
	originalname: { type: String, default: '' },
	path: { type: String, default: '' },
	thumbpath: {
		lowThumb: { type: String, default: ''},
		mediumThumb: { type: String, default: ''}
	},
	favourite: { type: Boolean, default: false },
	commentImgs: { type: Array, default: [] },
	tags: { type: [], get: getTags, set: setTags },
	uploadAt: { type: Date, default: '' }
});

// create new photo
PhotoSchema.statics.createPhoto = function (img, user, callback){
	var newPhoto = new this();
	newPhoto.name = img.name;
	newPhoto.username = user.username;
	newPhoto.originalname = img.originalname;
	newPhoto.path = img.path.substring(7, img.path.length);
	newPhoto.thumbpath.lowThumb = img.path.substring(7, 14) + '/lowThumbnails/' + img.name;
	newPhoto.thumbpath.mediumThumb = img.path.substring(7, 14) + '/mediumThumbnails/' + img.name;
	newPhoto.uploadAt = Date.now();
	newPhoto.save();
	return newPhoto;
};

// pick random 3 photos to initialize slider
PhotoSchema.statics.createSlider = function (username, callback) {
	this.count(function (err, count) {
		if (err) return callback(err);
		var rand = Math.floor(Math.random() * count);
		this.find({ username : username }).limit(3).skip(rand).exec(callback);
	}.bind(this));
};

// pick a random document from photos collection
PhotoSchema.statics.randomPhoto = function (username, callback) {
	this.count(function (err, count) {
		if (err) return callback(err);
		var rand = Math.floor(Math.random() * count);
		
		this.findOne({ username : username }).skip(rand).exec(callback);
	}.bind(this));
};

// select one photo from photos collection
PhotoSchema.statics.getPhoto = function (id, callback) {
	this.find({ _id: id }, callback);
}

// select all the photos from photos collection
PhotoSchema.statics.getAllPhotos = function (callback) {
	this.find({}, callback);
}

// select friend's photo to his page
PhotoSchema.statics.getFriendPhotos =function (friendname, callback) {
	this.find({ username: friendname }, callback);
}

// select some photos from photos collection
PhotoSchema.statics.dynamicPhotos = function (skip, username, callback) {
	this.find({ username: username }).limit(30).skip(skip).exec(callback);
}

PhotoSchema.statics.addToFavourite = function (photoName, callback) {
	this.update({ name: photoName }, { $set: { favourite: true } }, callback);
}

PhotoSchema.statics.showFavourites = function (username, callback) {
	this.find({ username: username, favourite: true }, callback);
}

PhotoSchema.statics.removePhoto = function (photoName, callback) {
	this.remove({ name: photoName }, callback);
}

// add img comment to corresponding img
PhotoSchema.statics.addImgComment = function (id, img, callback) {
	this.update({ _id: id }, { $push: { commentImgs: img } }, callback);
} 

mongoose.model('Photo', PhotoSchema);