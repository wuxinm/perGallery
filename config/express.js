/// <reference path="../typings/node/node.d.ts"/>
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

// upload files module
var multer = require('multer'),
    uploading = require('../config/uploading');

// routes
var routes = require('../routes/index');
var users = require('../routes/users');

module.exports = function(app, config, passport) {
    // view engine setup
    app.set('views', path.join(config.root, 'views'));
    app.set('view engine', 'jade');

    // uncomment after placing your favicon in /public
    app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({
        extended: false,
        limit: '50mb'
    }));
    app.use(cookieParser());
    app.use(session({
        secret: 'keyboard cat',
        name: 'sid'
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(path.join(config.root, 'public')));
    app.use(multer({
        dest: './public/uploads',
        onFileUploadStart: function (file) {
            console.log(file.originalname + ' is starting ...');
        },
        onFileUploadData: function (file, data) {
            uploading.setUploadingSize(file.size);
            // console.log('@@ ' + uploading.uploadingSize);
        },
        onFileUploadComplete: function (file) {
            console.log(file.originalname + ' uploaded to  ' + file.path)
        }
    }));

    app.use('/', routes);
    // app.use('/users', users);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            console.log(err);
            // res.render('error', {
            //     message: err.message,
            //     error: err
            // });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err);
        // res.render('error', {
        //     message: err.message,
        //     error: {}
        // });
    });
};