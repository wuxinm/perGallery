var mongoose = require('mongoose');
var Photo = mongoose.model('Photo');
var EditedImg = mongoose.model('EditedImg');
var CombineImg = mongoose.model('CombineImg');
var im = require('imagemagick');
var fs = require('fs');

exports.getAllPhotos = function (req, res) {
	if(req.params.username === req.user.username) {
		Photo.getAllPhotos(function (err, photos) {
			if (err) 
				res.json(err)
			// console.log(photos);
			res.json(photos);
		})
	}
}

exports.getRandomPhoto = function (req, res) {
	if(req.params.username === req.user.username) {
		Photo.randomPhoto(req.user.username, function (err, photo) {
			if (err) res.json(err);
			res.json(photo);		
		})
	}
}

exports.getFriendPhotos = function (req, res) {
	var friendname = req.params.friendname;
	Photo.getFriendPhotos(friendname, function (err, photos) {
		if (err) {
			res.json(err);
		}
		res.json(photos);
	})
}

/* upload functions */

exports.uploadPhotos = function (req, res) {
	var imgfiles = req.files.file;
	console.log(imgfiles);
	if (imgfiles instanceof Array) {
		imgfiles.forEach(function(img) {
			if (img.extension === 'MP4') {
				addImgToDB(img, req, res);
			} else {
				imageResize(img, req, res);
				addImgToDB(img, req, res);
			}
		})
	} else {
		if (imgfiles.extension === 'MP4') {
			addImgToDB(imgfiles, req, res);
		} else {
			imageResize(imgfiles, req, res);
			addImgToDB(imgfiles, req, res);
		}
	}
	res.send('Finish, click right corner go back');
}

function imageResize (img, req, res) {
	var imageName = img.name;
	// if there is an error
	if(!imageName) {
		console.log('there was an error');
		res.redirect('/');
		res.end();
	} else {
		var lowThumbPath = 'public/uploads/lowThumbnails/' + imageName;
		var mediumThumbPath = 'public/uploads/mediumThumbnails/' + imageName;	
		im.resize({
			srcPath: img.path,
			dstPath: lowThumbPath,
			width: 512
		}, function (err, stdout, stderr) {
			if (err) throw err;
		});
		im.resize({
			srcPath: img.path,
			dstPath: mediumThumbPath,
			width: 2048
		}, function (err, stdout, stderr) {
			if (err) throw err;
		});
	}
}

function addImgToDB (img, req, res) {
	Photo.createPhoto(img, req.user, function(err, photo) {
		if (err) {
			res.json(err);
		}
	});
}

/* gallery function */

exports.galleryPhotos = function (req, res) {
		var skip = req.query.skip;
		var username = req.params.username;
		// var extension = 'jpg';
		Photo.dynamicPhotos(skip, username, function (err, photos) {
			if(err)
				res.json(err);
			// console.log(photos);
			res.json(photos);
		});
}

/**
 * add photo as favourite
 */

exports.addToFavouritePhoto = function (req, res) {
	var photo = req.body;
	Photo.addToFavourite(photo.name, function(err, photos) {
		if (err) {
			res.json(err);
		}
		// console.log(photos);
		res.send('add this photo as favourite');
	});
}

/** 
* show favourite photos
*/

exports.showFavouritePhotos = function (req, res) {
	var username = req.user.username;
	Photo.showFavourites(username, function (err, photos) {
		if (err) {
			res.json(err);
		}
	//  console.log(photos);
		res.json(photos);
	});
}
 
/**
* remove photo
*/

exports.removePhoto = function (req, res) {
	var photoName = req.params.name;
	var path = './public/uploads/' + photoName;
	var mediumThumbPath = './public/uploads/mediumThumbnails/' + photoName;
	var lowThumbPath = './public/uploads/lowThumbnails/' + photoName;
	var paths = [path, mediumThumbPath, lowThumbPath];
	var i = paths.length;
	Photo.removePhoto(photoName, function (err, photo) {
		paths.forEach(function(filepath){
			fs.unlink(filepath, function() {
				i --;
				if (err) {
					res.json(err)
				}
				else if (i <= 0) {
					res.send('all files removed');
				}
			});
		});
	});	
}

exports.getEditingPhoto = function (req, res) {
	Photo.getPhoto(req.params.photo_id, function (err, photo) {
		if (err) {
			res.json(err);
		} else {
			res.json(photo);
		}
	});
}

exports.uploadEditedPhoto = function (req, res) {
	console.log('wokao');
	var img = req.body.data;
	var buffer = new Buffer(img, 'base64');
	console.log(__dirname);
	var storePath = __dirname.replace('controllers', 'public') + '/uploads/editedImgs/';
	var photo_id = req.params.photo_id;
	Photo.getPhoto(photo_id, function (err, photo) {
		if (err) {
			res.json(err);
		} else {
			fs.writeFile(storePath + photo[0].originalname + '_commentImg_' + photo[0].commentImgs.length + '.png', buffer, function (err) {
				if (err) {
					res.json(err)
				} else {
					var imgName = photo[0].originalname + '_commentImg_' + photo[0].commentImgs.length + '.png';
					var imgPath = 'uploads/editedImgs/' + imgName;
					EditedImg.createEditedImg(imgName, req.user.username, req.params.friendname, imgPath, function (err, img) {
						Photo.addImgComment(photo_id, img, function (err, photo) {
							if (err) { res.json(err); }
						});
					}); 
					res.send('success');
					console.log('done');
				}
			});
		}
	});
}

exports.uploadCombinePhoto = function (req, res) {
	var img = req.body.data;
	var buffer = new Buffer(img, 'base64');
	var storePath = __dirname.replace('controllers', 'public') + '/uploads/combineImgs/';
	var photo_id = req.params.photo_id;
	var category = req.query.category;
	Photo.getPhoto(photo_id, function (err, photo) {
		if (err) {
			res.json(err);
		} else {
			fs.writeFile(storePath + photo[0].originalname + '_combinebackgroundImg_' + photo[0].combineImgs.length + '.png', buffer, function (err) {
				if (err) {
					res.json(err)
				} else {
					var imgName = photo[0].originalname + '_combinebackgroundImg_' + photo[0].combineImgs.length + '.png';
					var imgPath = 'uploads/combineImgs/' + imgName;
					CombineImg.createCombineImg(imgName, category, req.user.username, imgPath, function (err, img) {
						Photo.addCombineImg(photo_id, img, function (err, photo) {
							if (err) { res.json(err); }
						});
					}); 
					res.send('success');
					console.log('done');
				}
			});
		}
	});
}