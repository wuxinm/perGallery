var express = require('express');
var router = express.Router();
var passport = require('passport');
var photo = require('../controllers/photo');

router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
	successRedirect: '/',
	failureRedirect: '/login'
}));

/* GET home page. */
router.get('/', function (req, res) {
	if (!req.user)
		res.redirect('/login');
	else
		res.redirect('/' + req.user.username);
});

router.get('/login', function (req, res) {
	res.render('login');
});

router.get('/:username', function (req, res) {
	res.render('layout', {
		user: { 
			id : req.user._json.id,
			username : req.user._json.screen_name,
			location : req.user._json.location,
			description : req.user._json.description,
			userPhoto : req.user.photos[0].value
		}
	});
});

router.get('/:username/home', photo.getAllPhotos);
router.post('/:username/upload', photo.uploadPhotos);
router.get('/:username/gallery', photo.galleryPhotos);

module.exports = router;