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
			$interval(mainImageAnimate, 5000);
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
				NotificationService.read({ 
					username: LoggedIn.name
				}, { from_user: $routeParams.friendname, to_user: LoggedIn.name});
				newFriendMessage(data);
			}
		});
		
		$scope.reloadFriPage = function () {
			$route.reload();
		}

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
	'EditPhotoService',
	function ($scope, $route, $routeParams, $location, $window, EditPhotoService) {
		
		$scope.brushWidth = 5; //default brush width
		$scope.brushColor = '#00ff00'; //default brush color
		$scope.imgEditing = false;
		var friendname = $routeParams.friendname;
		var photo_id = $routeParams.photo_id;
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
			imgBase64 = canvas.toDataURL().replace(/^data:image\/png;base64,/,'');
			EditPhotoService.save({
				username: LoggedIn.name,
				friendname: friendname,
				photo_id: photo_id 
			}, {data: imgBase64});
			angular.element('#editedAlert').show();
		}
		
		$scope.editedBack = function () {
			$window.history.back();
		}
	}
]);

// --------------------------- Combine Controller ----------------------------------

galleryControllers.controller('CombineCtrl', ['$scope', '$route', '$routeParams', '$location', '$window',
	'GalleryService', 'CombineService',
	function ($scope, $route, $routeParams, $location, $window, 
	GalleryService, CombineService) {
		$scope.logginUser = LoggedIn.name;
		$scope.currentUser = LoggedIn.name;
		$scope.userProfilePhoto = LoggedIn.userPhoto;
		$scope.user_friends = LoggedIn.friends;
		
		// modalModel 0 is choose img to make source
		// modalModel 1 is choose background
		// modalModel 2 is choose adding img
		$scope.modalModel;
		
		// combine category 1 is puzzle
		// combine category 2 is free cut
		$scope.combineCate = 0;
		
		// cut area 1 is rect
		// cut area 2 is circle
		$scope.cut_area = 0;
		$scope.modalImgs = [];
		$scope.originalImgs = [];
		
		$scope.combineOpts = {
			category: 'Puzzle'
		};
		$scope.puzzle_lv = 3;
		var puzzle_net = [];
		var puzzle_block = [];
		var cutObject; // original image for cutting
		var ca; // cut area 
		var cLeft, cTop, cWidth, cHeight, oWidth, oHeight, cRadius;
		
		//initiate canvas
		var canvas = new fabric.Canvas('c', {
			allowTouchScrolling: true
		});
		
		$scope.chooseSource = function () {
			$scope.modalImgs.splice(0, $scope.modalImgs.length);
			$scope.modalModel = 0;
			GalleryService.query({
				username: LoggedIn.name,
				skip: 0
			}, function (imgs) {
				imgs.forEach(function(element) {
					if (element.extension !== 'MP4') {
						element.isSelected = false;
						$scope.modalImgs.push(element);
					}
				}, this);
				angular.element('#combineModal').modal('show');
			});
		}
		
		$scope.pickBackground = function () {
			$scope.modalImgs.splice(0, $scope.modalImgs.length);
			$scope.originalImgs.splice(0, $scope.originalImgs.length);
			$scope.modalModel = 1;
			getAllSourceImages(LoggedIn.name, LoggedIn.name);
		}
		
		$scope.pickMoreImages = function () {
			$scope.modalImgs.splice(0, $scope.modalImgs.length);
			$scope.originalImgs.splice(0, $scope.originalImgs.length);
			$scope.modalModel = 2;
			getAllSourceImages(LoggedIn.name, LoggedIn.name);
		}
		
		function makeFileName()
		{
				var text = "";
				var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		
				for( var i=0; i < 5; i++ )
						text += possible.charAt(Math.floor(Math.random() * possible.length));
		
				return text;
		}

		$scope.changeUser = function (name) {
			$scope.modalImgs.splice(0, $scope.modalImgs.length);
			$scope.originalImgs.splice(0, $scope.originalImgs.length);
			$scope.currentUser = name;
			if ($scope.modalModel === 0) {
				GalleryService.query({
					username: name,
					skip: 0
				}, function (imgs) {
					imgs.forEach(function(element) {
						if (element.extension !== 'MP4') {
							element.isSelected = false;
							$scope.modalImgs.push(element);
						}
					}, this);
				});
			} else {
				getAllSourceImages(LoggedIn.name, name);
			}
		}
		
		function getAllSourceImages (username, to_user) {
			CombineService.query({
				username: username,
				to_user: to_user,
				category: 'source'
			}, function(imgs) {
				imgs.forEach(function(element) {
					if (element.extension !== 'MP4') {
						element.isSelected = false;
						$scope.modalImgs.push(element);
					}
				}, this);
			});
			GalleryService.query({
				username: to_user,
				skip: 0
			}, function (data) {
				data.forEach(function(element) {
					if (element.extension !== 'MP4') {
						element.isSelected = false;
						$scope.originalImgs.push(element);
					}
				}, this);
				angular.element('#combineModal').modal('show');
			});
		}
		
		$scope.toggleEditedImg = function () {
			angular.element('#collapseOne').collapse('toggle');
		}
		$scope.toggleOriginalImg = function () {
			angular.element('#collapseTwo').collapse('toggle');
		}
		
		$scope.selectSourceImg = function (image) {
			if ($scope.sourceImg) {
				$scope.sourceImg.isSelected = false;
			}
			$scope.sourceImg = image.img;
			$scope.sourceImg.isSelected = true;
		}
		
		$scope.addSource = function () {
			if ($scope.combineOpts.category === 'Free Cut') {
				$scope.combineCate = 2;
				fabric.Image.fromURL($scope.sourceImg.thumbpath.mediumThumb, function(oImg) {
					canvas.setWidth(oImg.width/2);
					canvas.setHeight(oImg.height/2);
					oImg.scale(0.5);
					oImg.selectable = false;
					canvas.add(oImg);
					angular.element('#combineModal').modal('hide');
					cutObject = canvas.item(0);
				});
			} else if ($scope.combineOpts.category === 'Puzzle') {
				$scope.combineCate = 1;
				var src = $scope.sourceImg.thumbpath.mediumThumb;
				var img = new Image();
				img.src = src;
				img.onload = function () {
					canvas.setWidth(img.width/2);
					canvas.setHeight(img.height/2);
					canvas.setBackgroundImage(src, canvas.renderAll.bind(canvas), {
						scaleX: 0.5,
						scaleY: 0.5
					});
					addPuzzleNet($scope.puzzle_lv);
					canvas.on('mouse:down', function(options) {
						drawWhiteRect (options.e.offsetX, options.e.offsetY, $scope.puzzle_lv);
					});
					angular.element('#combineModal').modal('hide');
				}
				
			}
		}
		
		$scope.addBackground = function () {
			if ($scope.sourceImg.category) {
				var src = $scope.sourceImg.path;
				var img = new Image();
				img.src = src;
				img.onload = function () {
				console.log($scope.sourceImg);
					canvas.setWidth(img.width);
					canvas.setHeight(img.height);
					canvas.setBackgroundImage(src, canvas.renderAll.bind(canvas), {
						scaleX: 1,
						scaleY: 1
					});
					angular.element('#combineModal').modal('hide');
				}
			} else {
				src = $scope.sourceImg.thumbpath.mediumThumb;
				img = new Image();
				img.src = src;
				img.onload = function () {
					canvas.setWidth(img.width/2);
					canvas.setHeight(img.height/2);
					canvas.setBackgroundImage(src, canvas.renderAll.bind(canvas), {
						scaleX: 0.5,
						scaleY: 0.5
					});
					angular.element('#combineModal').modal('hide');
				}
			}
		}
		
		$scope.addImages = function () {
			if ($scope.sourceImg.category) {
				fabric.Image.fromURL($scope.sourceImg.path, function(oImg) {
					canvas.add(oImg);
				});
			} else {
				fabric.Image.fromURL($scope.sourceImg.thumbpath.lowThumb, function(oImg) {
					canvas.add(oImg);
				});
			}
			angular.element('#combineModal').modal('hide');
		}
		
		/**
		 * puzzle funtions
		 */
		
		$scope.subPuzzleNet = function () {
			$scope.puzzle_lv -= 1;
			console.log($scope.puzzle_lv);
			clearPuzzle(puzzle_net, puzzle_block);
			puzzle_net.splice(0, puzzle_net.length);
			addPuzzleNet($scope.puzzle_lv);
		}
		
		$scope.addPuzzleNet = function () {
			$scope.puzzle_lv += 1;
			clearPuzzle(puzzle_net, puzzle_block);
			puzzle_net.splice(0, puzzle_net.length);
			addPuzzleNet($scope.puzzle_lv);
		}
		
		function addPuzzleNet (level) {
			canvas.isDrawingMode = false;
			// each block size of canvas
			var bWidth = canvas.getWidth() / level;
			var bHeight = canvas.getHeight() / level;
			var mid_count = (2*level - 2)/2;
			for (var index = 1; index <= 2 * level - 2; index++) {
				if (index - mid_count <= 0)  {
					puzzle_net.push(makeLine([0 , bHeight * index, canvas.getWidth(), bHeight * index]));
				} else {
				  puzzle_net.push(makeLine([bWidth * (index - mid_count) , 0, bWidth * (index - mid_count), canvas.getHeight()]));
				}
			}
			drawPuzzle(puzzle_net);
		}
		
		function drawPuzzle (puzzle) {
			puzzle.forEach(function(element) {
				canvas.add(element);
			}, this);
			canvas.renderAll();
		}
		
		function clearPuzzle (puzzleNet, puzzleBlock) {
			puzzleNet.forEach(function(element) {
				canvas.remove(element);
			}, this);
			puzzleBlock.forEach(function(element) {
				canvas.remove(element);
			}, this);
			canvas.renderAll();
		}
		
		function clearPuzzleNet (puzzleNet) {
			puzzleNet.forEach(function(element) {
				canvas.remove(element);
			}, this);
			canvas.renderAll();
		}
		
		function makeLine (coords) {
			return new fabric.Line(coords, {
				stroke: 'white',
				strokeWidth: 1,
				selectable: false
			});
		}
		
		function drawWhiteRect (x, y, level) {
			var bWidth = canvas.getWidth() / level;
			var bHeight = canvas.getHeight() / level;
			var indexX = Math.floor(x/bWidth);
			var indexY = Math.floor(y/bHeight);
			var block = addRect(bWidth * indexX, bHeight * indexY, bWidth, bHeight);
			puzzle_block.push(block);
			canvas.add(block);
		}
		
		function addRect (left, top, width, height) {
			var rect = new  fabric.Rect({
				left: left,
				top: top,
				fill: 'white',
				borderColor: 'white',
				width: width,
				height: height,
				selectable: false
			});
			return rect;
		}
		
		/**
		 * cuting funcations
		 */
		$scope.addRectCut = function () {
			$scope.cut_area = 1;
			ca = new fabric.Rect({
				fill: 'rgba(0,0,0,0.3)',
				originX: 'left',
				originY: 'top',
				stroke: 'red',
				strokeDashArray: [2, 2],
				opacity: 1,
				width: 400,
				height: 400,
				borderColor: '#36fd00',
				cornerColor: 'green',
				hasRotatingPoint: false
			});
			canvas.add(ca);	
		}
		
		$scope.addCircleCut = function () {
			$scope.cut_area = 2;
			ca = new fabric.Circle({
				fill: 'rgba(0,0,0,0.3)',
				originX: 'left',
				originY: 'top',
				stroke: 'red',
				strokeDashArray: [2, 2],
				opacity: 1,
				radius: 100,
				borderColor: '#36fd00',
				cornerColor: 'green'
			});
			canvas.add(ca);	
		}
		
		$scope.cutImg = function () {
			if ($scope.cut_area === 1) {
				ca = canvas.getActiveObject();
				cLeft = ca.get('left');
				cTop = ca.get('top');
				cWidth = ca.get('width') * ca.get('scaleX');
				cHeight = ca.get('height') * ca.get('scaleY');
				oWidth = cutObject.get('width');
				oHeight = cutObject.get('height');
				cutObject.clipTo = function (ctx) {
					ctx.rect((cLeft*2 - oWidth/2), (cTop*2 - oHeight/2), cWidth*2, cHeight*2);
				}
			} else if ($scope.cut_area === 2) {
				console.log(cutObject);
				ca = canvas.getActiveObject();
				console.log(ca);
				cLeft = ca.get('left');
				cTop = ca.get('top');
				cRadius = ca.get('radius') * ca.get('scaleX')*2;
				oWidth = cutObject.get('width');
				oHeight = cutObject.get('height');
				cutObject.clipTo = function (ctx) {
					ctx.arc((cLeft*2 - oWidth/2) + cRadius, (cTop*2 - oHeight/2) + cRadius, cRadius, 0, 2 * Math.PI);
				}
			}
			canvas.remove(ca);
			canvas.renderAll();
		}
		
		$scope.saveImg = function () {
			var imgBase64;
			if ($scope.modalModel === 0) {
				if ($scope.combineCate === 1) {
					clearPuzzleNet(puzzle_net);
					imgBase64 = canvas.toDataURL().replace(/^data:image\/png;base64,/,'');
					CombineService.save({
						username: LoggedIn.name,
						name: makeFileName(),
						category: 'source',
						to_user: LoggedIn.name,
						path: '/uploads/combineSource/'
					}, {data: imgBase64});
				} else if($scope.combineCate === 2) {
					imgBase64 = canvas.toDataURL().replace(/^data:image\/png;base64,/,'');
					CombineService.save({
						username: LoggedIn.name,
						name: makeFileName(),
						category: 'source',
						to_user: LoggedIn.name,
						path: '/uploads/combineSource/'
					}, {data: imgBase64});
				}
				angular.element('#sourceAlert').show();
				$scope.combineCate = 0;
			} else if ($scope.modalModel === 2) {
				imgBase64 = canvas.toDataURL().replace(/^data:image\/png;base64,/,'');
				CombineService.save({
					username: LoggedIn.name,
					name: makeFileName(),
					category: 'image',
					to_user: LoggedIn.name,
					path: '/uploads/combineImgs/'
				}, {data: imgBase64});
				angular.element('#saveAlert').show();
			}
		}
		
		$scope.goBack = function () {
			$window.history.back();
		}
	}
]);