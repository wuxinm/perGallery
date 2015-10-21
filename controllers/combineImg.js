var mongoose = require('mongoose');
var CombineImg = mongoose.model('CombineImg');

exports.AddCombineImg = function (req, res) {
	CombineImg.createCombineImg(function (err, img) {
		if (err) {
			console.log(err)
		} else {
			
		}
	});
}

exports.getCombineImgs = function (req, res) {
	CombineImg.getCombineImg(req.user.username, req.query.category, function (err, images) {
		if (err) {
			console.log(err);
		} else {
			res.json(images);
		}
	});
}