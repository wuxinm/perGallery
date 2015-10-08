var express = require('express');
var router = express.Router();
var passport = require('passport');
var photo = require('../controllers/photo');
var user = require('../controllers/user');
var message = require('../controllers/message');
var notif = require('../controllers/notification');
var editedImg = require('../controllers/editedImg');
var api = require('../config/api');

router.get('/auth/twitter', passport.authenticate('twitter'));
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
	successRedirect: '/',
	failureRedirect: '/login'
}));

router.get('/config.js', function (req, res) {
	res.send('var api =' + JSON.stringify(api));
});


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

router.get(api.homepage, user.getCurrentUser);
router.get(api.get_all_photos, photo.getAllPhotos);
router.get(api.sent_img_comment, editedImg.getSentImgComments);
router.get(api.received_img_comment, editedImg.getReceivedImgComments);
router.get(api.notification, notif.getUserNotif);
router.put(api.notification, notif.setNotifAsReaded);
router.get(api.search_friend, user.searchUser);
router.put(api.add_friend, user.addFriendtoDB);

router.get(api.get_friend_info, user.getFriendInfo);
router.get(api.get_friend_photos, photo.getFriendPhotos);
router.get(api.get_friend_msg, message.getMessages);
router.get(api.editing_friend_photo, photo.getEditingPhoto);
router.post(api.editing_friend_photo, photo.uploadEditedPhoto);

router.post(api.upload_photos, photo.uploadPhotos);

router.get(api.get_user_photos, photo.galleryPhotos);
router.put(api.add_fav, photo.addToFavouritePhoto);
router.get(api.show_fav, photo.showFavouritePhotos);
router.delete(api.del_photo, photo.removePhoto);

module.exports = router;