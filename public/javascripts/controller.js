/* global io */
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/* global LoggedIn */
'use strict'

var galleryControllers = angular.module('galleryControllers', []);

galleryControllers.controller('HomeCtrl', ['$scope', '$timeout', '$interval', '$window', '$location',
	'MainImageService', 'SearchUserService', 'AddFriendService',
	function ($scope, $timeout, $interval, $window, $location,
		MainImageService, SearchUserService, AddFriendService) {
		//Profile Label
		$scope.userProfilePhoto = LoggedIn.userPhoto;
		$scope.userName = LoggedIn.name;
		$scope.userLocation = LoggedIn.location;
		$scope.userDescription = LoggedIn.description;
		$scope.userFriendList = LoggedIn.friends;
		
		$scope.emptyGalleryAlert = true;
		// enable slider mode by 1, disable by 0
		$scope.sliderMode = 0;
		// home page mode: 
		// 	0 default homepage;
		// 	1 friend list
		// 	2 message list
		$scope.homepageMode = 0;
		$scope.mainImages = [];
		$scope.mainImageTopOne;
		$scope.sliderLeft50;
		$scope.sliderLeft100;

		// list to store all photos from DB
		var imageList = [];
		var randomIndex;
		var randomPhoto;
		
		// dynamic serach users from DB
		var searchTimer = null;
		var minSearchLength = 2;
		$scope.searching = false;
		$scope.results = [];
		
		MainImageService.query({
			username: LoggedIn.name
		}, function (data) {
			if (data.length !== 0) {
				// console.log(data);
				$scope.emptyGalleryAlert = false;
				imageList = data;
				for (var i = 0; i < 3; i++) {
					$scope.mainImages.push(pickRandomImage(imageList));
				};
			$interval(mainImageAnimate, 5000);
			}
		});

		function pickRandomImage(imageList) {
			randomIndex = Math.floor(Math.random() * imageList.length);
			randomPhoto = imageList[randomIndex];

			//make sure no duplicate photo be picked in list
			imageList.splice(randomIndex, 1);
			return randomPhoto;
		}

		//Slider Animation

		function mainImageAnimate() {
			$scope.mainImageTopOne = $scope.mainImages[2]._id;
			$timeout(removeTopOneImage, 1000);
		}

		function removeTopOneImage(index) {
			$scope.mainImageTopOne = 'null';
			$scope.sliderLeft50 = $scope.mainImages[0]._id;
			$scope.sliderLeft100 = $scope.mainImages[1]._id;
			imageList.push($scope.mainImages[2]);
			$scope.mainImages.pop();
			$timeout(pushNewIamge, 100);
		}

		function pushNewIamge() {
			$scope.sliderLeft50 = 'null';
			$scope.sliderLeft100 = 'null';
			$scope.mainImages.unshift(pickRandomImage(imageList));
		}
		
		// Start Slider model
		$scope.showSlider = function () {
			$scope.sliderMode = 1;
		}
		
		// show friends list
		$scope.showFriends = function () {
			// $scope.homepageMode = -1;
			if ($scope.homepageMode === 0) {
				$timeout(function(){
					$scope.homepageMode = 1;
					// console.log($scope.userFriendList)
				}, 500);
			} else if ($scope.homepageMode === 1) {
				$timeout(function(){
					$scope.homepageMode = 0;
					// console.log($scope.userFriendList)
				}, 500);
			}
		}
		
		// search users
		$scope.searchUser = function (value) {
			clearSearchResults($scope.results);
			// $scope.searching = true;
			if (value.length > minSearchLength) {
				if (searchTimer) {
	              $timeout.cancel(searchTimer);
	            }
				
				searchTimer = $timeout(function () {
					usersGetRequest(value);
				}, 300);
			}
		}
		
		function usersGetRequest(str) {
			SearchUserService.query({
				username: LoggedIn.name,
				char: str
			}, function (data) {
				for (var i = 0; i < data.length; i++) {
					$scope.results.push(data[i])
				}
			});
		}
		// add one friend to friend list
		$scope.addToFriend = function (friend) {
			AddFriendService.update({username: LoggedIn.name}, friend);
			$scope.userFriendList.push(friend);
		}
		
		$scope.clearInput = function () {
			$scope.searchingStr = '';
			clearSearchResults($scope.results);
		}
		
		function clearSearchResults(results) {
			results.splice(0, results.length);
		}
		
		$scope.jumpToFriendPage = function(friendName) {
			$location.path('/friend/' + friendName);
		}
		
	}
]);

