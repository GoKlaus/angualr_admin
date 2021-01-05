'use strict';

const { task, src, dest, series } = require('gulp');
var path = require('path');
var conf = require('./conf');
var _ = require('lodash');
require('./inject');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files']
});





task('dev-fonts', function() {
    return src($.mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe($.flatten())
        .pipe(dest(path.join(conf.paths.devDist, 'fonts')));
});

task('dev-copy-lib', function() {
    var assets = require('wiredep')(_.extend({}, conf.wiredep));
    var srcList = [];
    srcList.push.apply(srcList, assets.js);
    srcList.push.apply(srcList, assets.css);
    return src(srcList/*, { base: '.' }*/)
        /*      .pipe($.rename(function (p) {
                p.dirname = p.dirname.replace(/\\/g, '/').replace('bower_components/', '');
                if (p.dirname.indexOf('/') !== -1) {
                  p.dirname = p.dirname.substr(0, p.dirname.indexOf('/'));
                }
              }))*/
        .pipe(dest(path.join(conf.paths.devDist, 'lib')));
});

task('dev-copy-assets', series(task('inject-task'), task('dev-copy-lib'), task('dev-fonts'), function() {
    return src([
        conf.paths.src + '/**/*',
        path.join(conf.paths.tmp, '/serve/**/*')
    ])
        .pipe(dest(conf.paths.devDist));
}));

task('dev-css-replace', series(task('dev-copy-assets'), function() {
    return src(path.join(conf.paths.devDist, '*.html'))
        .pipe($.replace(/<link rel="stylesheet" href="\.\.\/bower_components\/.*\/(.*)"\s*?\/>/g, '<link rel="stylesheet" href="lib/$1" >'))
        .pipe(dest(conf.paths.devDist));
}));

task('dev-js-replace', series(task('dev-copy-assets'), function() {
    return src(path.join(conf.paths.devDist, '.html'))
        .pipe($.replace(/<script src="\.\.\/bower_components\/.*\/(.*)"\s*?>/g, '<script src="lib/$1">'))
        .pipe(dest(conf.paths.devDist));
}));



task('dev-release', series(task('dev-css-replace'), task('dev-js-replace')));