/* global api */
var galleryService = angular.module('galleryService', []);

galleryService.factory('MainImageService', ['$resource',
	function ($resource) {
		return $resource(api.get_all_photos, {}, {});
	}
]);

galleryService.factory('ImgCommentService', ['$resource',
	function ($resource) {
		return $resource(api.img_comment_req, { username: '@username' }, 
		{
			'addComment': { method: 'PUT' }
		});
	}
]);

galleryService.factory('UploadCombineService', ['$resource',
	function ($resource) {
		return $resource(api.upload_combine_img, { username: '@username' }, {});
	}
]);

galleryService.factory('GetCombineService', ['$resource',
	function ($resource) {
		return $resource(api.get_combine_img, { username: '@username' }, {});
	}
]);

galleryService.factory('SentImgCommentService', ['$resource',
	function ($resource) {
		return $resource(api.sent_img_comment, {}, {});
	}
]);

galleryService.factory('RecImgCommentService', ['$resource',
	function ($resource) {
		return $resource(api.receivced_img_comment, {}, {});
	}
]);

galleryService.factory('SearchUserService', ['$resource',
	function ($resource) {
		return $resource(api.search_friend, {}, {});
	}
]);

galleryService.factory('AddFriendService', ['$resource',
	function ($resource) {
		return $resource(api.add_friend, { username: '@username'}, 
		{
			'update': { method: 'PUT' }
		});
	}	
]);

galleryService.factory('NotificationService', ['$resource',
	function ($resource) {
		return $resource(api.notification, { username: '@username'}, 
		{
			'read': { method: 'POST' }
		});
	}	
]);

galleryService.factory('GetFriendInfoService', ['$resource',
	function ($resource) {
		return $resource(api.get_friend_info, { username: '@username'}, {});
	}
]);

galleryService.factory('GetFriendPhotoService', ['$resource',
	function ($resource) {
		return $resource(api.get_friend_photos, { username: '@username', friendname: '@friendname'}, {});	
	}
]);

galleryService.factory('LikeImgCommentService', ['$resource',
	function ($resource) {
		return $resource(api.like_img_comment, { 
			username: '@username',
			friendname: '@friendname',
			img_comm_id: '@img_comm_id', 
		}, {
			'likeImg': { method: 'PUT' }
		});
	}
]);

galleryService.factory('GetFriendMessageService', ['$resource',
	function ($resource) {
		return $resource(api.get_friend_msg, { username: '@username', friendname: '@friendname'}, {});	
	}
]);

galleryService.factory('EditPhotoService', ['$resource',
	function ($resource) {
		return $resource(api.editing_friend_photo, {
			username: '@username', friendname: '@friendname', photo_id: '@photo_id'
		}, {});	
	}
]);

galleryService.factory('GalleryService', ['$resource', 
	function ($resource) {
		return $resource(api.get_user_photos, {}, {});
	}
]);

galleryService.factory('GalleryCombineService', ['$resource',
	function ($resource) {
		return $resource(api.gallery_combine_img, { username: '@username' }, {});
	}
]);

galleryService.factory('GalleryVideoService', ['$resource',
	function ($resource) {
		return $resource(api.gallery_video, { username: '@username' }, {});
	}
]);

galleryService.factory('FavouritePhotoService', ['$resource',
	function ($resource) {
		return $resource(api.add_fav, { username: '@username'}, 
			{
				'update': { method: 'PUT' }
			});
	}	
]);

galleryService.factory('ShowFavouriteService', ['$resource',
	function ($resource) {
		return $resource(api.show_fav, {}, {});
	}
]);

galleryService.factory('RemoveImageService', ['$resource', 
	function ($resource) {
		return $resource(api.del_photo, { 
			username: '@username', name: 'name'
		}, {});
	}
]);

galleryService.service('Lightbox', function () {
	this.lightboxWidth = 0;
	this.lightboxHeight = 0;
	this.lightboxX = 0;
	this.lightboxY = 60;

	this.originalImgWidth = 0;
	this.originalImgHeight = 0;
	this.originalImgX = 0;
	this.originalImgY = 0;
});

galleryService.service('ViewMsg', function() {
	this.viewMsg = false;
});
