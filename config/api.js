exports.homepage = '/:username';
exports.get_all_photos = '/:username/home';
exports.get_photos_count = '/:username/home/photos_count'
exports.get_likes_count = '/:username/home/likes_count';
exports.img_comment_req = '/:username/home/editedImg/:img_comm_id';
exports.sent_img_comment = '/:username/home/sentImgComment';
exports.received_img_comment = '/:username/home/receivedImgComment';
exports.notification = '/:username/home/notification';
exports.search_friend = '/:username/home/friends/search';
exports.add_friend = '/:username/home/friends/addFriend';
exports.upload_combine_img = '/:username/combine/:photo_id';
exports.get_combine_img = '/:username/combine';

exports.get_friend_info = '/:username/home/friendInfo';
exports.get_friend_photos = '/:username/home/friend/:friendname';
exports.get_friend_msg = '/:username/home/friend/:friendname/messages';
exports.editing_friend_photo = '/:username/home/friend/:friendname/editing/:photo_id';
exports.like_img_comment = '/:username/home/friend/:friendname/like/:img_comm_id';

exports.upload_photos = '/:username/upload';

exports.get_user_photos = '/:username/gallery';
exports.gallery_combine_img = '/:username/gallery/combine';
// exports.gallery_video = '/:username/gallery/video';
exports.add_fav = '/:username/gallery/addToFavourite';
exports.show_fav = '/:username/gallery/showFavourites';
exports.del_photo = '/:username/gallery/removeImage/:name';