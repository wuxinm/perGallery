'use strict'

var galleryControllers = angular.module('galleryControllers', []);

galleryControllers.controller('HomeCtrl', ['$scope', '$timeout', '$interval', 'MainImageService',
	function ($scope, $timeout, $interval, MainImageService) {
		//Profile Label
		$scope.userProfilePhoto = LoggedIn.userPhoto;
		$scope.userName = LoggedIn.username;
		$scope.userLocation = LoggedIn.location;
		$scope.userDescription = LoggedIn.description;

		$scope.mainImages = [];
		$scope.mainImageTopOne = 'null';
		$scope.sliderLeft50 = 'null';
		$scope.sliderLeft100 = 'null';

		// list to store all photos from DB
		var imageList = [];
		// randomSlider
		var randomIndex;
		var randomPhoto;

		MainImageService.query({
			username: LoggedIn.username
		}, function (data) {
			imageList = data;
			for (var i = 0; i < 3; i++) {
				$scope.mainImages[i] = pickRandomImage(imageList);
			};
		});

		function pickRandomImage(photos) {
			randomIndex = Math.floor(Math.random() * photos.length);
			randomPhoto = photos[randomIndex];

			//make sure no duplicate photo be picked in list
			photos.splice(randomIndex, 1);
			return randomPhoto;
		}

		//Slider Animation

		function mainImageAnimate() {
			$scope.mainImageTopOne = $scope.mainImages[2].path;
			$timeout(removeTopOneImage, 1000);
		}

		function removeTopOneImage(index) {
			$scope.mainImageTopOne = 'null';
			$scope.sliderLeft50 = $scope.mainImages[0].path;
			$scope.sliderLeft100 = $scope.mainImages[1].path;
			imageList.push($scope.mainImages[2]);
			$scope.mainImages.pop();
			$timeout(pushNewIamge, 100);
		}

		function pushNewIamge() {
			$scope.sliderLeft50 = 'null';
			$scope.sliderLeft100 = 'null';
			$scope.mainImages.unshift(pickRandomImage(imageList));
		}

		$interval(mainImageAnimate, 5000);
	}
]);

// ---------------------- UPLOAD PAGE CONTROLLER ---------------------------------

galleryControllers.controller('UploadCtrl', ['$scope', '$timeout', 'Upload',
	function ($scope, $timeout, Upload) {
		// $scope.percentComplete = 0;
		$scope.uploadQueen = [];
		$scope.removeUploadQueen = [];
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
				$scope.uploadQueen.push(image);
			};
			console.log($scope.uploadQueen.length);
		}

		$scope.editUploadQueen = function () {
			$scope.editing = true;
		}

		$scope.selectUploadQueen = function (file) {
			if($scope.editing) {
				if(!file.img.selected) {
					file.img.selected = true;
					$scope.removeUploadQueen.push(file.img);
				}
				else {
					file.img.selected = false;
					var index = $scope.removeUploadQueen.indexOf(file.img);
					$scope.removeUploadQueen.splice(index, 1);
				}
			}
		}

		$scope.removeSelectedImg = function () {
			for (var i = 0; i < $scope.removeUploadQueen.length; i++) {
				var index = $scope.uploadQueen.indexOf($scope.removeUploadQueen[i]);
				$scope.uploadQueen.splice(index, 1);
			}
			$scope.removeUploadQueen.splice(0, $scope.removeUploadQueen.length);
		}

		$scope.finishUploadQueen = function () {
			$scope.editing = false;
			// removeSelectedImg();
			if($scope.removeUploadQueen !== null) {
				$scope.removeUploadQueen.forEach(function(img) {
					img.selected = false;
				});
				$scope.removeUploadQueen.splice(0, $scope.removeUploadQueen.length);
			}
		}

		$scope.uploadImages = function () {
			if ($scope.uploading === false) {
				$scope.nonePhotoAlert = 'Please add photos first~~!';
			}
			else {
				$scope.uploadQueen.upload = Upload.upload({
					url: '/' + LoggedIn.username + '/upload',
					fields: {
						'username': $scope.userName
					},
					file: $scope.uploadQueen
				});

				$scope.uploadQueen.upload.progress(function (evt) {
					// Math.min is to fix IE which reports 200% sometimes
					$scope.progress_percentage = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
					$scope.rotate_engle = $scope.progress_percentage * 3.6;
					updateProgress($scope.rotate_engle);
				});

				$scope.uploadQueen.upload.success(function(data, status, headers, config) {
					$scope.uploadQueen.splice(0, $scope.uploadQueen.length);
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

// var lightimageWidth = $(window).width() * 0.6;
// var lightimageHeight = $(window).height() * 0.5;
// var lightimageTop = 100;
// var lightimageLeft = 150;

galleryControllers.controller('GalleryCtrl', ['$scope', '$window', '$animate', 'GalleryService', 'Lightbox', 
	function ($scope, $window, $animate, GalleryService, Lightbox) {
		$scope.galleryQueen = [];
		$scope.imgSelected = false;
		$scope.lightImgSrc = "";

		var skip = 0;

		$scope.loadMoreImgs = function () {
			GalleryService.query({
				username: LoggedIn.username,
				id: skip
			}, function (data) {
				for (var i = 0; i < data.length; i++) {
					$scope.galleryQueen.push(data[i]);
				};
				skip += 5;
			});
		}

		$scope.showImg = function ($event) {
			console.log($event);

			Lightbox.lightboxWidth = $window.innerWidth * 0.6;
			Lightbox.lightboxHeight = Lightbox.lightboxWidth/1.6;
			Lightbox.lightboxX = $window.innerWidth * 0.2;
			Lightbox.originalImgX = angular.element($event.target).prop('x');
			Lightbox.originalImgY = angular.element($event.target).prop('y');
			Lightbox.originalImgWidth = angular.element($event.target).prop('width');
			Lightbox.originalImgHeight = angular.element($event.target).prop('height');

			angular.element('#lightimage').css('top', Lightbox.originalImgY);
			angular.element('#lightimage').css('left', Lightbox.originalImgX);
			angular.element('#lightimage').css('width', Lightbox.originalImgWidth);
			angular.element('#lightimage').css('height', Lightbox.originalImgHeight);
			$scope.imgSelected = true;
			$scope.lightImgSrc = $event.target.src;
		}

		$scope.closeLight = function () {
			$scope.imgSelected = false;
		}	

		$scope.loadMoreImgs();

	}
]);