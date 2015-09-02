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
		otherwise({
			redirectTo: '/home'
		});
	}
]);