// ---------------------- UPLOAD PAGE CONTROLLER ---------------------------------

galleryControllers.controller('UploadCtrl', ['$scope', '$timeout', 'Upload',
	function ($scope, $timeout, Upload) {
		// $scope.percentComplete = 0;
		$scope.uploadQueue = [];
		$scope.removeUploadQueue = [];
		$scope.progress_percentage = 0;
		$scope.rotate_engle = 0;
		$scope.editing = false;
		$scope.uploading = false;
		$scope.selectedImg = null;

		$scope.$watch('imgFiles', function () {
			if ($scope.imgFiles != null) {
				readImages($scope.imgFiles);
				$scope.uploading = true;
			}
		});

		// add images to preview panel

		function readImages (imgFiles) {
			for (var i = 0; i < imgFiles.length; i++) {
				var image = imgFiles[i]
				image.selected = false;
				$scope.uploadQueue.push(image);
			};
			console.log($scope.uploadQueue.length);
		}

		$scope.editUploadQueue = function () {
			$scope.editing = true;
		}

		$scope.selectUploadQueue = function (file) {
			if($scope.editing) {
				if(!file.img.selected) {
					file.img.selected = true;
					$scope.removeUploadQueue.push(file.img);
				}
				else {
					file.img.selected = false;
					var index = $scope.removeUploadQueue.indexOf(file.img);
					$scope.removeUploadQueue.splice(index, 1);
				}
			}
		}

		$scope.removeSelectedImg = function () {
			for (var i = 0; i < $scope.removeUploadQueue.length; i++) {
				var index = $scope.uploadQueue.indexOf($scope.removeUploadQueue[i]);
				$scope.uploadQueue.splice(index, 1);
			}
			$scope.removeUploadQueue.splice(0, $scope.removeUploadQueue.length);
		}

		$scope.finishUploadQueue = function () {
			$scope.editing = false;
			// removeSelectedImg();
			if($scope.removeUploadQueue !== null) {
				$scope.removeUploadQueue.forEach(function(img) {
					img.selected = false;
				});
				$scope.removeUploadQueue.splice(0, $scope.removeUploadQueue.length);
			}
		}

		$scope.uploadImages = function () {
			if ($scope.uploading === false) {
				$scope.nonePhotoAlert = 'Please add photos first~~!';
			}
			else {
				$scope.uploadQueue.upload = Upload.upload({
					url: '/:username/upload',
					fields: {
						'username': $scope.userName
					},
					file: $scope.uploadQueue
				});

				$scope.uploadQueue.upload.progress(function (evt) {
					// Math.min is to fix IE which reports 200% sometimes
					$scope.progress_percentage = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
					$scope.rotate_engle = $scope.progress_percentage * 3.6;
					updateProgress($scope.rotate_engle);
				});

				$scope.uploadQueue.upload.success(function(data, status, headers, config) {
					$scope.uploadQueue.splice(0, $scope.uploadQueue.length);
					// $scope.uploading = false;
					console.log(data);
				});	
			}
		}

		$scope.uploadDone = function () {
			$scope.uploading = false;
		}

		function updateProgress (num) {
			if (num <= 180) {
				angular.element('.right').css('transform', 'rotate(' + num + 'deg)');
			}
			else {
				angular.element('.right').css('transform', 'rotate(180deg)');
				angular.element('.left').css('transform', 'rotate(' + (num - 180) + 'deg)');
			};
		}

	}
]);

// ---------------------- GALLERY PAGE CONTROLLER ---------------------------------

