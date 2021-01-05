'use strict';

var path = require('path');
var conf = require('./conf');

var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');

var util = require('util');
require('./build');
require('./watch');
require('./inject');

var proxyMiddleware = require('http-proxy-middleware');
const { task, series } = require('gulp');

function browserSyncInit(baseDir, browser) {
    browser = browser === undefined ? 'default' : browser;

    var routes = null;
    if (baseDir === conf.paths.src || (Array.isArray(baseDir) && baseDir.indexOf(conf.paths.src) !== -1)) {
        routes = {
            '/bower_components': 'bower_components'
        };
    }

    var server = {
        baseDir: baseDir,
        routes: routes
    };

    /*
     * You can add a proxy to your backend by uncommenting the line below.
     * You just have to configure a context which will we redirected and the target url.
     * Example: $http.get('/users') requests will be automatically proxified.
     *
     * For more details and option, https://github.com/chimurai/http-proxy-middleware/blob/v0.9.0/README.md
     */
    // server.middleware = proxyMiddleware('/users', {target: 'http://jsonplaceholder.typicode.com', changeOrigin: true});

    browserSync.instance = browserSync.init({
        startPath: '/',
        server: server,
        browser: browser,
        ghostMode: false
    });
}

browserSync.use(browserSyncSpa({
    selector: '[ng-app]'// Only needed for angular apps
}));

task('serve', series(task('watch'), function() {
    browserSyncInit([path.join(conf.paths.tmp, '/serve'), conf.paths.src]);
}));

task('serve:dist', series(task('build'), function() {
    browserSyncInit(conf.paths.dist);
}));

task('serve:e2e', series(task('inject-task'), function() {
    browserSyncInit([conf.paths.tmp + '/serve', conf.paths.src], []);
}));

task('serve:e2e-dist', series(task('build'), function() {
    browserSyncInit(conf.paths.dist, []);
}));
