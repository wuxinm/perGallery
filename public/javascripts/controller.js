/* global fabric */
/* global io */
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/* global LoggedIn */
'use strict'

var galleryControllers = angular.module('galleryControllers', []);

galleryControllers.controller('HomeCtrl', ['$scope', '$timeout', '$interval', '$window', '$location',
	'ViewMsg', 'MainImageService', 'SearchUserService', 'AddFriendService', 'NotificationService',
	function ($scope, $timeout, $interval, $window, $location,
		ViewMsg, MainImageService, SearchUserService, AddFriendService, NotificationService) {
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
		
		// notification queue
		$scope.notifQueue = [];

		var socket = io.connect();
		socket.on('private message', function (data) {
			if (data.friend === LoggedIn.name) {
				$scope.notifQueue.push(data);
				NotificationService.read({ username: LoggedIn.name, friend: data.friend, user: data.user });
			}
		});

		NotificationService.query({
			username: LoggedIn.name
		}, function (data) {
			if (data.length !== 0) {
				data.forEach(function (notif) {
					if (!notif.readed) {
						$scope.notifQueue.push(notif);
					}
				}, this);
			}
		});

		MainImageService.query({
			username: LoggedIn.name
		}, function (data) {
			if (data.length !== 0) {
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
				$timeout(function () {
					$scope.homepageMode = 1;
					// console.log($scope.userFriendList)
				}, 500);
			} else if ($scope.homepageMode === 1) {
				$timeout(function () {
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
			AddFriendService.update({ username: LoggedIn.name }, friend);
			$scope.userFriendList.push(friend);
		}

		$scope.clearInput = function () {
			$scope.searchingStr = '';
			clearSearchResults($scope.results);
		}

		function clearSearchResults(results) {
			results.splice(0, results.length);
		}

		$scope.jumpToFriendPage = function (friendName) {
			$location.path('/home/friend/' + friendName);
		}

		$scope.jumpToMsg = function (friendName, username) {
			ViewMsg.viewMsg = true;
			NotificationService.read({ username: LoggedIn.name, friend: friendName, user: username });
			$location.path('/home/friend/' + friendName);
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

		function readImages(imgFiles) {
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
			if ($scope.editing) {
				if (!file.img.selected) {
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
			if ($scope.removeUploadQueue !== null) {
				$scope.removeUploadQueue.forEach(function (img) {
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

				$scope.uploadQueue.upload.success(function (data, status, headers, config) {
					$scope.uploadQueue.splice(0, $scope.uploadQueue.length);
					// $scope.uploading = false;
					console.log(data);
				});
			}
		}

		$scope.uploadDone = function () {
			$scope.uploading = false;
		}

		function updateProgress(num) {
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

galleryControllers.controller('GalleryCtrl', ['$scope', '$route', '$window', '$location', '$animate', 'GalleryService',
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
			Lightbox.lightboxHeight = Lightbox.lightboxWidth / 1.6;
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
			FavouritePhotoService.update({ username: LoggedIn.name }, $scope.lightImg);
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
 ********************* Friend Page Controller *************************
 */

galleryControllers.controller('FriendPageCtrl', ['$scope', '$route', '$routeParams', '$location',
	 'ViewMsg', 'GetFriendInfoService', 'GetFriendPhotoService', 'GetFriendMessageService', 'NotificationService',
	 function ($scope, $route, $routeParams, $location,
		ViewMsg, GetFriendInfoService, GetFriendPhotoService, GetFriendMessageService, NotificationService) {

		$scope.galleryQueue = [];
		$scope.messages = [];
		// $scope.friend = $routeParams.friendname;
		var messageContent = "";
		var msg_each = "";

		var socket = io.connect();
		socket.on('private message', function (data) {
			if (data.friend === LoggedIn.name) {
				newFriendMessage(data);
				// NotificationService.read({username: LoggedIn.name, friend: friendName});
			}
		});

		$scope.messageDialog = function () {
			angular.element('.message-content').empty();
			messageContent = "";
			GetFriendMessageService.query({
				username: LoggedIn.name,
				friendname: $routeParams.friendname
			}, function (messages) {
				messages.forEach(function (msg) {
					if (msg.user === LoggedIn.name && msg.friend === $routeParams.friendname) {
						msg_each = '<li class="col-xs-12"><div class="tooltip user-message col-xs-5 col-xs-offset-6" role="tooltip"><div class="tooltip-inner">' + msg.message
						+ '</div></div><span class="col-xs-1"><img class="img-circle" width="45px" height="45px" src="' + LoggedIn.userPhoto + '"></span></li>'
					} else {
						msg_each = '<li class="col-xs-12"><span class="col-xs-1"><img class="img-circle" width="45px" height="45px" src="' + $scope.friendProfilePhoto
						+ '"></span><div class="tooltip friend-message col-md-5 col-xs-9" role="tooltip"><div class="tooltip-inner">' + msg.message + '</div></div></li>'
					}
					messageContent = messageContent.concat(msg_each);
				}, this);
				angular.element('.message-content').append(messageContent);
				var messageBody = angular.element('.message-body');
				messageBody.scrollTop(messageBody.scrollHeight);
				// console.log(messageBody.scscrollHeight);
			});
		}

		$scope.sendMessage = function (message) {
			var date = Date();
			var msg = { message: message, date: date, user: LoggedIn.name, friend: $routeParams.friendname };
			newUserMessage(msg);
			socket.emit('message', msg);
			$scope.messageInput = "";
		}

		GetFriendInfoService.query({
			username: LoggedIn.name,
			friendname: $routeParams.friendname
		}, function (friend) {
			$scope.friendProfilePhoto = friend[0].profilePhotoUrl.replace('_normal', '_400x400');
			$scope.friendName = friend[0].name;
			$scope.friendLocation = friend[0].location;
			$scope.friendDescription = friend[0].description;
			if (ViewMsg.viewMsg) {
				$scope.messageDialog();
				angular.element('#messageModal').modal('show');
				ViewMsg.viewMsg = false;
			}
		});

		GetFriendPhotoService.query({
			username: LoggedIn.name,
			friendname: $routeParams.friendname
		}, function (photos) {
			for (var i = 0; i < photos.length; i++) {
				$scope.galleryQueue.push(photos[i]);
			}
		});


		function newUserMessage(msg) {
			msg_each = '<li class="col-xs-12"><div class="tooltip user-message col-xs-5 col-xs-offset-6" role="tooltip"><div class="tooltip-inner">' + msg.message + '</div></div><span class="col-xs-1"><img class="img-circle" width="45px" height="45px" src="' + LoggedIn.userPhoto + '"></span></li>'
			angular.element('.message-content').append(msg_each);
		}

		function newFriendMessage(msg) {
			msg_each = '<li class="col-xs-12"><span class="col-xs-1"><img class="img-circle" width="45px" height="45px" src="' + $scope.friendProfilePhoto + '"></span><div class="tooltip friend-message col-xs-5" role="tooltip"><div class="tooltip-inner">' + msg.message + '</div></div></li>'
			angular.element('.message-content').append(msg_each);
		}
		
		$scope.jumpToEditPage = function (image) {
			$location.path('/home/friend/' + $routeParams.friendname + '/editing/' + image.img._id);
		}
	}
]);

galleryControllers.controller('EditImageCtrl', ['$scope', '$route', '$routeParams', '$location', '$window',
	function ($scope, $route, $routeParams, $location, $window) {
		
		$scope.brushWidth = 5; //default brush width
		$scope.brushColor = '#00ff00'; //default brush color
		$scope.imgEditing = false;
		
		//initiate canvas
		var canvas = new fabric.Canvas('c', {
			isDrawingMode: true
		});
		canvas.freeDrawingBrush = new fabric['PencilBrush'](canvas);
		canvas.freeDrawingBrush.color = $scope.brushColor;
		canvas.freeDrawingBrush.width = $scope.brushWidth;
		// fabric.Image.fromURL('../uploads/mediumThumbnails/13e43ee756098bd38dacc08b49625278.jpg', function(oImg) {
		// 	oImg.scale(0.5);
		// 	canvas.add(oImg);
		// });
		var src = '../uploads/mediumThumbnails/26768c5204486bcc5ac1c8511e3ec085.JPG';
		var img = new Image();
		img.src = src;
		console.log(img.width);
		canvas.setWidth(img.width/2);
		canvas.setHeight(img.height/2);
		canvas.setBackgroundImage(src, canvas.renderAll.bind(canvas), {
			// originX: 'center'
			scaleX: 0.5,
			scaleY: 0.5
		});
		
		var hLinePatternBrush = new fabric.PatternBrush(canvas);
    hLinePatternBrush.getPatternSrc = function() {

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext('2d');

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };
		
		var squarePatternBrush = new fabric.PatternBrush(canvas);
    squarePatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 2;

      var patternCanvas = fabric.document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
      var ctx = patternCanvas.getContext('2d');

      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, squareWidth, squareWidth);

      return patternCanvas;
    };

    var diamondPatternBrush = new fabric.PatternBrush(canvas);
    diamondPatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 5;
      var patternCanvas = fabric.document.createElement('canvas');
      var rect = new fabric.Rect({
        width: squareWidth,
        height: squareWidth,
        angle: 45,
        fill: this.color
      });

      var canvasWidth = rect.getBoundingRectWidth();

      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

      var ctx = patternCanvas.getContext('2d');
      rect.render(ctx);

      return patternCanvas;
    };
		
		$scope.clearCanvas = function () {
			canvas.clear();
		}
		
		$scope.changeBrushColor = function (color) {
			canvas.freeDrawingBrush.color = color.brushColor;
		}
		
		$scope.changeBrushWidth = function (width) {
			canvas.freeDrawingBrush.width = parseInt(width.brushWidth, 10) || 1;
		}
		
		angular.element('#drawing-mode-selector').on('change', function() {
			var mode = this.value;
				if (mode === 'hline') {
				canvas.freeDrawingBrush = hLinePatternBrush;
			} else if (mode === 'square') {
				canvas.freeDrawingBrush = squarePatternBrush;
			} else if (mode === 'diamond') {
				canvas.freeDrawingBrush = diamondPatternBrush;
			} else {
				canvas.freeDrawingBrush = new fabric[mode + 'Brush'](canvas);
			}
			canvas.freeDrawingBrush.color = $scope.brushColor;
			canvas.freeDrawingBrush.width = $scope.brushWidth;
		});
		
		$scope.showEditOptions = function () {
			if (!$scope.imgEditing) {
				$scope.imgEditing = true;
			} else {
				$scope.imgEditing = false;
			}
		}
		
		$scope.saveCanvas = function (e) {
			var a = canvas.toDataURL({
        format: 'jpg',
        quality: 0.2
			});
			// var a = canvas.toObject();
			console.log(a);
			this.download = 'test.png'
		}
	}
]);