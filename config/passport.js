var passport = require('passport');
var TwitterStrategy = require('passport-twitter');
var mongoose = require('mongoose');
var User = mongoose.model("User"); 

module.exports = function(config, passport) {
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		done(null, user);
	});

	passport.use(new TwitterStrategy({
			consumerKey: config.twitter.consumerKey,
			consumerSecret: config.twitter.consumerSecret,
			callbackURL: config.twitter.callbackURL
		},
		function(token, tokenSecret, profile, done) {
			User.checkUser(profile.username, function(err, user){
				if (err) {
					return done(err);
				}
				else {
					if (user === null) {
						console.log('create a new user~~~~~~~~~~~~~~~~~~~~~');
						User.createUser(profile, function(err, user) {
							if (err) {
								return done(err);	
							}
						});
						return done(null, profile);
					} else {
						console.log('-------------------this user already exsit');
						return done(null, profile);
					}
				}
			});
		}
	));

};