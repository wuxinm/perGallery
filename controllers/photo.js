var mongoose = require('mongoose');
var Photo = mongoose.model('Photo');
var im = require('imagemagick');

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
	var imgfiles = req.files.file;
	if (imgfiles instanceof Array) {
		uploadImages(imgfiles, req, res);
	}
	else {
		uploadAnImage(imgfiles, req, res);
	}
	res.send('Finish, click right corner go back');
}

function uploadImages (imgs, req, res) {
	imgs.forEach(function(img) {
		imageResize(img, req, res);
		addImgToDB(img, req, res);
	})
}

function uploadAnImage (img, req, res) {
	imageResize(img, req, res);
	addImgToDB(img, req, res);
}

function imageResize (img, req, res) {
	var imageName = img.name;
	
	// if there is an error
	if(!imageName) {
		console.log('there was an error');
		res.redirect('/');
		res.end();
	} else {
		var thumbPath = 'public/uploads/thumbnails/' + imageName;
		
		im.resize({
			srcPath: img.path,
			dstPath: thumbPath,
			width: 512
		}, function (err, stdout, stderr) {
			if (err) throw err;
		});
	}
}

function addImgToDB (img, req, res) {
	new Photo({
		name: img.name,
		username: req.user.username,
		originalname: img.originalname,
		path: img.path.substring(7, img.path.length),
		thumbpath: img.path.substring(7, 14) + '/thumbnails/' + img.name,
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

