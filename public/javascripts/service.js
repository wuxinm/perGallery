var galleryService = angular.module('galleryService', []);

galleryService.factory('MainImageService', ['$resource',
	function ($resource) {
		return $resource('/:username/home');
		// 	, {}, {
		// 	'query': {method: 'GET', isArray: true}
		// });
	}
]);

galleryService.factory('GalleryService', ['$resource', 
	function ($resource) {
		return $resource('/:username/gallery', {}, {

		});
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
