var galleryAnimations = angular.module('galleryAnimations', ['ngAnimate']);

// ------------- animation for home page ----------------

galleryAnimations.animation('.home-slider', function () {
	return {
		addClass: function (element, className, done) {
			if (className === 'sliderhide') {
				element.animate({
						opacity: 0
					}, 1000, done);
			} else if (className === 'sliderleft50') {
				element.animate({
					left: -50
				}, 1000, done);
			} else if (className === 'sliderleft100'){
				element.animate({
					left: -100
				}, 1000, done);
			} else {
				done();
			}
		},
		removeClass: function (element, className, done) {
			if (className === 'sliderhide') {
				element.css('opacity', 0)

				element.animate({
					opacity: 1
				}, 1000, done);

				return function (cancel) {
					if (cancel) {
						element.stop();
					}
				};
			}
		}
	}
});

// ---------- animation for upload page -----------

galleryAnimations.animation('.upload-img-preview', function() {
	return {
		addClass: function (element, className, done) {
			if (className === 'editing') {
				element.animate({
					borderWidth: 5,
				}, 500, done);
			} else {
				done();
			};
		},
		removeClass: function (element, className, done) {
			if (className === 'editing') {
				element.animate({
					borderWidth: 0,
				}, 500, done);

				return function (cancel) {
					if (cancel) {
						element.stop();
					}
				}
			}
		}
	}
});

galleryAnimations.animation('.upload-img-preview-mask', function() {
	return {
		addClass: function (element, className, done) {
			if (className === 'selected') {
				element.animate({
					opacity: 1
				}, 500, done);
			} else {
				done();
			};
		},
		removeClass: function (element, className, done) {
			if (className === 'selected') {
				element.animate({
					opacity: 0
				}, 500, done);
			} else {
				done();
			};
		}
	}
});

galleryAnimations.animation('.light-image', ['Lightbox', function (Lightbox) {
	return {
		addClass: function (element, className, done) {
			if (className === 'show') {
				element.animate({
					width: Lightbox.lightboxWidth,
					height: Lightbox.lightboxHeight,
					top: Lightbox.lightboxY,
					left: Lightbox.lightboxX,
					opacity: 1,
					display: 1
				}, 500, done);
			} else {
				done();
			};
		},
		removeClass: function (element, className, done) {
			if (className === 'show') {
				element.animate({
					width: Lightbox.originalImgWidth,
					height: Lightbox.originalImgHeight,
					top: Lightbox.originalImgY,
					left: Lightbox.originalImgX,
					opacity: 0,
					display: 0
				}, 500, done);
			} else {
				done();
			}
		}
	}	
}]);

galleryAnimations.animation('.drawing-mode-options', function() {
	return {
		addClass: function (element, className, done) {
			if (className === 'editing') {
				element.animate({
					bottom: 50,
					opacity: 1
				}, 500, done);
			} else {
				done();
			};
		},
		removeClass: function (element, className, done) {
			if (className === 'editing') {
				element.animate({
					bottom: -140,
					opacity: 0
				}, 500, done);
			} else {
				done();
			};
		}
	}
});

galleryAnimations.animation('.view-slide-in', function () {
	return {
		enter: function (element, done) {
			element.css({
				opacity: 0
			}).
			animate({
				opacity: 1
			}, 1000, done);
		},
		leave: function (element, done) {
			element.css({
				opacity: 1
			}).
			animate({
				opacity: 0
			}, 1000, done)
		}
	};
});