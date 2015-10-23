var mongoose = require('mongoose');
var CombineImg = mongoose.model('CombineImg');
var fs = require('fs');

exports.AddCombineImg = function (req, res) {
	var name = req.query.name;
	var category = req.query.category;
	var to_user = req.query.to_user;
	var path = __dirname.replace('controllers', 'public') + req.query.path;
	var img = req.body.data;
	var buffer = new Buffer(img, 'base64');
	
	if (category === 'source') {
		saveImg(name, path, category, to_user, buffer, 'combineSource', res);
	} else if (category === 'image') {
		saveImg(name, path, category, to_user, buffer, 'combineImgs', res);
	}
}

function saveImg (name, path, category, to_user, buffer, folderName, res) {
	fs.writeFile(path + name + '.png', buffer, function (err) {
			if (err) {
				res.json(err)
			} else {
				var imgName = name;
				var imgPath = 'uploads/'+ folderName + '/' + imgName + '.png';
				CombineImg.createCombineImg(imgName, category, to_user, imgPath, function (err, img) {
					res.send('success');
					console.log('done');	
				}); 
			}
		});
}


exports.getCombineImgs = function (req, res) {
	var user = req.query.to_user;
	var cate = req.query.category;
	CombineImg.getCombineImg(user, cate, function (err, images) {
		if (err) {
			console.log(err);
		} else {
			res.json(images);
		}
	});
}