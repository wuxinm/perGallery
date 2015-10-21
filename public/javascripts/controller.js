/* global fabric */
/* global io */
/// <reference path="../../typings/angularjs/angular.d.ts"/>
/* global LoggedIn */
'use strict'

var galleryControllers = angular.module('galleryControllers', []);

galleryControllers.controller('HomeCtrl', ['$scope', '$timeout', '$interval', '$window', '$location',
	'ViewMsg', 'MainImageService', 'SearchUserService', 'AddFriendService', 'NotificationService', 
	'SentImgCommentService', 'ImgCommentService',
	function ($scope, $timeout, $interval, $window, $location,
		ViewMsg, MainImageService, SearchUserService, AddFriendService, NotificationService, 
		SentImgCommentService, ImgCommentService) {
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
		
		// feedback
		var inputTarget;
		$scope.feedback = '';
		$scope.imgComments = [];

		var socket = io.connect();
		socket.on('new notif', function (data) {
			if (data.to_user === LoggedIn.name) {
				var notif = $scope.notifQueue.filter(function (obj) {
					if (data.category === 'feedback_notif') {
						return obj.img_comm_id === data.img_comm_id;	
					} else if (data.category === 'chatMsg_notif') {
						return obj.from_user === data.from_user && obj.category === 'chatMsg_notif';
					}
				});
				console.log(notif);
				if (notif.length !== 0) {
					notif[0].count ++;
				} else {
					// notif[0].count = 1;
					$scope.notifQueue.push(data);
				}
			}
		});

		NotificationService.query({
			username: LoggedIn.name
		}, function (data) {
			if (data.length !== 0) {
				data.forEach(function (notif) {
					$scope.notifQueue.push(notif);
				}, this);
			}
		});
		
		SentImgCommentService.query({
			username: LoggedIn.name
		}, function (comments) {
			comments.forEach(function(comm) {
				$scope.imgComments.push(comm);
			}, this);
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

		$scope.jumpToNotif = function (notif) {
			console.log(notif);
			NotificationService.read({
				username: LoggedIn.name,
				id: notif._id
			});
			if (notif.category === 'feedback_notif') {
				var index = $scope.notifQueue.indexOf(notif);
				$scope.notifQueue.splice(index, 1);
				ImgCommentService.query({
					username: LoggedIn.name,
					img_comm_id: notif.img_comm_id
				}, function (data) {
					console.log(data);
					$scope.editedImg = data[0];
					angular.element('#editedImgModal').modal('show');
				});
			} else if (notif.category === 'chatMsg_notif') {
				ViewMsg.viewMsg = true;
				// NotificationService.read({ 
				// 	username: LoggedIn.name
				// }, { friend: notif.from_user, user: LoggedIn.name });
				$location.path('/home/friend/' + notif.from_user);
			}
		}
		
		$scope.clearFeedbackInput = function (event) {
			event.target.value = '';
			event.target.style.color = 'black';
		}
		
		$scope.storeInputValue = function (event) {
			inputTarget = event;
			$scope.feedback = event.target.value;
		}
		
		$scope.sendFeedback = function (comm) {
			if ($scope.feedback === '') {
				console.log('empty msg')
			} else {
				var fb = { 
					from_user: LoggedIn.name, 
					feedback: $scope.feedback 
				};
				ImgCommentService.addComment({
					username: LoggedIn.name,
					img_comm_id: comm._id
				}, fb);
				comm.comments.push(fb);	
				
				var fb_notif = { 
					category: 'feedback_notif',
					img_comm_id: comm._id,
					date: Date.now(), 
					from_user: LoggedIn.name, 
					to_user:  comm.to_user
				}
				socket.emit('notif', fb_notif);
				console.log(inputTarget);
				inputTarget.target.value = 'Send feedback...';
				inputTarget.target.style.color = '#9d9d9d';
			}
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
	'Lightbox', 'FavouritePhotoService', 'ShowFavouriteService', 'RemoveImageService', 'GalleryCombineService',
	'GalleryVideoService',
	function ($scope, $route, $window, $location, $animate, GalleryService, Lightbox, FavouritePhotoService
		, ShowFavouriteService, RemoveImageService, GalleryCombineService,
		GalleryVideoService) {
		$scope.galleryQueue = [];
		$scope.imgSelected = false;
		$scope.lightImgSrc;
		$scope.allphotos = true;
		$scope.gallerySearching = false;
		$scope.combineImgs = [];
		$scope.videos = [];

		var skip = 0;

		$scope.loadMoreImgs = function () {
			GalleryService.query({
				username: LoggedIn.name,
				skip: skip
			}, function (data) {
					console.log(data);
				for (var i = 0; i < data.length; i++) {
					if (data[i].extension === 'MP4') {
						console.log('why');
						$scope.videos.push(data[i]);
					} else {
						$scope.galleryQueue.push(data[i]);
					}
				};
				skip += 30;
				console.log($scope.videos);
			});
		}
		
		GalleryCombineService.query({
			username: LoggedIn.name,
			category: 'image'
		}, function (combineImgs) {
			combineImgs.forEach(function(element) {
				$scope.combineImgs.push(element);
			}, this);
		});

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
		
		$scope.searchVideo = function () {
			GalleryVideoService({
				username: LoggedIn.name
			}, function(videos) {
				videos.forEach(function(element) {
					$scope.videos.push(element);
				}, this);
			});
		}

		$scope.showImg = function (image, $event) {
			console.log(image.img);
			Lightbox.lightboxWidth = $window.innerWidth * 0.7;
			Lightbox.lightboxHeight = Lightbox.lightboxWidth / 1.6;
			Lightbox.lightboxX = $window.innerWidth * 0.15;
			Lightbox.originalImgX = angular.element($event.target).prop('x');
			Lightbox.originalImgY = angular.element($event.target).prop('y');
			Lightbox.originalImgWidth = angular.element($event.target).prop('width');
			Lightbox.originalImgHeight = angular.element($event.target).prop('height');

			angular.element('#light-image').css('top', Lightbox.originalImgY);
			angular.element('#light-image').css('left', Lightbox.originalImgX);
			angular.element('#light-image').css('width', Lightbox.originalImgWidth);
			angular.element('#light-image').css('height', Lightbox.originalImgHeight);
			$scope.imgSelected = true;
			$scope.originalImg =  image.img;
			if ($scope.originalImg.category === 'image') {
				$scope.lightImgPath = image.img.path;
			} else {
				$scope.lightImgPath = image.img.thumbpath.mediumThumb;
				$scope.lightImgComments = image.img.commentImgs;
			}
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
				name: $scope.originalImg.name,
			}, function (data) {
				// $location.path('/gallery');
				$route.reload();
			});
		}
		
		$scope.showImgComment = function (image) {
			$scope.lightImgPath = image.img.path;
		}
	}
]);

/**    
 ********************* Friend Page Controller *************************
 */

galleryControllers.controller('FriendPageCtrl', ['$scope', '$route', '$routeParams', '$location',
	 'ViewMsg', 'GetFriendInfoService', 'GetFriendPhotoService', 'GetFriendMessageService', 'NotificationService',
	 'LikeImgCommentService', 'SentImgCommentService', 'ImgCommentService',
	 function ($scope, $route, $routeParams, $location,
		ViewMsg, GetFriendInfoService, GetFriendPhotoService, GetFriendMessageService, NotificationService,
		LikeImgCommentService, SentImgCommentService, ImgCommentService ) {
		
		// friend page show model
		// 0 gallery model
		// 1 sent image comment model
		// 2 received image comment model
		$scope.friendPageModel = 0;
		$scope.galleryQueue = [];
		$scope.videos = [];
		$scope.messages = [];
		$scope.feedback = ''
		$scope.imgComments = [];
		// $scope.friend = $routeParams.friendname;
		var messageContent = "";
		var msg_each = "";
		var liked = false;

		var socket = io.connect();
		socket.on('private message', function (data) {
			if (data.to_user === LoggedIn.name) {
				console.log("test~~~~~");
				NotificationService.read({ 
					username: LoggedIn.name
				}, { from_user: $routeParams.friendname, to_user: LoggedIn.name});
				newFriendMessage(data);
			}
		});

		$scope.messageDialog = function () {
			NotificationService.read({ 
				username: LoggedIn.name
			}, { from_user: $routeParams.friendname, to_user: LoggedIn.name});
			angular.element('.message-content').empty();
			messageContent = "";
			GetFriendMessageService.query({
				username: LoggedIn.name,
				friendname: $routeParams.friendname
			}, function (messages) {
				messages.forEach(function (msg) {
					if (msg.from_user === LoggedIn.name && msg.to_user === $routeParams.friendname) {
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
			});
		}

		$scope.sendMessage = function (message) {
			var date = Date();
			var msg = { 
				category: 'chatMsg_notif',
				message: message, 
				date: date, 
				from_user: LoggedIn.name, 
				to_user: $routeParams.friendname 
			};
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
				if (photos[i].extension === 'MP4') {
						$scope.videos.push(photos[i]);
					} else {
						$scope.galleryQueue.push(photos[i]);
					}
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
		
		$scope.friendSentImgComment = function () {
			SentImgCommentService.query({
				username: $routeParams.friendname
			}, function (comments) {
				comments.forEach(function(comm) {
					$scope.imgComments.push(comm);
				}, this);
				$scope.friendPageModel = 1;
			});
		}
		
		$scope.showEditedImg = function (image) {
			liked = false;
			angular.element('#like-button').css('color', 'black');
			$scope.editedImg = image.comm;
			angular.element('#friendImgModal').modal('show');
			LikeImgCommentService.query({
				username: LoggedIn.name,
				friendname: $routeParams.friendname,
				img_comm_id: image.comm._id
			}, function(likeuser) {
				if (likeuser.length !== 0) {
					liked = true;
					angular.element('#like-button').css('color', 'red');
				}
			});
			// angular.element('#editedImgModal').modal('show');
		}
		
		$scope.clearFeedbackInput = function () {
			angular.element('#comment-input')[0].value = '';
				angular.element('#comment-input').css('color', 'black');
		}
		
		$scope.storeInputValue = function (event) {
			$scope.feedback = event.target.value;
		}
		
		$scope.sendFeedback = function (comm) {
			if ($scope.feedback === '') {
				console.log('empty msg');
			} else {
				var fb = {
					from_user: LoggedIn.name,
					feedback: $scope.feedback
				};
				ImgCommentService.addComment({
					username: LoggedIn.name,
					img_comm_id: comm._id
				}, fb);
				comm.comments.push(fb);	
				var fb_notif = { 
					category: 'feedback_notif',
					img_comm_id: comm._id,
					date: Date.now(), 
					from_user: LoggedIn.name, 
					to_user:  comm.from_user
				}
				socket.emit('notif', fb_notif);
				$scope.feedback = '';
				console.log(angular.element('#comment-input'));
				angular.element('#comment-input')[0].value = 'Send feedback...';
				angular.element('#comment-input').css('color', '#9d9d9d');
			}
		}
		
		$scope.likeThisImg = function (comm) {
			if (liked) {
				console.log('You already liked this image');
			} else {
				liked = true;
				angular.element('#like-button').css('color', 'red');
				comm.like_user.push(LoggedIn.name);
				LikeImgCommentService.likeImg({
					username: LoggedIn.name,
					friendname: $routeParams.friendname,
					img_comm_id: comm._id
				});
			}
		}
		
		$scope.friendCombineImages = function () {
			
		}
	}
]);

// --------------------------- Edit Controller ----------------------------------

galleryControllers.controller('EditImageCtrl', ['$scope', '$route', '$routeParams', '$location', '$window',
	'EditPhotoService', 'UploadCombineService',
	function ($scope, $route, $routeParams, $location, $window, EditPhotoService, UploadCombineService) {
		
		$scope.brushWidth = 5; //default brush width
		$scope.brushColor = '#00ff00'; //default brush color
		$scope.imgEditing = false;
		$scope.cutting = false;
		var friendname = $routeParams.friendname;
		var photo_id = $routeParams.photo_id;
		var line1, line2, line3, line4;
		var imgBase64;
		
		//initiate canvas
		var canvas = new fabric.Canvas('c', {
			isDrawingMode: true,
			allowTouchScrolling: true
		});
		
		canvas.freeDrawingBrush = new fabric['PencilBrush'](canvas);
		canvas.freeDrawingBrush.color = $scope.brushColor;
		canvas.freeDrawingBrush.width = $scope.brushWidth;
				
		EditPhotoService.query({
			username: LoggedIn.name,
			friendname: friendname,
			photo_id: photo_id 
		}, function (photo) {
			var src = photo[0].thumbpath.mediumThumb;
			var img = new Image();
			img.src = src;
			img.onload = function () {
				canvas.setWidth(img.width/2);
				canvas.setHeight(img.height/2);
				canvas.setBackgroundImage(src, canvas.renderAll.bind(canvas), {
					scaleX: 0.5,
					scaleY: 0.5
				});
			}
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
		
		$scope.saveCanvas = function () {
			if ($scope.cutting) {
				canvas.remove(line1, line2, line3, line4);
				angular.element('#editedAlert').show();
				imgBase64 = canvas.toDataURL().replace(/^data:image\/png;base64,/,'');
				UploadCombineService.save({
					username: LoggedIn.name,
					photo_id: photo_id,
					category: 'background'
				}, {data: imgBase64});
			} else {
				imgBase64 = canvas.toDataURL().replace(/^data:image\/png;base64,/,'');
				EditPhotoService.save({
					username: LoggedIn.name,
					friendname: friendname,
					photo_id: photo_id 
				}, {data: imgBase64});
				angular.element('#editedAlert').show();
			}
		}
		
		function makeLine(coords) {
			return new fabric.Line(coords, {
				stroke: 'white',
				strokeWidth: 1,
				selectable: false
			});
		}		
		
		$scope.cutCanvas = function () {
			canvas.isDrawingMode = false;
			$scope.cutting = true;
			line1 = makeLine([ 0, canvas.getHeight()/3, canvas.getWidth(), canvas.getHeight()/3 ]),
			line2 = makeLine([ 0, canvas.getHeight()*2/3, canvas.getWidth(), canvas.getHeight()*2/3 ]),
			line3 = makeLine([ canvas.getWidth()/3, 0, canvas.getWidth()/3 , canvas.getHeight()]),
			line4 = makeLine([ canvas.getWidth()*2/3, 0, canvas.getWidth()*2/3, canvas.getHeight() ]);
			
			canvas.add(line1, line2, line3, line4);
			
		}
		
		$scope.cutImg1 = function () {
			var rect = cutImg(0, 0);
			angular.element('#canvas-cut-button1').css('display', 'none');
			canvas.add(rect);
		}
		$scope.cutImg2 = function () {
			var rect = cutImg(canvas.getWidth()/3, 0);
			angular.element('#canvas-cut-button2').css('display', 'none');
			canvas.add(rect);
		}
		$scope.cutImg3 = function () {
			var rect = cutImg(canvas.getWidth()/3*2, 0);
			angular.element('#canvas-cut-button3').css('display', 'none');
			canvas.add(rect);
		}
		$scope.cutImg4 = function () {
			var rect = cutImg(0, canvas.getHeight()/3);
			angular.element('#canvas-cut-button4').css('display', 'none');
			canvas.add(rect);
		}
		$scope.cutImg5 = function () {
			var rect = cutImg(canvas.getWidth()/3, canvas.getHeight()/3);
			angular.element('#canvas-cut-button5').css('display', 'none');
			canvas.add(rect);
		}
		$scope.cutImg6 = function () {
			var rect = cutImg(canvas.getWidth()/3*2, canvas.getHeight()/3);
			angular.element('#canvas-cut-button6').css('display', 'none');
			canvas.add(rect);
		}
		$scope.cutImg7 = function () {
			var rect = cutImg(0, canvas.getHeight()/3*2);
			angular.element('#canvas-cut-button7').css('display', 'none');
			canvas.add(rect);
		}
		$scope.cutImg8 = function () {
			var rect = cutImg(canvas.getWidth()/3, canvas.getHeight()/3*2);
			angular.element('#canvas-cut-button8').css('display', 'none');
			canvas.add(rect);
		}
		$scope.cutImg9 = function () {
			var rect = cutImg(canvas.getWidth()/3*2, canvas.getHeight()/3*2);
			angular.element('#canvas-cut-button9').css('display', 'none');
			canvas.add(rect);
		}
		
		
		function cutImg (left, top) {
			var rect = new fabric.Rect({
				left: left,
				top: top,
				fill: 'white',
				width: canvas.getWidth()/3,
				height: canvas.getHeight()/3,
				selectable: false
			});
			return rect;
		}
		
		$scope.editedBack = function () {
			$window.history.back();
		}
	}
]);


galleryControllers.controller('CombineCtrl', ['$scope', '$route', '$routeParams', '$location', '$window',
	'GalleryService', 'GetCombineService', 'UploadCombineService',
	function ($scope, $route, $routeParams, $location, $window, 
	GalleryService, GetCombineService, UploadCombineService) {
		$scope.backgroundImgs = [];
		$scope.userImgs = [];
		
		//initiate canvas
		var canvas = new fabric.Canvas('c', {
			allowTouchScrolling: true
		});
		
		$scope.pickBackground = function () {
			$scope.backgroundImgs.splice(0, $scope.backgroundImgs.length);
			GetCombineService.query({
				username: LoggedIn.name,
				category: 'background'
			}, function (combineImgs) {
				combineImgs.forEach(function(element) {
					element.isSelected = false;
					$scope.backgroundImgs.push(element);
				}, this);
				angular.element('#combineModal').modal('show');
			});
		}
		
		$scope.selectBgImg = function (image) {
			$scope.backgroundImg = image.img;
			$scope.backgroundImg.isSelected = true;
		}
		
		$scope.createCanvas = function () {
			var src = $scope.backgroundImg.path;
			var img = new Image();
			img.src = src;
			img.onload = function () {
				canvas.setWidth(img.width);
				canvas.setHeight(img.height);
				canvas.setBackgroundImage(src, canvas.renderAll.bind(canvas), {
					scaleX: 1,
					scaleY: 1
				});
				angular.element('#combineModal').modal('hide');
			}
		}
		
		$scope.pickUserImage = function () {
			$scope.userImgs.splice(0, $scope.userImgs.length);
			GalleryService.query({
				username: LoggedIn.name,
				skip: 0
			}, function (data) {
				for (var i = 0; i < data.length; i++) {
					if (data[i].extension !== 'MP4') {
						data[i].isSelected = false;
						$scope.userImgs.push(data[i]);
					}
				};
				angular.element('#imageModal').modal('show');
			});
		}
		
		$scope.selectUserImg = function (image) {
			$scope.userImg = image.img;
			console.log($scope.userImg);
			$scope.userImg.isSelected = true;
		}
		
		$scope.addUserImage = function () {
			fabric.Image.fromURL($scope.userImg.thumbpath.lowThumb, function(oImg) {
				canvas.add(oImg);
			});
			angular.element('#imageModal').modal('hide');
		}
		
		$scope.saveCanvas = function () {
			var imgBase64 = canvas.toDataURL().replace(/^data:image\/png;base64,/,'');
			UploadCombineService.save({
				username: LoggedIn.name,
				photo_id: $scope.userImg._id,
				category: 'image'
			}, {data: imgBase64});
			angular.element('#combineAlert').show();
		}
		
		$scope.goBack = function () {
			$window.history.back();
		}
	}
]);