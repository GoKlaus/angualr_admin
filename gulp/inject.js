'use strict';

const { series, task, src, dest } = require('gulp');
var path = require('path');
var conf = require('./conf');
require('./script');
require('./style');
require('./images');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;
var _ = require('lodash');

var browserSync = require('browser-sync');



task('injectAuth', series(task('stylesAuth'), function() {
    return injectAlone({
        css: [path.join('!' + conf.paths.tmp, '/serve/app/vendor.css'), path.join(conf.paths.tmp, '/serve/app/auth.css')],
        paths: [path.join(conf.paths.src, '/auth.html'), path.join(conf.paths.src, '/reg.html')]
    })
}));

task('inject404', series(task('styles404'), function() {
    return injectAlone({
        css: [path.join('!' + conf.paths.tmp, '/serve/app/vendor.css'), path.join(conf.paths.tmp, '/serve/app/404.css')],
        paths: path.join(conf.paths.src, '/404.html')
    })
}));

task('inject-task', series(task('scripts'), task('styles'), task('injectAuth'), task('inject404'), task('copyVendorImages'), function() {
    var injectStyles = src([
        path.join(conf.paths.tmp, '/serve/app/main.css'),
        path.join('!' + conf.paths.tmp, '/serve/app/vendor.css')
    ], { read: false });

    var injectScripts = src([
        path.join(conf.paths.src, '/assets/js/**/*.js'),
        path.join(conf.paths.src, '/app/**/*.module.js'),
        path.join(conf.paths.src, '/app/**/*.js'),
        path.join('!' + conf.paths.src, '/app/**/*.spec.js'),
        path.join('!' + conf.paths.src, '/app/**/*.mock.js'),
    ])
        .on('error', conf.errorHandler('AngularFilesort'));

    var injectOptions = {
        ignorePath: [conf.paths.src, path.join(conf.paths.tmp, '/serve')],
        addRootSlash: false
    };

    return src(path.join(conf.paths.src, '/index.html'))
        .pipe($.inject(injectStyles, injectOptions))
        .pipe($.inject(injectScripts, injectOptions))
        .pipe(wiredep(_.extend({}, conf.wiredep)))
        .pipe(dest(path.join(conf.paths.tmp, '/serve')));
}));

task('inject-reload', series(task('inject-task'), function() {
    browserSync.reload();
}));


var injectAlone = function(options) {
    var injectStyles = src(
        options.css
        , { read: false });

    var injectOptions = {
        ignorePath: [conf.paths.src, path.join(conf.paths.tmp, '/serve')],
        addRootSlash: false
    };

    return src(options.paths)
        .pipe($.inject(injectStyles, injectOptions))
        .pipe(wiredep(_.extend({}, conf.wiredep)))
        .pipe(dest(path.join(conf.paths.tmp, '/serve')));
};
