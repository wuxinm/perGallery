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
	comments: { type: String },
	tags: { type: [], get: getTags, set: setTags },
	uploadAt: { type: Date, default: Date.now }
});


// pick a random document from photos collection
PhotoSchema.statics.randomPhoto = function (req, res, callback) {
	this.count(function (err, count) {
		if (err) return callback(err);
		var rand = Math.floor(Math.random() * count);
		this.findOne({ username : req.user.username }).skip(rand).exec(callback);
	}.bind(this));
};

// select all the photos from photos collection
PhotoSchema.statics.getPhotos = function (callback) {
	this.find({}, callback);
}

// select some photos from photos collection
PhotoSchema.statics.dynamicPhotos = function (id, callback) {
	this.find().limit(5).skip(id).exec(callback);
}




mongoose.model('Photo', PhotoSchema);