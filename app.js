var express = require('express');
var config = require('./config/config');
var fs = require('fs');
var mongoose = require('mongoose');
var passport = require('passport');

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/perGallery';
mongoose.connect(mongoUri);

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err);
});

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  connect();
});

var models_path = __dirname + '/models';
    fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')) require(models_path + '/' + file);
});

var app = express();

require('./config/passport') (config, passport);

require('./config/express')(app, config, passport);

module.exports = app;