galleryControllers.controller('GalleryCtrl', ['$scope', '$route' ,'$window', '$location', '$animate', 'GalleryService', 
	'Lightbox', 'FavouritePhotoService', 'ShowFavouriteService', 'RemoveImageService',
	function ($scope, $route, $window, $location, $animate, GalleryService, Lightbox, FavouritePhotoService
		, ShowFavouriteService, RemoveImageService) {
		$scope.galleryQueue = [];
		$scope.imgSelected = false;
		$scope.lightImgSrc;
		$scope.allphotos = true;
		$scope.gallerySearching = false;

		var skip = 0;

		$scope.loadMoreImgs = function () {
			GalleryService.query({
				username: LoggedIn.name,
				skip: skip
			}, function (data) {
				for (var i = 0; i < data.length; i++) {
					$scope.galleryQueue.push(data[i]);
				};
				skip += 30;
			});
		}
		
		$scope.loadMoreImgs();
		
		$scope.searchImgs = function () {
			$scope.gallerySearching = true;
		}
		
		$scope.clearInput = function () {
			$scope.searchingStr = '';
		}
		
		$scope.stopSearch = function () {
			$scope.gallerySearching = false;
		}

		$scope.showImg = function (image, $event) {
			Lightbox.lightboxWidth = $window.innerWidth * 0.6;
			Lightbox.lightboxHeight = Lightbox.lightboxWidth/1.6;
			Lightbox.lightboxX = $window.innerWidth * 0.2;
			Lightbox.originalImgX = angular.element($event.target).prop('x');
			Lightbox.originalImgY = angular.element($event.target).prop('y');
			Lightbox.originalImgWidth = angular.element($event.target).prop('width');
			Lightbox.originalImgHeight = angular.element($event.target).prop('height');

			angular.element('#light-image').css('top', Lightbox.originalImgY);
			angular.element('#light-image').css('left', Lightbox.originalImgX);
			angular.element('#light-image').css('width', Lightbox.originalImgWidth);
			angular.element('#light-image').css('height', Lightbox.originalImgHeight);
			$scope.imgSelected = true;
			$scope.lightImg = image.img;
		}

		$scope.closeLight = function () {
			$scope.imgSelected = false;
		}
		
		$scope.addToFavourite = function () {
			FavouritePhotoService.update({username: LoggedIn.name}, $scope.lightImg);
		}
		
		$scope.showAllImgs = function () {
			$scope.allphotos = true;
			$scope.galleryQueue.splice(0, $scope.galleryQueue.length);
			skip = 0;
			GalleryService.query({
				username: LoggedIn.name,
				id: skip
			}, function (data) {
				for (var i = 0; i < data.length; i++) {
					$scope.galleryQueue.push(data[i]);
				};
				skip += 30;
			});
		}
		
		$scope.showFavourites = function () {
			$scope.allphotos = false;
			$scope.galleryQueue.splice(0, $scope.galleryQueue.length);
			ShowFavouriteService.query({
				username: LoggedIn.name
			}, function (data) {
				for (var i = 0; i < data.length; i++) {
					$scope.galleryQueue.push(data[i]);
				}
			});
		}
		
		$scope.removeImgAlert = function () {
			angular.element('#removeAlert').show();
		}
		
		$scope.removeImgAlertCancel = function () {
			angular.element('#removeAlert').hide();
		}
		
		$scope.removeImg = function () {
			RemoveImageService.delete({
				username: LoggedIn.name, 
				name: $scope.lightImg.name,
			}, function (data) {
				// $location.path('/gallery');
				$route.reload(); 
			});
		}
	}
]);

/**    
 * Friend Page Controller
 */
 
 galleryControllers.controller('FriendPageCtrl', ['$scope', '$route', '$routeParams', '$location',
	 'GetFriendInfoService', 'GetFriendPhotoService',
	 function ($scope, $route, $routeParams, $location
		 , GetFriendInfoService, GetFriendPhotoService) {
			 
		$scope.galleryQueue = [];
		
		var socket = io.connect();
		// socket.on('news', function (data) {
		// 	console.log(data);
		//     socket.emit('my other event', { my: 'wtf' });
		// });

		 GetFriendInfoService.query({
			 username: LoggedIn.name,
			 friendname: $routeParams.friendname
		 }, function (friend) {
			 $scope.friendProfilePhoto = friend[0].profilePhotoUrl.replace('_normal', '_400x400');
			 $scope.friendName = friend[0].name;
			 $scope.friendLocation = friend[0].location;
			 $scope.friendDescription = friend[0].description;
		 });

		 GetFriendPhotoService.query({
			 username: LoggedIn.name,
			 friendname: $routeParams.friendname
		 }, function (photos) {
			 for (var i = 0; i < photos.length; i++) {
				 $scope.galleryQueue.push(photos[i]);
			 }
		 });
		 
		 $scope.sendMessage = function (message) {
			 var date = Date();
			 socket.emit('user message', { message: message, date: date, user: LoggedIn.name, friend: $routeParams.friendname });
		 }
	 }
]);