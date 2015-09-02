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
		return $resource('/:username/home/friends/addFriend', { username: '@name'}, 
		{
			'update': { method: 'PUT' }
		});
	}	
]);

galleryService.factory('GalleryService', ['$resource', 
	function ($resource) {
		return $resource('/:username/gallery', {}, {});
	}
]);

galleryService.factory('FavouritePhotoService', ['$resource',
	function ($resource) {
		return $resource('/:username/gallery/addToFavourite', { username: '@name'}, 
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
