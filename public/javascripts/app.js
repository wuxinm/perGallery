'use strict'

// var photo = require('../controllers/photo');

var galleryApp = angular.module('perGallery', [
	'ngRoute',
	'ngResource',
	'ngFileUpload',
	'galleryControllers',
	'galleryAnimations',
	'galleryService'
]);

galleryApp.config(['$routeProvider',
	function ($routeProvider) {
		$routeProvider.
		when('/home', {
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		}).
		when('/upload', {
			templateUrl: 'partials/upload.html',
			controller: 'UploadCtrl'
		}).
		when('/gallery', {
			templateUrl: 'partials/gallery.html',
			controller: 'GalleryCtrl'
		}).
		when('/home/friend/:friendname', {
			templateUrl: 'partials/friendPage.html',
			controller: 'FriendPageCtrl'
		}).
		when('/home/friend/:friendname/editing/:photo_id', {
			templateUrl: 'partials/editImage.html',
			controller: 'EditImageCtrl'
		}).
		otherwise({
			redirectTo: '/home'
		});
	}
]);