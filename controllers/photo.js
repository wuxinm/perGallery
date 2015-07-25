var mongoose = require('mongoose');
var Photo = mongoose.model('Photo');

// exports.homePage = function (req, res) {
// 	if(req.params.username === req.user.username) {
// 		Photo.randomPhoto(req, res, function (err, photo) {
// 			res.json(photo);
// 		});
// 	}
// }

exports.getAllPhotos = function (req, res) {
	if(req.params.username === req.user.username) {
		// console.log(req.route);
		Photo.getPhotos(function (err, photos) {
			if (err) 
				res.json(err)
			res.json(photos);
		})
	}
}

/* upload functions */

exports.uploadPhotos = function (req, res) {
	// console.log(req.route);
	var imgfiles = req.files.file;
	if (imgfiles instanceof Array) {
		uploadImages(imgfiles, req);
	}
	else {
		uploadAnImage(imgfiles, req);
	}
	res.send('Finish, click right corner go back');
	// res.redirect('/upload');
}

function uploadImages (imgs, req) {
	imgs.forEach(function(img) {
		new Photo({
			name: img.name,
			username: req.user.username,
			originalname: img.originalname,
			path: img.path.substring(7, img.path.length),
			uploadAt: Date.now()
		}).save(function(err) {
			if (err) res.json(err);
		});
	})
}

function uploadAnImage (img, req) {
	new Photo({
		name: img.name,
		username: req.user.username,
		originalname: img.originalname,
		path: img.path.substring(7, img.path.length),
		uploadAt: Date.now()
	}).save(function(err) {
		if (err) res.json(err);
	});
}

/* gallery function */

exports.galleryPhotos = function (req, res) {
	if(req.params.username === req.user.username) {
		var id = req.query.id
		Photo.dynamicPhotos(id, function (err, photos) {
			if(err)
				res.json(err)
			res.json(photos);
		})
	}
}

