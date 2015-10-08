var mongoose = require('mongoose');
var EditedImg = mongoose.model('EditedImg');

exports.getSentImgComments = function (req, res) {
	EditedImg.getSentImgComments(req.user.username, function (err, comments) {
		if (err) {
			res.json(err);
		}
		res.json(comments);
	});
}

exports.getReceivedImgComments = function (req, res) {
	EditedImg.getReceivedImgComments(req.user.username, function (err, comments) {
		if (err) {
			res.json(err);
		}
		res.json(comments);
	});
}