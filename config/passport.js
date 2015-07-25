var passport = require('passport');
var TwitterStrategy = require('passport-twitter');

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
			return done(null, profile);
		}
	));

};