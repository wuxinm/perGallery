var express = require('express');
var router = express.Router();
var passport = require('passport');
var photo = require('../controllers/photo');
var user = require('../controllers/user');

router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
	successRedirect: '/',
	failureRedirect: '/login'
}));

/* GET home page. */
router.get('/', function (req, res) {
	if (!req.user)
		res.redirect('/login');
	else {
		res.redirect('/' + req.user.username);
	}
});

router.get('/login', function (req, res) {
	res.render('login');
});
router.get('/logout', function (req, res) {
	req.session.destroy();
	req.logout();
	res.redirect('/');
});
router.get('/:username', user.getCurrentUser);
router.get('/:username/home', photo.getAllPhotos);
router.get('/:username/home/friends/search', user.searchUser);
router.put('/:username/home/friends/addFriend', user.addFriendtoDB);
router.get('/:username/home/friendInfo', user.getFriendInfo);
router.get('/:username/home/friend/:friendname', photo.getFriendPhotos);
router.post('/:username/upload', photo.uploadPhotos);
router.get('/:username/gallery', photo.galleryPhotos);
router.put('/:username/gallery/addToFavourite', photo.addToFavouritePhoto);
router.get('/:username/gallery/showFavourites', photo.showFavouritePhotos);
router.delete('/:username/gallery/removeImage/:name', photo.removePhoto);

module.exports = router;