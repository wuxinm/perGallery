var galleryService = angular.module('galleryService', []);

galleryService.factory('MainImageService', ['$resource',
	function ($resource) {
		return $resource('/:username/home', {}, {});
	}
]);

galleryService.factory('SearchUserService', ['$resource',
	function ($resource) {
		return $resource('/:username/home/friends/search', {}, {});
	}
]);

galleryService.factory('AddFriendService', ['$resource',
	function ($resource) {
		return $resource('/:username/home/friends/addFriend', { username: '@username'}, 
		{
			'update': { method: 'PUT' }
		});
	}	
]);

galleryService.factory('NotificationService', ['$resource',
	function ($resource) {
		return $resource('/:username/home/notification', { username: '@username'}, 
		{
			'read': { method: 'PUT' }
		});
	}	
]);

galleryService.factory('GetFriendInfoService', ['$resource',
	function ($resource) {
		return $resource('/:username/home/friendInfo', { username: '@username'}, {});
	}
]);

galleryService.factory('GetFriendPhotoService', ['$resource',
	function ($resource) {
		return $resource('/:username/home/friend/:friendname', { username: '@username', friendname: '@friendname'}, {});	
	}
]);

galleryService.factory('GetFriendMessageService', ['$resource',
	function ($resource) {
		return $resource('/:username/home/friend/:friendname/messages', { username: '@username', friendname: '@friendname'}, {});	
	}
]);

galleryService.factory('GalleryService', ['$resource', 
	function ($resource) {
		return $resource('/:username/gallery', {}, {});
	}
]);

galleryService.factory('FavouritePhotoService', ['$resource',
	function ($resource) {
		return $resource('/:username/gallery/addToFavourite', { username: '@username'}, 
			{
				'update': { method: 'PUT' }
			});
	}	
]);

galleryService.factory('ShowFavouriteService', ['$resource',
	function ($resource) {
		return $resource('/:username/gallery/showFavourites', {}, {});
	}
]);

galleryService.factory('RemoveImageService', ['$resource', 
	function ($resource) {
		return $resource('/:username/gallery/removeImage/:name', { 
			username: '@username', name: 'name'
		}, {});
	}
]);

galleryService.service('Lightbox', function () {
	this.lightboxWidth = 0;
	this.lightboxHeight = 0;
	this.lightboxX = 0;
	this.lightboxY = 75;

	this.originalImgWidth = 0;
	this.originalImgHeight = 0;
	this.originalImgX = 0;
	this.originalImgY = 0;
});

galleryService.service('ViewMsg', function() {
	this.viewMsg = false;
});
