'use strict';

const { task, watch, series } = require('gulp');
var log = require('fancy-log');
var path = require('path');
var conf = require('./conf');
require('./inject');

var browserSync = require('browser-sync');


function isOnlyChange(event) {
    log.info('event is ', event);
    return event.type === 'changed';
}

task('watch', series(task('inject-task'), function(cb) {

    log.info('start');
    watch([path.join(conf.paths.src, '/*.html'), 'bower.json'], task('inject-reload'));

    watch([
        path.join(conf.paths.src, '/sass/**/*.css'),
        path.join(conf.paths.src, '/sass/**/*.scss')
    ], function(event) {
        if (isOnlyChange(event)) {
            task('styles-reload')();
        } else {
            task('inject-reload');
        }
    });

    watch(path.join(conf.paths.src, '/app/**/*.js'), function(event) {
        if (isOnlyChange(event)) {
            task('scripts-reload')();
        } else {
            task('inject-reload')();
        }
    });

    watch(path.join(conf.paths.src, '/app/**/*.html'), function(event) {
        browserSync.reload(event.path);
    });
    log.info('end');
    cb();
}));
