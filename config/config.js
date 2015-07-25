var path = require('path');
var	rootPath = path.normalize(__dirname + '/..');

module.exports = {
	root: rootPath,
	twitter: {
		consumerKey: 'ffGyIvmkifWyRhiIjNVrGPx0W',
		consumerSecret: 'doa8M1y62gdgaLQF0eiAc4Dpk3nzgvtP6KA7qWNQiwEVpi2cys',
		callbackURL: 'http://localhost:3000/auth/twitter/callback'
	}
};