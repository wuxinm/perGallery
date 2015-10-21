var mongoose = require('mongoose');
var EditedImg = mongoose.model('EditedImg');

exports.getEditedImg = function (req, res) {
	EditedImg.getEditedImg(req.params.img_comm_id, function (err, editedImg) {
		if (err) {
			res.json(err);
		} else {
			res.json(editedImg);
		}
	});
}

exports.getSentImgComments = function (req, res) {
	var user = req.params.username;
	EditedImg.getSentImgComments(user, function (err, comments) {
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

exports.addTextComment = function (req, res) {
	EditedImg.addComment(req.params.img_comm_id, req.body, function (err, comment){
		if (err) {
			res.json(err);
		} else {
			res.send('added comment');
		}
	});
}

exports.checkLikeUser = function (req, res) {
	var user = req.user.username;
	var id = req.params.img_comm_id;
	console.log(user);
	console.log(id);
	EditedImg.checkLikeUser(id, user, function (err, liked) {
		if (err) {
			res.json(err);
		} else {
			console.log(liked);
			res.json(liked);	
		}
	});
}

exports.addLikeUser = function (req, res) {
	var user = req.body.username;
	var id = req.body.img_comm_id;
	EditedImg.addLikeUser(id, user, function (err, likedImg) {
		if (err) {
			res.json(err);
		} else {
			res.send('added user');	
		}
	});
}