exports.homepage = '/:username';
exports.get_all_photos = '/:username/home';
exports.img_comment_req = '/:username/home/:img_comm_id';
exports.sent_img_comment = '/:username/home/sentImgComment';
exports.received_img_comment = '/:username/home/receivedImgComment';
exports.notification = '/:username/home/notification';
exports.search_friend = '/:username/home/friends/search';
exports.add_friend = '/:username/home/friends/addFriend';

exports.get_friend_info = '/:username/home/friendInfo';
exports.get_friend_photos = '/:username/home/friend/:friendname';
exports.get_friend_msg = '/:username/home/friend/:friendname/messages';
exports.editing_friend_photo = '/:username/home/friend/:friendname/editing/:photo_id';

exports.upload_photos = '/:username/upload';

exports.get_user_photos = '/:username/gallery';
exports.add_fav = '/:username/gallery/addToFavourite';
exports.show_fav = '/:username/gallery/showFavourites';
exports.del_photo = '/:username/gallery/removeImage/:name';