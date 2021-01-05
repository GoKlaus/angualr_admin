'use strict';

var path = require('path');
var conf = require('./conf');

var browserSync = require('browser-sync');
const { task, src } = require('gulp');

var $ = require('gulp-load-plugins')();


task('scripts-reload', function() {
    return buildScripts()
        .pipe(browserSync.stream());
});

task('scripts', function() {
    return buildScripts();
});

function buildScripts() {
    return src(path.join(conf.paths.src, '/app/**/*.js'))
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.size())
};