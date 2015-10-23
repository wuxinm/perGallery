var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// use this kind of images as combine images background

var CombineImgSchema = new Schema({
	name: { type: String, default: '' },
	category: { type: String, default: '' },
	// from_user: { type: String, default: '' },
	to_user: { type: String, default: '' },
	path: { type: String, default: '' },
	uploadAt: { type: Date, default: '' }
});

// create new CombineImg
CombineImgSchema.statics.createCombineImg = function (name, category, to_user, path, callback) {
	var newCombineImg = new this();
	newCombineImg.name = name;
	newCombineImg.category = category;
	newCombineImg.to_user = to_user;
	newCombineImg.path = path;
	newCombineImg.uploadAt = Date.now();
	newCombineImg.save(callback);
	// return newCombineImg;
}

// get user's combine images as background
CombineImgSchema.statics.getCombineImg = function (user, category, callback) {
	this.find({ to_user : user, category: category}).sort({ uploadAt: -1 }).exec(callback);
}

mongoose.model('CombineImg', CombineImgSchema);